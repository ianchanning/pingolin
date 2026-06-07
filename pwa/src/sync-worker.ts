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

const initDb = async (dbName: string = '/pinboard.db') => {
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
      db = new sqlite3.oo1.OpfsDb(dbName);
      console.log(`SQLite is using OPFS storage: ${dbName}`);
    } else {
      db = new sqlite3.oo1.DB(dbName, 'ct');
      console.warn(`OPFS not available, falling back to transient storage: ${dbName}`);
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
        await initDb(payload?.dbName);
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
        const rows = db.exec({
          sql: 'SELECT COUNT(*) as count FROM bookmarks',
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: rows[0].count, id });
        break;
      }

      case 'GET_LATEST_BOOKMARK_TIME': {
        const rows = db.exec({
          sql: 'SELECT time FROM bookmarks ORDER BY time DESC LIMIT 1',
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        const latestTime = rows.length > 0 ? rows[0].time : null;
        self.postMessage({ type: 'QUERY_RESULTS', payload: latestTime, id });
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

      case 'EXEC': {
        const { sql, bind } = payload;
        db.exec({ sql, bind });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      }

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

      case 'START_HYDRATION':
        // Payload is { proxyUrl, authToken }
        await hydrateArchive(payload.proxyUrl, payload.authToken, id);
        break;

      case 'START_SYNC_LOOP':
        startSyncLoop(payload.proxyUrl, payload.authToken);
        self.postMessage({ type: 'EXEC_SUCCESS', id });
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

const hydrateArchive = async (proxyUrl: string, authToken: string, id: string) => {
  try {
    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: 'NETWORK: Requesting full archive (The Big Pull)...' }, id });

    // Consolidating back to a single /posts/all fetch for maximum reliability.
    // This avoids the latency and timeout issues caused by sequential heavy requests.
    const url = `${proxyUrl}/posts/all?auth_token=${authToken}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Pinboard API Rate Limit (429). Please wait 5 minutes.');
      }
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const bookmarks = await response.json();
    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: `LOCAL: Ingesting ${bookmarks.length} records into SQLite...` }, id });

    // Chunked insertion is purely LOCAL to keep the worker event loop responsive.
    const CHUNK_SIZE = 1000;
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

    // Set the handshake sentinel to unlock the UI
    db.exec({
      sql: 'INSERT INTO metadata (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
      bind: ['last_full_sync_time', new Date().toISOString()]
    });

    self.postMessage({ type: 'SYNC_COMPLETE', payload: { count: bookmarks.length }, id });

  } catch (error) {
    throw error;
  }
};

let syncLoopActive = false;
const startSyncLoop = (proxyUrl: string, authToken: string) => {
  if (syncLoopActive) return;
  syncLoopActive = true;
  console.log('[Worker] Sync Loop Started');

  const tick = async () => {
    try {
      await flushPendingChanges(proxyUrl, authToken);
      await checkForUpdates(proxyUrl, authToken);
    } catch (err) {
      console.error('[Worker] Sync Loop Error:', err);
    }
    setTimeout(tick, 60000); // Check every minute
  };

  tick();
};

const flushPendingChanges = async (proxyUrl: string, authToken: string) => {
  const pending = db.exec({
    sql: "SELECT * FROM bookmarks WHERE sync_status != 'SYNCHRONIZED' ORDER BY local_last_modified ASC",
    returnValue: 'resultRows',
    rowMode: 'object'
  });

  if (pending.length === 0) return;

  console.log(`[Worker] Flushing ${pending.length} pending changes...`);

  for (const b of pending) {
    try {
      if (b.sync_status === 'PENDING_DELETE') {
        await deleteBookmark(proxyUrl, authToken, b.href);
      } else {
        await addBookmark(proxyUrl, authToken, b);
      }

      // Mark as synchronized
      db.exec({
        sql: "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?",
        bind: [b.href]
      });

      // Throttle to respect Pinboard API (3s as per roadmap)
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err) {
      console.error(`[Worker] Failed to flush ${b.href}:`, err);
      // We stop flushing on error to avoid hitting 429 repeatedly
      break;
    }
  }
};

const addBookmark = async (proxyUrl: string, authToken: string, b: any) => {
  const url = new URL(`${proxyUrl}/posts/add`);
  const params = new URLSearchParams({
    auth_token: authToken,
    format: 'json',
    href: b.href,
    description: b.description || '',
    extended: b.extended || '',
    tags: b.tags || '',
    time: b.time,
    replace: 'yes'
  });
  url.search = params.toString();

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Add failed: ${response.status}`);
  const data = await response.json();
  if (data.result_code !== 'done') throw new Error(`Add failed: ${data.result_code}`);
};

const deleteBookmark = async (proxyUrl: string, authToken: string, href: string) => {
  const url = new URL(`${proxyUrl}/posts/delete`);
  const params = new URLSearchParams({
    auth_token: authToken,
    format: 'json',
    url: href
  });
  url.search = params.toString();

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
  const data = await response.json();
  if (data.result_code !== 'done' && data.result_code !== 'item not found') {
    throw new Error(`Delete failed: ${data.result_code}`);
  }
};

const checkForUpdates = async (proxyUrl: string, authToken: string) => {
  // 1. Get last update time from server
  const updateUrl = `${proxyUrl}/posts/update?auth_token=${authToken}&format=json`;
  const response = await fetch(updateUrl);
  if (!response.ok) return;

  const data = await response.json();
  const serverUpdateTime = data.update_time;

  // 2. Get local last sync time
  const meta = db.exec({
    sql: "SELECT value FROM metadata WHERE key = 'last_sync_time'",
    returnValue: 'resultRows'
  });
  let localLastSync = meta.length > 0 ? meta[0][0] : null;

  // Self-Healing: If sentinel is missing but bookmarks exist, adopt latest bookmark time
  if (!localLastSync) {
    const latest = db.exec({
      sql: 'SELECT time FROM bookmarks ORDER BY time DESC LIMIT 1',
      returnValue: 'resultRows'
    });
    if (latest.length > 0) {
      localLastSync = latest[0][0];
      console.log(`[Worker] Self-Healing: Adopted latest bookmark time as sentinel: ${localLastSync}`);
      db.exec({
        sql: "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        bind: [localLastSync]
      });
    }
  }

  if (serverUpdateTime !== localLastSync) {
    console.log(`[Worker] Update detected: ${localLastSync} -> ${serverUpdateTime}`);
    await performDeltaSync(proxyUrl, authToken, localLastSync, serverUpdateTime);
  } else {
    // Even if updates are the same, we check for deletions via Dates Hack
    // every few cycles or just always if it's cheap.
    await performDatesHack(proxyUrl, authToken);
  }
};

const performDeltaSync = async (proxyUrl: string, authToken: string, fromdt: string, serverTime: string) => {
  console.log('[Worker] Performing Delta Sync...');
  const url = `${proxyUrl}/posts/all?auth_token=${authToken}&format=json${fromdt ? `&fromdt=${fromdt}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) return;

  const bookmarks = await response.json();
  if (bookmarks.length > 0) {
    // Reuse UPSERT_BATCH logic or similar
    // For simplicity, we just use the same logic as hydrateArchive but without progress
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
    console.log(`[Worker] Delta sync ingested ${bookmarks.length} records.`);
  }

  // Update sentinel
  db.exec({
    sql: "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    bind: [serverTime]
  });

  self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: 'Delta sync complete.' } });
};

const performDatesHack = async (proxyUrl: string, authToken: string) => {
  console.log('[Worker] Checking for invisible deletions (Dates Hack)...');
  const url = `${proxyUrl}/posts/dates?auth_token=${authToken}&format=json`;
  const response = await fetch(url);
  if (!response.ok) return;

  const serverDates = (await response.json()).dates;
  const localDates = db.exec({
    sql: `
      SELECT strftime('%Y-%m-%d', time) as date_str, COUNT(*) as qty 
      FROM bookmarks 
      GROUP BY date_str
    `,
    returnValue: 'resultRows',
    rowMode: 'object'
  });

  for (const row of localDates) {
    const serverCount = parseInt(serverDates[row.date_str] || '0');
    if (row.qty > serverCount) {
      console.log(`[Worker] Dates Hack: Mismatch on ${row.date_str} (Local: ${row.qty}, Server: ${serverCount}). Reconciling...`);
      await reconcileDate(proxyUrl, authToken, row.date_str);
    }
  }
};

const reconcileDate = async (proxyUrl: string, authToken: string, date: string) => {
  const url = `${proxyUrl}/posts/get?auth_token=${authToken}&format=json&dt=${date}`;
  const response = await fetch(url);
  if (!response.ok) return;

  const data = await response.json();
  const serverBookmarks = data.posts;

  // Trigger the existing RECONCILE_DATE logic in worker
  // Actually we can just call the logic directly here
  const serverHrefs = new Set(serverBookmarks.map((b: any) => b.href));
  db.transaction((db: any) => {
    const localRecords = db.exec({
      sql: "SELECT href FROM bookmarks WHERE strftime('%Y-%m-%d', time) = ?",
      bind: [date],
      returnValue: 'resultRows',
      rowMode: 'object'
    });

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
};
