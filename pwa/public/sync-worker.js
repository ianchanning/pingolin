import sqlite3InitModule from '/vendor/sqlite3-bundler-friendly.mjs';

/**
 * Pinboard PWA - Background Worker (Steel & Stone Edition)
 * Phase 2: Sync Orchestrator & Logic
 */

let db = null;
let dbPromise = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS bookmarks (
    href TEXT PRIMARY KEY,
    description TEXT,
    extended TEXT,
    tags TEXT,
    time TEXT NOT NULL,
    sync_status TEXT DEFAULT 'SYNCHRONIZED',
    local_last_modified INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tag_aliases (
    keyword TEXT PRIMARY KEY,
    mapped_tag TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
    href UNINDEXED, description, extended, tags, content='bookmarks', content_rowid='rowid'
);

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

const initDb = async (dbName = '/pinboard.db') => {
  if (db) return true;
  try {
    const sqlite3 = await sqlite3InitModule({
      print: console.debug,
      printErr: console.error,
      locateFile: (file) => `/vendor/${file}`,
    });

    if (sqlite3.opfs) {
      db = new sqlite3.oo1.OpfsDb(dbName);
      console.log('[Worker] OPFS Database:', dbName);
    } else {
      db = new sqlite3.oo1.DB(dbName, 'ct');
      console.warn('[Worker] Transient Storage:', dbName);
    }

    db.transaction((db) => {
      db.exec(SCHEMA);
    });

    db.exec('PRAGMA cache_size = 2000;');
    db.exec('PRAGMA synchronous = NORMAL;');

    console.log('[Worker] Database Ritual Complete.');

    // Check for existing session
    const meta = db.exec({
      sql: "SELECT value FROM metadata WHERE key = 'last_full_sync_time'",
      returnValue: 'resultRows',
      rowMode: 'object'
    });

    if (meta.length > 0) {
      console.log('[Worker] Session Detected:', meta[0].value);
      self.postMessage({ type: 'SESSION_RESTORED', payload: meta[0].value });
    }

    return true;
  } catch (error) {
    console.error('[Worker] Initialization Failure:', error);
    throw error;
  }
};

let syncLoopActive = false;
let syncInterval = 60000;
let apiThrottle = 3000;

const startSyncLoop = (proxyUrl, authToken) => {
  if (syncLoopActive) return;
  syncLoopActive = true;
  console.log(`[Worker] Heartbeat Started (${syncInterval}ms)`);

  const tick = async () => {
    try {
      await flushPendingChanges(proxyUrl, authToken);
      await checkForUpdates(proxyUrl, authToken);
    } catch (err) {
      console.error('[Worker] Heartbeat Error:', err);
    }
    setTimeout(tick, syncInterval);
  };

  tick();
};

const renameTagWorkaround = async (oldTag, newTag, proxyUrl, authToken, id) => {
  try {
    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: `Renaming tag: ${oldTag} -> ${newTag}...` }, id });

    const bookmarks = db.exec({
      sql: "SELECT * FROM bookmarks WHERE (' ' || tags || ' ') LIKE ?",
      bind: [`% ${oldTag} %`],
      returnValue: 'resultRows',
      rowMode: 'object'
    });

    for (const b of bookmarks) {
      const tags = b.tags.split(' ').map(t => t === oldTag ? newTag : t).join(' ');
      db.exec({
        sql: "UPDATE bookmarks SET tags = ?, sync_status = 'PENDING_UPDATE', local_last_modified = ? WHERE href = ?",
        bind: [tags, Date.now(), b.href]
      });

      await addBookmark(proxyUrl, authToken, { ...b, tags });
      
      db.exec({
        sql: "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?",
        bind: [b.href]
      });

      await new Promise(resolve => setTimeout(resolve, apiThrottle));
    }

    const deleteUrl = new URL(`${proxyUrl}/tags/delete`);
    deleteUrl.search = new URLSearchParams({ auth_token: authToken, format: 'json', tag: oldTag }).toString();

    const delRes = await fetch(deleteUrl.toString());
    if (!delRes.ok) throw new Error(`Tag delete failed: ${delRes.status}`);

    self.postMessage({ type: 'EXEC_SUCCESS', id });
    self.postMessage({ type: 'REFRESH_REQUIRED' });
    refreshPopularTags('popular-tags');

  } catch (err) {
    console.error('[Worker] Rename Failure:', err);
    throw err;
  }
};

const flushPendingChanges = async (proxyUrl, authToken) => {
  const pending = db.exec({
    sql: "SELECT * FROM bookmarks WHERE sync_status != 'SYNCHRONIZED' ORDER BY local_last_modified ASC",
    returnValue: 'resultRows',
    rowMode: 'object'
  });

  if (pending.length === 0) return;

  console.log(`[Worker] Flushing ${pending.length} changes...`);

  for (const b of pending) {
    try {
      if (b.sync_status === 'PENDING_DELETE') {
        await deleteBookmark(proxyUrl, authToken, b.href);
      } else {
        await addBookmark(proxyUrl, authToken, b);
      }

      db.exec({
        sql: "UPDATE bookmarks SET sync_status = 'SYNCHRONIZED' WHERE href = ?",
        bind: [b.href]
      });

      await new Promise(resolve => setTimeout(resolve, apiThrottle));
    } catch (err) {
      console.error(`[Worker] Flush Failure ${b.href}:`, err);
      break;
    }
  }
  self.postMessage({ type: 'REFRESH_REQUIRED' });
};

const checkForUpdates = async (proxyUrl, authToken) => {
  try {
    const url = `${proxyUrl}/posts/update?auth_token=${authToken}&format=json`;
    const response = await fetch(url);
    if (!response.ok) return;

    const { update_time } = await response.json();
    
    const lastSync = db.exec({
      sql: "SELECT value FROM metadata WHERE key = 'last_sync_time'",
      returnValue: 'resultRows',
      rowMode: 'object'
    });

    let lastSyncTime = lastSync.length > 0 ? lastSync[0].value : null;

    if (!lastSyncTime) {
      const latest = db.exec({ sql: 'SELECT time FROM bookmarks ORDER BY time DESC LIMIT 1', returnValue: 'resultRows', rowMode: 'object' });
      if (latest.length > 0) {
        lastSyncTime = latest[0].time;
        db.exec({ sql: "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", bind: [lastSyncTime] });
      }
    }

    if (update_time !== lastSyncTime) {
      await performDeltaSync(proxyUrl, authToken, lastSyncTime, update_time);
      await performDatesHack(proxyUrl, authToken);
    }
  } catch (err) {
    console.error('[Worker] Update Check Failure:', err);
  }
};

const performDeltaSync = async (proxyUrl, authToken, fromDt, serverTime) => {
  const url = `${proxyUrl}/posts/all?auth_token=${authToken}&format=json&fromdt=${fromDt || ''}`;
  const response = await fetch(url);
  if (!response.ok) return;

  const bookmarks = await response.json();
  if (bookmarks.length > 0) {
    db.transaction((db) => {
      const stmt = db.prepare("INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified) VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?) ON CONFLICT(href) DO UPDATE SET description=excluded.description, extended=excluded.extended, tags=excluded.tags, time=excluded.time, local_last_modified=excluded.local_last_modified");
      for (const b of bookmarks) {
        stmt.bind([b.href, b.description, b.extended || '', b.tags, b.time, Date.now()]);
        stmt.step();
        stmt.reset();
      }
      stmt.finalize();
    });
    self.postMessage({ type: 'REFRESH_REQUIRED' });
    refreshPopularTags('popular-tags');
  }

  db.exec({ sql: "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", bind: [serverTime] });
  self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: 'Delta complete.' } });
};

const performDatesHack = async (proxyUrl, authToken) => {
  const url = `${proxyUrl}/posts/dates?auth_token=${authToken}&format=json`;
  const response = await fetch(url);
  if (!response.ok) return;

  const data = await response.json();
  const serverDates = data.dates || {};
  const localDates = db.exec({ sql: "SELECT strftime('%Y-%m-%d', time) as date_str, COUNT(*) as qty FROM bookmarks GROUP BY date_str", returnValue: 'resultRows', rowMode: 'object' });

  for (const row of localDates) {
    const serverCount = parseInt(serverDates[row.date_str] || '0');
    if (row.qty > serverCount) {
      await reconcileDate(proxyUrl, authToken, row.date_str);
    }
  }
};

const reconcileDate = async (proxyUrl, authToken, date) => {
  const url = `${proxyUrl}/posts/get?auth_token=${authToken}&format=json&dt=${date}`;
  const response = await fetch(url);
  if (!response.ok) return;

  const data = await response.json();
  const serverBookmarks = data.posts || (Array.isArray(data) ? data : []);
  const serverHrefs = new Set(serverBookmarks.map((b) => b.href));
  let deletedCount = 0;

  db.transaction((db) => {
    const localRecords = db.exec({ sql: "SELECT href FROM bookmarks WHERE strftime('%Y-%m-%d', time) = ?", bind: [date], returnValue: 'resultRows', rowMode: 'object' });
    const deleteStmt = db.prepare('DELETE FROM bookmarks WHERE href = ?');
    for (const row of localRecords) {
      if (!serverHrefs.has(row.href)) {
        deleteStmt.bind([row.href]);
        deleteStmt.step();
        deleteStmt.reset();
        deletedCount++;
      }
    }
    deleteStmt.finalize();
  });

  if (deletedCount > 0) {
    self.postMessage({ type: 'REFRESH_REQUIRED' });
    refreshPopularTags('popular-tags');
  }
};

const addBookmark = async (proxyUrl, authToken, b) => {
  const url = new URL(`${proxyUrl}/posts/add`);
  url.search = new URLSearchParams({ auth_token: authToken, format: 'json', url: b.href, description: b.description, extended: b.extended || '', tags: b.tags, dt: b.time, replace: 'yes' }).toString();
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Add failed: ${res.status}`);
};

const deleteBookmark = async (proxyUrl, authToken, href) => {
  const url = new URL(`${proxyUrl}/posts/delete`);
  url.search = new URLSearchParams({ auth_token: authToken, format: 'json', url: href }).toString();
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
};

const refreshPopularTags = (id) => {
  const tagRows = db.exec({ sql: 'SELECT tags FROM bookmarks', returnValue: 'resultRows', rowMode: 'object' });
  const aliasRows = db.exec({ sql: 'SELECT mapped_tag FROM tag_aliases', returnValue: 'resultRows', rowMode: 'object' });
  
  const counts = {};
  for (const row of tagRows) {
    const tList = (row.tags || '').split(' ').filter(Boolean);
    for (const t of tList) counts[t] = (counts[t] || 0) + 1;
  }
  
  // Add aliases with high priority (virtual count)
  for (const row of aliasRows) {
    counts[row.mapped_tag] = (counts[row.mapped_tag] || 0) + 1000;
  }

  const sortedTags = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  self.postMessage({ type: 'QUERY_RESULTS', payload: sortedTags, id });
};

self.onmessage = async (e) => {
  const { type, payload, id } = e.data;
  try {
    if (type === 'INIT') {
      if (!dbPromise) dbPromise = initDb(payload?.dbName);
      await dbPromise;
      self.postMessage({ type: 'INIT_SUCCESS', id });
      return;
    }

    if (!db && dbPromise) await dbPromise;
    if (!db) {
      dbPromise = initDb();
      await dbPromise;
    }

    switch (type) {
      case 'QUERY_SEARCH': {
        if (!payload || payload.trim() === '') {
          const all = db.exec({ sql: 'SELECT * FROM bookmarks ORDER BY time DESC', returnValue: 'resultRows', rowMode: 'object' });
          self.postMessage({ type: 'QUERY_RESULTS', payload: all, id });
          break;
        }

        const aliasRows = db.exec({ sql: 'SELECT mapped_tag FROM tag_aliases WHERE keyword = ?', bind: [payload.toLowerCase()], returnValue: 'resultRows', rowMode: 'object' });
        const effectiveQuery = aliasRows.length > 0 ? aliasRows[0].mapped_tag : payload;
        let sql = effectiveQuery.startsWith('#') 
          ? "SELECT * FROM bookmarks WHERE (' ' || tags || ' ') LIKE ? ORDER BY time DESC" 
          : "SELECT b.* FROM bookmarks b JOIN bookmarks_fts f ON b.rowid = f.rowid WHERE bookmarks_fts MATCH ? ORDER BY b.time DESC";
        const bind = effectiveQuery.startsWith('#') ? [`% ${effectiveQuery.substring(1)} %`] : [`"${effectiveQuery.replace(/"/g, '""')}"`];
        const results = db.exec({ sql, bind, returnValue: 'resultRows', rowMode: 'object' });
        self.postMessage({ type: 'QUERY_RESULTS', payload: results, id });
        break;
      }
      case 'QUERY_ALL':
        const all = db.exec({ sql: 'SELECT * FROM bookmarks ORDER BY time DESC', returnValue: 'resultRows', rowMode: 'object' });
        self.postMessage({ type: 'QUERY_RESULTS', payload: all, id });
        break;
      case 'LOCAL_UPSERT':
        db.transaction((db) => {
          const now = Date.now();
          const existing = db.exec({ sql: 'SELECT sync_status FROM bookmarks WHERE href = ?', bind: [payload.href], returnValue: 'resultRows' });
          const status = existing.length > 0 ? 'PENDING_UPDATE' : 'PENDING_INSERT';
          db.exec({
            sql: "INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(href) DO UPDATE SET description=excluded.description, extended=excluded.extended, tags=excluded.tags, time=excluded.time, sync_status=excluded.sync_status, local_last_modified=excluded.local_last_modified",
            bind: [payload.href, payload.description, payload.extended || '', payload.tags, payload.time || new Date().toISOString(), status, now]
          });
        });
        self.postMessage({ type: 'REFRESH_REQUIRED' });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        refreshPopularTags('popular-tags');
        break;
      case 'LOCAL_DELETE':
        db.exec({ sql: "UPDATE bookmarks SET sync_status = 'PENDING_DELETE', local_last_modified = ? WHERE href = ?", bind: [Date.now(), payload] });
        self.postMessage({ type: 'REFRESH_REQUIRED' });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      case 'QUERY':
        const results = db.exec({ sql: payload.sql, bind: payload.bind, returnValue: 'resultRows', rowMode: 'object' });
        self.postMessage({ type: 'QUERY_RESULTS', payload: results, id });
        break;
      case 'EXEC':
        db.exec({ sql: payload.sql, bind: payload.bind });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      case 'GET_POPULAR_TAGS':
        refreshPopularTags(id);
        break;
      case 'UPSERT_TAG_ALIAS':
        db.exec({ sql: 'INSERT INTO tag_aliases (keyword, mapped_tag) VALUES (?, ?) ON CONFLICT(keyword) DO UPDATE SET mapped_tag=excluded.mapped_tag', bind: [payload.keyword, payload.mapped_tag] });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      case 'RENAME_TAG':
        await renameTagWorkaround(payload.oldTag, payload.newTag, payload.proxyUrl, payload.authToken, id);
        break;
      case 'START_HYDRATION':
        await hydrateArchive(payload.proxyUrl, payload.authToken, id);
        break;
      case 'START_SYNC_LOOP':
        startSyncLoop(payload.proxyUrl, payload.authToken);
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      case 'SET_SYNC_INTERVAL':
        syncInterval = payload;
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      case 'SET_THROTTLE':
        apiThrottle = payload;
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      case 'DEBUG_CLEAR_DB':
        db.transaction((db) => {
          db.exec('DROP TABLE IF EXISTS bookmarks; DROP TABLE IF EXISTS bookmarks_fts; DROP TABLE IF EXISTS tag_aliases; DROP TABLE IF EXISTS metadata;');
          db.exec(SCHEMA);
        });
        self.postMessage({ type: 'EXEC_SUCCESS', id });
        break;
      default:
        console.warn('[Worker] Unknown message:', type);
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: error.message, id });
  }
};

const hydrateArchive = async (proxyUrl, authToken, id) => {
  self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: 'NETWORK: Summing archive...', progress: 0.1 }, id });
  const response = await fetch(`${proxyUrl}/posts/all?auth_token=${authToken}&format=json`);
  if (!response.ok) throw new Error(`Server Ritual Error: ${response.status}`);
  const bookmarks = await response.json();
  
  const CHUNK_SIZE = 1000;
  for (let i = 0; i < bookmarks.length; i += CHUNK_SIZE) {
    const chunk = bookmarks.slice(i, i + CHUNK_SIZE);
    db.transaction((db) => {
      const stmt = db.prepare("INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified) VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?) ON CONFLICT(href) DO UPDATE SET description=excluded.description, extended=excluded.extended, tags=excluded.tags, time=excluded.time, local_last_modified=excluded.local_last_modified");
      for (const b of chunk) {
        stmt.bind([b.href, b.description, b.extended || '', b.tags, b.time, Date.now()]);
        stmt.step();
        stmt.reset();
      }
      stmt.finalize();
    });
    self.postMessage({ type: 'SYNC_PROGRESS', payload: { status: `LOCAL: Ingested ${Math.min(i + CHUNK_SIZE, bookmarks.length)} / ${bookmarks.length}`, progress: 0.3 + (0.6 * (i + CHUNK_SIZE) / bookmarks.length) }, id });
    await new Promise(r => setTimeout(r, 0));
  }

  db.exec({ sql: "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?), ('last_full_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", bind: [new Date().toISOString(), new Date().toISOString()] });
  self.postMessage({ type: 'SYNC_COMPLETE', payload: { count: bookmarks.length }, id });
  self.postMessage({ type: 'REFRESH_REQUIRED' });
  refreshPopularTags('popular-tags');
};
