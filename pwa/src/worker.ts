import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

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
      print: console.log,
      printErr: console.error,
    });

    console.log('Running SQLite3 version', sqlite3.version.libVersion);

    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/pinboard.db');
      console.log('SQLite is using OPFS storage.');
    } else {
      db = new sqlite3.oo1.DB('/pinboard.db', 'ct');
      console.warn('OPFS not available, falling back to transient storage.');
    }

    // Run Schema
    db.exec(SCHEMA);
    console.log('Database schema initialized.');

    return true;
  } catch (err) {
    console.error('Failed to initialize SQLite:', err);
    throw err;
  }
};

// Message Handler
self.onmessage = async (e) => {
  const { type, payload, id } = e.data;

  try {
    switch (type) {
      case 'INIT':
        await initDb();
        self.postMessage({ type: 'INIT_SUCCESS', id });
        break;

      case 'QUERY_SEARCH':
        // Payload is the search term
        const results = db.exec({
          sql: `
            SELECT b.* FROM bookmarks_fts f
            JOIN bookmarks b ON f.rowid = b.rowid
            WHERE bookmarks_fts MATCH ?
            ORDER BY b.time DESC
            LIMIT 100
          `,
          bind: [payload],
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: results, id });
        break;

      case 'QUERY_ALL':
        const all = db.exec({
          sql: 'SELECT * FROM bookmarks ORDER BY time DESC LIMIT 100',
          returnValue: 'resultRows',
          rowMode: 'object'
        });
        self.postMessage({ type: 'QUERY_RESULTS', payload: all, id });
        break;

      case 'UPSERT_BATCH':
        // Payload is an array of bookmark objects
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
          for (const b of payload) {
            stmt.bind([b.href, b.description, b.extended, b.tags, b.time, Date.now()]);
            stmt.step();
            stmt.reset();
          }
          stmt.finalize();
        });
        self.postMessage({ type: 'UPSERT_SUCCESS', id });
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
