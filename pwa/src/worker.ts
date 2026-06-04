import sqlite3InitModule from './vendor/sqlite3-bundler-friendly.mjs';

/**
 * Pinboard PWA - Background Worker
 * Handles all database operations using SQLite WASM + OPFS.
 */

let db: any = null;

const SCHEMA = `
-- Relational Store
CREATE TABLE IF NOT EXISTS bookmarks (
    href TEXT PRIMARY KEY,
    description TEXT, -- Pinboard Title
    extended TEXT,    -- Pinboard Description/Notes
    tags TEXT,        -- Space-separated tag list
    time TEXT NOT NULL,
    sync_status TEXT DEFAULT 'SYNCHRONIZED', -- 'SYNCHRONIZED', 'PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE'
    local_last_modified INTEGER NOT NULL
);

-- Tag Aliases Table
CREATE TABLE IF NOT EXISTS tag_aliases (
    keyword TEXT PRIMARY KEY,
    mapped_tag TEXT NOT NULL
);

-- Metadata for Sync state
CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- FTS5 Search Table
CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
    href UNINDEXED,
    description,
    extended,
    tags,
    content='bookmarks',
    content_rowid='rowid'
);

-- Trigger to keep FTS5 in sync with bookmarks
CREATE TRIGGER IF NOT EXISTS bookmarks_ai AFTER INSERT ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(rowid, href, description, extended, tags)
  VALUES (new.rowid, new.href, new.description, new.extended, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS bookmarks_ad AFTER DELETE ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(bookmarks_fts, rowid, href, description, extended, tags)
  VALUES('delete', old.rowid, old.href, old.description, old.extended, old.tags);
END;

CREATE TRIGGER IF NOT EXISTS bookmarks_au AFTER UPDATE ON bookmarks BEGIN
  INSERT INTO bookmarks_fts(bookmarks_fts, rowid, href, description, extended, tags)
  VALUES('delete', old.rowid, old.href, old.description, old.extended, old.tags);
  INSERT INTO bookmarks_fts(rowid, href, description, extended, tags)
  VALUES (new.rowid, new.href, new.description, new.extended, new.tags);
END;
`;

const initDb = async () => {
  try {
    const sqlite3 = await sqlite3InitModule({
      print: console.debug,
      printErr: console.error,
      locateFile: (file) => `/vendor/${file}`,
    });

    // --- FIX 1: Enforce the print configuration directly onto the runtime context ---
    const handleSqlTrace = (...args) => console.debug(...args);

    sqlite3.config.print = handleSqlTrace;
    sqlite3.config.printErr = console.error;

    // Also override the underlying internal module printer channels
    if (sqlite3.capi) {
      sqlite3.capi.print = handleSqlTrace;
    }
    // -------------------------------------------------------------------------------

    console.log('Running SQLite3 version', sqlite3.version.libVersion);

    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/pinboard.db');
      console.log('SQLite is using OPFS storage.');
    } else {
      db = new sqlite3.oo1.DB('/pinboard.db', 'ct');
      console.warn('OPFS not available, falling back to transient storage.');
    }

    // --- FIX 2: Manually clear the native engine C-level tracing hooks if active ---
    if (sqlite3.capi && typeof sqlite3.capi.sqlite3_trace_v2 === 'function') {
      // 0 disables the trace flag masks completely at the C-layer
      sqlite3.capi.sqlite3_trace_v2(db.pointer, 0, 0, 0);
    }
    // -------------------------------------------------------------------------------

    // Run Schema
    db.exec(SCHEMA);

    // Performance Optimizations for OPFS
    db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA synchronous=NORMAL;
      PRAGMA cache_size=-64000; -- 64MB cache
    `);

    console.log('Database schema initialized and optimized.');

    return true;
  } catch (err) {
    console.error('Failed to initialize SQLite:', err);
    throw err;
  }
};

// Message Handler
self.onmessage = async (e) => {
  const { type, payload, id } = e.data;
  console.log(`[Worker] Received: ${type} (${id})`);

  try {
    switch (type) {
      case 'INIT':
        await initDb();
        self.postMessage({ type: 'INIT_SUCCESS', id });
        break;

      case 'QUERY_SEARCH': {
        // Payload is the search term
        let sql = '';
        let bind: any[] = [];

        if (payload.startsWith('#')) {
          // Exact Tag Match mode
          const tagName = payload.substring(1);
          sql = `
            SELECT * FROM bookmarks 
            WHERE (' ' || tags || ' ') LIKE ?
            ORDER BY time DESC
          `;
          bind = [`% ${tagName} %`];
        } else {
          // General FTS5 mode - Wrap in quotes to avoid syntax errors with colons/dots
          sql = `
            SELECT b.* FROM bookmarks_fts f
            JOIN bookmarks b ON f.rowid = b.rowid
            WHERE bookmarks_fts MATCH ?
            ORDER BY b.time DESC
          `;
          // Sanitize: Escape any existing quotes and wrap the whole thing
          const sanitized = payload.replace(/"/g, '""');
          bind = [`"${sanitized}"`];
        }

        const results = db.exec({
          sql: sql,
          bind: bind,
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: results, id });
        break;
      }

      case 'QUERY_ALL':
        const all = db.exec({
          sql: 'SELECT * FROM bookmarks ORDER BY time DESC',
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: all, id });
        break;

      case 'UPSERT_BATCH':
        // Payload is an array of bookmark objects from server
        db.transaction((db: any) => {
          const insertStmt = db.prepare(`
            INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified)
            VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?)
          `);

          const updateStmt = db.prepare(`
            UPDATE bookmarks SET
              description=?, extended=?, tags=?, time=?, local_last_modified=?
            WHERE href=?
          `);

          const getStmt = db.prepare('SELECT * FROM bookmarks WHERE href=?');

          for (const b of payload) {
            getStmt.bind([b.href]);
            const existing = getStmt.step() ? getStmt.get([]) : null;
            getStmt.reset();

            if (!existing) {
              // New record from server
              insertStmt.bind([b.href, b.description, b.extended, b.tags, b.time, Date.now()]);
              insertStmt.step();
              insertStmt.reset();
            } else if (existing.sync_status === 'SYNCHRONIZED') {
              // Existing clean record: Overwrite with server data
              updateStmt.bind([b.description, b.extended, b.tags, b.time, Date.now(), b.href]);
              updateStmt.step();
              updateStmt.reset();
            } else if (existing.sync_status === 'PENDING_UPDATE') {
              // CONFLICT: Merge & Overwrite
              // 1. Tags: Union of local and server
              const localTags = new Set((existing.tags || '').split(' ').filter(Boolean));
              const serverTags = (b.tags || '').split(' ').filter(Boolean);
              serverTags.forEach(t => localTags.add(t));
              const mergedTags = Array.from(localTags).join(' ');

              // 2. Metadata: Local overwrites server (so we keep existing values)
              // 3. State: Remains PENDING_UPDATE
              updateStmt.bind([existing.description, existing.extended, mergedTags, existing.time, Date.now(), b.href]);
              updateStmt.step();
              updateStmt.reset();
            }
          }
          insertStmt.finalize();
          updateStmt.finalize();
          getStmt.finalize();
        });
        self.postMessage({ type: 'UPSERT_SUCCESS', id });
        break;

      case 'LOCAL_UPSERT':
        // Payload is a single bookmark object
        db.transaction((db: any) => {
          const now = Date.now();
          const existing = db.exec({
            sql: 'SELECT sync_status FROM bookmarks WHERE href = ?',
            bind: [payload.href],
            returnValue: 'resultRows'
          });

          const status = existing.length > 0 ? 'PENDING_UPDATE' : 'PENDING_INSERT';

          db.exec({
            sql: `
              INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(href) DO UPDATE SET
                description=excluded.description,
                extended=excluded.extended,
                tags=excluded.tags,
                time=excluded.time,
                sync_status=excluded.sync_status,
                local_last_modified=excluded.local_last_modified
            `,
            bind: [
              payload.href,
              payload.description,
              payload.extended,
              payload.tags,
              payload.time || new Date().toISOString(),
              status,
              now
            ]
          });
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;

      case 'GET_METADATA': {
        const meta = db.exec({
          sql: 'SELECT * FROM metadata WHERE key = ?',
          bind: [payload],
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: meta[0] || null, id });
        break;
      }

      case 'SET_METADATA':
        db.exec({
          sql: 'INSERT INTO metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
          bind: [payload.key, payload.value]
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;

      case 'GET_PENDING': {
        const pending = db.exec({
          sql: "SELECT * FROM bookmarks WHERE sync_status != 'SYNCHRONIZED'",
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: pending, id });
        break;
      }

      case 'QUERY_DATE_COUNTS': {
        const counts = db.exec({
          sql: `
            SELECT strftime('%Y-%m-%d', time) as date_str, COUNT(*) as qty 
            FROM bookmarks 
            GROUP BY date_str
          `,
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: counts, id });
        break;
      }

      case 'GET_BOOKMARK_COUNT': {
        const rowCount = db.exec({
          sql: 'SELECT COUNT(*) as count FROM bookmarks',
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: rowCount[0].count, id });
        break;
      }

      case 'GET_POPULAR_TAGS': {
        const tagRows = db.exec({
          sql: 'SELECT tags FROM bookmarks',
          returnValue: 'resultRows',
          rowMode: 'object'
        });

        const counts: Record<string, number> = {};
        for (const row of tagRows) {
          const tList = (row.tags || '').split(' ').filter(Boolean);
          for (const t of tList) {
            counts[t] = (counts[t] || 0) + 1;
          }
        }

        const sortedTags = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 200)
          .map(e => e[0]);

        self.postMessage({ type: 'QUERY_RESULTS', payload: sortedTags, id });
        break;
      }

      case 'RECONCILE_DATE':
        // Payload: { date: 'YYYY-MM-DD', bookmarks: [...] }
        db.transaction((db: any) => {
          const { date, bookmarks } = payload;
          const serverHrefs = new Set(bookmarks.map((b: any) => b.href));

          // 1. Get local records for this date
          const localRecords = db.exec({
            sql: "SELECT href FROM bookmarks WHERE strftime('%Y-%m-%d', time) = ?",
            bind: [date],
            returnValue: 'resultRows',
            rowMode: 'object'
          });

          // 2. Delete local records not in server list
          const deleteStmt = db.prepare('DELETE FROM bookmarks WHERE href = ?');
          for (const row of localRecords) {
            if (!serverHrefs.has(row.href)) {
              console.log(`[Worker] Dates Hack: Pruning deleted bookmark ${row.href}`);
              deleteStmt.bind([row.href]);
              deleteStmt.step();
              deleteStmt.reset();
            }
          }
          deleteStmt.finalize();
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;

      case 'LOCAL_DELETE':
        // Payload is href
        db.exec({
          sql: "UPDATE bookmarks SET sync_status = 'PENDING_DELETE', local_last_modified = ? WHERE href = ?",
          bind: [Date.now(), payload]
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;

      case 'SET_SYNCHRONIZED': {
        // Payload is href
        db.transaction((db: any) => {
          const existing = db.exec({
            sql: 'SELECT sync_status FROM bookmarks WHERE href = ?',
            bind: [payload],
            returnValue: 'resultRows',
            rowMode: 'object'
          });

          if (existing.length > 0 && existing[0].sync_status === 'PENDING_DELETE') {
            db.exec({
              sql: 'DELETE FROM bookmarks WHERE href = ?',
              bind: [payload]
            });
          } else {
            db.exec({
              sql: "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?",
              bind: [payload]
            });
          }
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      }

      case 'GET_TAG_ALIASES': {
        const aliases = db.exec({
          sql: 'SELECT * FROM tag_aliases',
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: aliases, id });
        break;
      }

      case 'UPSERT_TAG_ALIAS':
        db.exec({
          sql: 'INSERT INTO tag_aliases (keyword, mapped_tag) VALUES (?, ?) ON CONFLICT(keyword) DO UPDATE SET mapped_tag=excluded.mapped_tag',
          bind: [payload.keyword, payload.mapped_tag]
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;

      case 'SUGGEST_TAGS_HISTORY': {
        // Payload: query string from title/url
        const historyResults = db.exec({
          sql: `
            SELECT b.tags FROM bookmarks_fts f
            JOIN bookmarks b ON f.rowid = b.rowid
            WHERE bookmarks_fts MATCH ?
            LIMIT 50
          `,
          bind: [payload],
          returnValue: 'resultRows',
          rowMode: 'object'
        });

        const tagCounts: Record<string, number> = {};
        for (const row of historyResults) {
          const tags = (row.tags || '').split(' ').filter(Boolean);
          for (const t of tags) {
            tagCounts[t] = (tagCounts[t] || 0) + 1;
          }
        }

        // Return top 5 tags sorted by frequency
        const topTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);

        self.postMessage({ type: 'QUERY_RESULTS', payload: topTags, id });
        break;
      }

      case 'DEBUG_CLEAR_DB':
        db.transaction((db: any) => {
          // Drop tables to bypass slow triggers
          db.exec('DROP TABLE IF EXISTS bookmarks');
          db.exec('DROP TABLE IF EXISTS bookmarks_fts');
          db.exec('DROP TABLE IF EXISTS tag_aliases');
          db.exec('DROP TABLE IF EXISTS metadata');
          // Recreate everything
          db.exec(SCHEMA);
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;

      case 'FETCH_ALL_SERVER':
        // Payload is { proxyUrl, authToken }
        await fetchAllFromServer(payload.proxyUrl, payload.authToken, id);
        break;

      case 'BOOTSTRAP_SYNC':
        // Payload is { proxyUrl, authToken }
        await bootstrapSync(payload.proxyUrl, payload.authToken, id);
        break;

      case 'START_HYDRATION':
        // Payload is { proxyUrl, authToken, startIndex }
        await hydrateArchive(payload.proxyUrl, payload.authToken, payload.startIndex || 0, id);
        break;

      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: (error as Error).message,
      id
    });
  }
};

const hydrateArchive = async (proxyUrl: string, authToken: string, startIndex: number, id: string) => {
  const PAGE_SIZE = 1000;
  let offset = startIndex;
  let hasMore = true;
  let consecutiveErrors = 0;

  try {
    // 1. Get total count estimate from /posts/dates if possible, or just use a large number for progress
    // For now, we'll just report progress based on records fetched.

    while (hasMore) {
      self.postMessage({
        type: 'SYNC_PROGRESS',
        payload: { status: `HYDRATION: Fetching records ${offset} to ${offset + PAGE_SIZE}...` },
        id
      });

      const url = `${proxyUrl}/posts/all?auth_token=${authToken}&start=${offset}&results=${PAGE_SIZE}&format=json`;

      let response;
      try {
        response = await fetch(url);
      } catch (fetchErr) {
        console.error('[Worker] Fetch error during hydration:', fetchErr);
        consecutiveErrors++;
        if (consecutiveErrors > 3) throw new Error('Too many network failures during hydration.');
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      if (!response.ok) {
        if (response.status === 429) {
          const backoff = 60000 * Math.pow(2, consecutiveErrors);
          self.postMessage({
            type: 'SYNC_PROGRESS',
            payload: { status: `RATE LIMITED (429): Backing off for ${backoff / 1000}s...` },
            id
          });
          await new Promise(resolve => setTimeout(resolve, backoff));
          consecutiveErrors++;
          continue;
        }
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      consecutiveErrors = 0;
      const bookmarks = await response.json();

      if (!bookmarks || bookmarks.length === 0) {
        hasMore = false;
        break;
      }

      self.postMessage({
        type: 'SYNC_PROGRESS',
        payload: { status: `HYDRATION: Ingesting ${bookmarks.length} records...` },
        id
      });

      db.transaction((db: any) => {
        const stmt = db.prepare(`
          INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified)
          VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?)
          ON CONFLICT(href) DO UPDATE SET
            description=excluded.description,
            extended=excluded.extended,
            tags=excluded.tags,
            time=excluded.time,
            local_last_modified=excluded.local_last_modified
        `);
        for (const b of bookmarks) {
          stmt.bind([b.href, b.description, b.extended, b.tags, b.time, Date.now()]);
          stmt.step();
          stmt.reset();
        }
        stmt.finalize();
      });

      offset += bookmarks.length;

      // Track Progress (if we had a total, we'd use it here)
      self.postMessage({
        type: 'SYNC_PROGRESS',
        payload: {
          status: `HYDRATION: Ingested total ${offset} records.`,
          progress: -1 // Indeterminate progress until we have total
        },
        id
      });

      if (bookmarks.length < PAGE_SIZE) {
        hasMore = false;
      } else {
        // Phase 4.1: Mandatory Throttling Delay (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    self.postMessage({ type: 'SYNC_COMPLETE', payload: { count: offset }, id });

  } catch (error) {
    throw error;
  }
};

const bootstrapSync = async (proxyUrl: string, authToken: string, id: string) => {
  try {
    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: 'BOOTSTRAP: Fetching recent bookmarks...' }, id });

    // Pinboard /posts/recent returns the most recent 100 bookmarks by default (max 100)
    const url = `${proxyUrl}/posts/recent?auth_token=${authToken}&count=100&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Pinboard API Rate Limit (429). Please wait 5 minutes.');
      }
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const bookmarks = data.posts || [];

    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: `BOOTSTRAP: Ingesting ${bookmarks.length} records...` }, id });

    db.transaction((db: any) => {
      const stmt = db.prepare(`
        INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified)
        VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?)
        ON CONFLICT(href) DO UPDATE SET
          description=excluded.description,
          extended=excluded.extended,
          tags=excluded.tags,
          time=excluded.time,
          local_last_modified=excluded.local_last_modified
      `);
      for (const b of bookmarks) {
        stmt.bind([b.href, b.description, b.extended, b.tags, b.time, Date.now()]);
        stmt.step();
        stmt.reset();
      }
      stmt.finalize();
    });

    self.postMessage({ type: 'BOOTSTRAP_COMPLETE', payload: { count: bookmarks.length }, id });

  } catch (error) {
    throw error;
  }
};

const fetchAllFromServer = async (proxyUrl: string, authToken: string, id: string) => {
  try {
    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: 'NETWORK: Requesting full dataset...' }, id });

    const url = `${proxyUrl}/posts/all?auth_token=${authToken}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Pinboard API Rate Limit (429). Please wait 5 minutes.');
      }
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    // Pinboard /posts/all returns the entire array in ONE response.
    let bookmarks = await response.json();

    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: `LOCAL: Ingesting ${bookmarks.length} records into SQLite...` }, id });

    // Chunked insertion is purely LOCAL to keep the UI responsive.
    // There are NO network requests happening during this loop.
    const CHUNK_SIZE = 500;

    for (let i = 0; i < bookmarks.length; i += CHUNK_SIZE) {
      const chunk = bookmarks.slice(i, i + CHUNK_SIZE);

      db.transaction((db: any) => {
        const stmt = db.prepare(`
          INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified)
          VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?)
          ON CONFLICT(href) DO UPDATE SET
            description=excluded.description,
            extended=excluded.extended,
            tags=excluded.tags,
            time=excluded.time,
            local_last_modified=excluded.local_last_modified
        `);
        for (const b of chunk) {
          stmt.bind([b.href, b.description, b.extended, b.tags, b.time, Date.now()]);
          stmt.step();
          stmt.reset();
        }
        stmt.finalize();
      });

      self.postMessage({
        type: 'SYNC_PROGRESS',
        payload: {
          status: `LOCAL: Ingested ${Math.min(i + CHUNK_SIZE, bookmarks.length)} / ${bookmarks.length}`,
          progress: (i + CHUNK_SIZE) / bookmarks.length
        },
        id
      });

      // Micro-yield to allow the worker event loop to process messages
      await new Promise(resolve => setTimeout(resolve, 0));
    }


    self.postMessage({ type: 'SYNC_COMPLETE', payload: { count: bookmarks.length }, id });

  } catch (error) {
    throw error;
  }
};
