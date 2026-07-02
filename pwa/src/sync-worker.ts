/// <reference lib="webworker" />

// ─── Vendor Boundary (The Containment Field) ─────────────────────────────────
// TypeScript's module resolver panics at absolute browser routing paths.
// We explicitly tell the compiler to ignore this specific import resolution,
// as the browser will resolve '/vendor/...' correctly at runtime.
// @ts-expect-error
import sqlite3InitModule from '/vendor/sqlite3-bundler-friendly.mjs';

declare const self: DedicatedWorkerGlobalScope;

// ════════════════════════════════════════════════════════════════════════════
// THE SOVEREIGN CONTRACT (Types & Interfaces)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Pingolin Sync Worker — Lobotomy Edition (Phase 5.0)
 *
 * THE DUMB MUSCLE: A pure I/O RPC endpoint.
 * This file contains ZERO Pinboard domain knowledge.
 * It executes HTTP requests and SQL statements. Nothing more.
 * All sync orchestration lives in the Sovereign State Machine (Elm).
 *
 * Message Protocol
 * ─────────────────────────────────────────────────────────────────
 * INBOUND (from Elm):
 *   RPC_FETCH          { proxyUrl, path, params? }  → network call
 *   RPC_SQL_QUERY      { sql, bind? }               → read rows
 *   RPC_SQL_EXEC       { sql, bind? }               → mutate DB
 *   RPC_SQL_TRANSACTION  [{ sql, bind? }, ...]      → atomic batch
 *   START_HYDRATION    { proxyUrl, authToken }       → Big Pull (retained exception)
 *   INIT               { dbName? }                  → bootstrap DB
 *
 * LEGACY INBOUND (retained for Phase 5.1 compatibility, will be removed):
 *   QUERY_ALL, QUERY_SEARCH, LOCAL_UPSERT, LOCAL_DELETE,
 *   QUERY, EXEC, GET_POPULAR_TAGS, UPSERT_TAG_ALIAS,
 *   DEBUG_CLEAR_DB, SET_DEBUG_CAP
 *
 * OUTBOUND (to Elm):
 *   RPC_SUCCESS  { id, payload? }               → generic success response
 *   RPC_ERROR    { id, payload: { message, code } } → correlated failure
 *   INIT_SUCCESS { id }
 *   SESSION_RESTORED { payload: { token, proxyUrl, lastSync } }
 *   SYNC_PROGRESS    { payload: { status, progress }, id? }
 *   SYNC_COMPLETE    { payload: { count }, id }
 *   QUERY_RESULTS    { payload: rows|tags, id }
 *   REFRESH_REQUIRED {}
 *   EXEC_SUCCESS     { id }
 *
 * RPC_ERROR codes:
 *   NETWORK_ERROR   fetch threw (proxy unreachable)
 *   HTTP_<status>   proxy returned non-2xx
 *   SQL_ERROR       sqlite-wasm threw
 *   UNKNOWN         catch-all
 */

// --- Outbound (To Elm) ---
type OutboundMessage =
  | { type: 'RPC_SUCCESS'; id: string; payload?: any }
  | {
      type: 'RPC_ERROR';
      id: string;
      payload: { message: string; code: string };
    }
  | { type: 'INIT_SUCCESS'; id: string }
  | {
      type: 'SESSION_RESTORED';
      payload: { token: string; proxyUrl: string; lastSync: string; query: string };
    }
  | {
      type: 'SYNC_PROGRESS';
      payload: { status: string; progress: number };
      id?: string;
    }
  | { type: 'SYNC_COMPLETE'; payload: { count: number }; id: string }
  | { type: 'QUERY_RESULTS'; payload: any[]; id: string }
  | { type: 'REFRESH_REQUIRED' }
  | { type: 'EXEC_SUCCESS'; id: string };

// --- Inbound (From Elm) ---
interface RpcFetchPayload {
  proxyUrl: string;
  path: string;
  params?: Record<string, string>;
}
interface RpcSqlPayload {
  sql: string;
  bind?: any[];
}
interface StartHydrationPayload {
  proxyUrl: string;
  authToken: string;
}
interface InitPayload {
  dbName?: string;
}

// Discriminated Union for exact matching.
type WorkerInboundMessage =
  | { type: 'RPC_FETCH'; id: string; payload: RpcFetchPayload }
  | { type: 'RPC_SQL_QUERY'; id: string; payload: RpcSqlPayload }
  | { type: 'RPC_SQL_EXEC'; id: string; payload: RpcSqlPayload }
  | { type: 'RPC_SQL_TRANSACTION'; id: string; payload: RpcSqlPayload[] }
  | { type: 'START_HYDRATION'; id: string; payload: StartHydrationPayload }
  | { type: 'INIT'; id: string; payload: InitPayload }
  | { type: 'START_SYNC_LOOP'; id: string; payload: StartHydrationPayload }
  | { type: 'PERFORM_DELTA_SYNC'; id: string; payload: StartHydrationPayload }
  | { type: 'PERFORM_DATES_HACK'; id: string; payload: StartHydrationPayload }
  // Legacy Fallback (Type-safe evasion until Phase 5.1 is complete)
  | {
      type:
        | 'QUERY_ALL'
        | 'QUERY_SEARCH'
        | 'LOCAL_UPSERT'
        | 'LOCAL_DELETE'
        | 'QUERY'
        | 'EXEC'
        | 'GET_POPULAR_TAGS'
        | 'UPSERT_TAG_ALIAS'
        | 'DEBUG_CLEAR_DB'
        | 'SET_DEBUG_CAP';
      id: string;
      payload?: any;
    };

// Minimal DB Interface to keep the compiler honest
interface SQLiteDB {
  exec(
    options:
      | { sql: string; bind?: any[]; returnValue?: string; rowMode?: string }
      | string
  ): any;
  transaction(cb: (db: SQLiteDB) => void): void;
  prepare(sql: string): any;
}

// ════════════════════════════════════════════════════════════════════════════
// WORKER STATE & HELPERS
// ════════════════════════════════════════════════════════════════════════════

let db: SQLiteDB | null = null;
let dbPromise: Promise<boolean> | null = null;

/** Strongly typed wrapper for outgoing messages */
const dispatch = (msg: OutboundMessage) => {
  self.postMessage(msg);
};

/** Always posts { status, progress } — no naked status-only payloads. */
const postSyncProgress = (
  status: string,
  progress: number = 0,
  id?: string
) => {
  dispatch({ type: 'SYNC_PROGRESS', payload: { status, progress }, id });
};

/** Classifies a thrown error into an RPC error code. */
const classifyFetchError = (err: Error): string => {
  const httpMatch = err.message.match(/^HTTP (\d+):/);
  return httpMatch ? `HTTP_${httpMatch[1]}` : 'NETWORK_ERROR';
};

// ─── Schema ──────────────────────────────────────────────────────────────────

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

// ─── Database Init ───────────────────────────────────────────────────────────

const initDb = async (dbName: string = '/pinboard.db'): Promise<boolean> => {
  if (db) return true;
  try {
    const sqlite3 = await sqlite3InitModule({
      print: console.debug,
      printErr: console.error,
      locateFile: (file: string) => `/vendor/${file}`,
    });

    if (sqlite3.opfs) {
      db = new sqlite3.oo1.OpfsDb(dbName) as SQLiteDB;
      console.log('[Worker] OPFS Database:', dbName);
    } else {
      db = new sqlite3.oo1.DB(dbName, 'ct') as SQLiteDB;
      console.warn('[Worker] Transient Storage:', dbName);
    }

    db.transaction((trx) => {
      trx.exec(SCHEMA);
    });
    db.exec('PRAGMA cache_size = 2000;');
    db.exec('PRAGMA synchronous = NORMAL;');
    console.log('[Worker] Database Ritual Complete.');

    // Restore session from metadata
    const meta = db.exec({
      sql: "SELECT key, value FROM metadata WHERE key IN ('last_full_sync_time', 'auth_token', 'proxy_url', 'query')",
      returnValue: 'resultRows',
      rowMode: 'object',
    });

    const session: Record<string, string> = {};
    for (const row of meta) {
      session[row.key] = row.value;
    }

    if (session.auth_token) {
      console.log('[Worker] Session Detected:', session.auth_token);
      // Self-heal: if last_full_sync_time is missing but bookmarks exist, write it
      if (!session.last_full_sync_time) {
        const countResult = db.exec({
          sql: 'SELECT count(*) as count FROM bookmarks',
          returnValue: 'resultRows',
          rowMode: 'object',
        });
        const count = countResult.length > 0 ? countResult[0].count : 0;
        if (count > 0) {
          console.warn(
            `[Worker] Zombie DB Detected: ${count} bookmarks but no last_full_sync_time. Healing...`
          );
          const latest = db.exec({
            sql: 'SELECT time FROM bookmarks ORDER BY time DESC LIMIT 1',
            returnValue: 'resultRows',
            rowMode: 'object',
          });
          const healTime =
            latest.length > 0 ? latest[0].time : new Date().toISOString();
          db.exec({
            sql: "INSERT INTO metadata (key, value) VALUES ('last_full_sync_time', ?), ('last_sync_time', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            bind: [healTime, healTime],
          });
          session.last_full_sync_time = healTime;
        }
      }
      dispatch({
        type: 'SESSION_RESTORED',
        payload: {
          lastSync: session.last_full_sync_time || '',
          token: session.auth_token || '',
          proxyUrl: session.proxy_url || '',
          query: session.query || '',
        },
      });
    }

    return true;
  } catch (error) {
    console.error('[Worker] Initialization Failure:', error);
    throw error;
  }
};

// ─── Network ─────────────────────────────────────────────────────────────────

/**
 * fetchRitual: Generic HTTP fetch to the proxy.
 * Used by RPC_FETCH and the retained START_HYDRATION handler.
 * Throws with messages prefixed "HTTP <status>:" for HTTP errors,
 * or a plain network message for connection failures.
 */
const fetchRitual = async (
  baseUrl: string,
  path: string,
  params: Record<string, string> = {}
): Promise<any> => {
  if (!baseUrl || baseUrl === '')
    throw new Error(`NETWORK_ERROR: No base URL provided for path ${path}`);
  try {
    new URL(baseUrl);
  } catch (_) {
    throw new Error(
      `NETWORK_ERROR: Invalid base URL "${baseUrl}" for path ${path}`
    );
  }

  const sanitizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(path.replace(/^\//, ''), sanitizedBase);
  url.search = new URLSearchParams({
    ...params,
    cb: Date.now().toString(),
  }).toString();

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch (networkErr: any) {
    throw new Error(`NETWORK_ERROR: ${networkErr.message}`);
  }

  if (!response.ok) {
    let bodyText = '';
    try {
      bodyText = await response.text();
    } catch (_) {}
    console.error(
      `[Worker] Proxy Error (${response.status}) at ${path}:`,
      bodyText
    );
    throw new Error(
      `HTTP ${response.status}: ${bodyText.trim() || response.statusText}`
    );
  }

  const text = await response.text();
  if (!text || text.trim() === '') return null;

  try {
    return JSON.parse(text);
  } catch (_) {
    if (
      text.includes('code="done"') ||
      text.includes('result_code":"done"') ||
      text.includes('result_code="done"')
    ) {
      return { result_code: 'done' };
    }
    console.error(
      `[Worker] Non-JSON response at ${path}:`,
      text.substring(0, 100)
    );
    return null;
  }
};

// ─── Tag Utilities ───────────────────────────────────────────────────────────

const refreshPopularTags = (id: string) => {
  if (!db) return;
  const tagRows = db.exec({
    sql: 'SELECT tags FROM bookmarks',
    returnValue: 'resultRows',
    rowMode: 'object',
  });
  const aliasRows = db.exec({
    sql: 'SELECT mapped_tag FROM tag_aliases',
    returnValue: 'resultRows',
    rowMode: 'object',
  });

  const counts: Record<string, number> = {};
  for (const row of tagRows) {
    const tList = (row.tags || '').split(' ').filter(Boolean);
    for (const t of tList) counts[t] = (counts[t] || 0) + 1;
  }
  for (const row of aliasRows) {
    counts[row.mapped_tag] = (counts[row.mapped_tag] || 0) + 1000;
  }

  const sortedTags = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map((e) => e[0]);
  dispatch({ type: 'QUERY_RESULTS', payload: sortedTags, id });
};

// ─── Big Pull Exception ───────────────────────────────────────────────────────

/**
 * hydrateArchive: The SOLE retained procedural exception.
 *
 * Transferring a 15MB JSON array across the postMessage boundary to the
 * Sovereign State Machine would freeze the UI thread and violate the 60fps
 * mandate. This function therefore retains its procedural form inside the worker.
 *
 * It remains a sealed black box: it knows the Pinboard /posts/all endpoint
 * only in this single location. All other Pinboard knowledge has been removed.
 */
const hydrateArchive = async (
  proxyUrl: string,
  authToken: string,
  id: string
) => {
  postSyncProgress('NETWORK: Summing archive...', 0.1, id);
  const bookmarks = await fetchRitual(proxyUrl, '/posts/all', {
    auth_token: authToken,
    format: 'json',
  });
  if (!bookmarks || !Array.isArray(bookmarks))
    throw new Error('Server returned empty or invalid archive');
  if (!db) throw new Error('Database not initialized');

  const CHUNK_SIZE = 1000;
  for (let i = 0; i < bookmarks.length; i += CHUNK_SIZE) {
    const chunk = bookmarks.slice(i, i + CHUNK_SIZE);
    db.transaction((trx) => {
      const stmt = trx.prepare(
        "INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified) VALUES (?, ?, ?, ?, ?, 'SYNCHRONIZED', ?) ON CONFLICT(href) DO UPDATE SET description=excluded.description, extended=excluded.extended, tags=excluded.tags, time=excluded.time, local_last_modified=excluded.local_last_modified"
      );
      for (const b of chunk) {
        stmt.bind([
          b.href,
          b.description,
          b.extended || '',
          b.tags,
          b.time,
          Date.now(),
        ]);
        stmt.step();
        stmt.reset();
      }
      stmt.finalize();
    });
    postSyncProgress(
      `LOCAL: Ingested ${Math.min(i + CHUNK_SIZE, bookmarks.length)} / ${bookmarks.length}`,
      0.3 + (0.6 * (i + CHUNK_SIZE)) / bookmarks.length,
      id
    );
    await new Promise((r) => setTimeout(r, 0));
  }

  db.exec({
    sql: "INSERT INTO metadata (key, value) VALUES ('last_sync_time', ?), ('last_full_sync_time', ?), ('auth_token', ?), ('proxy_url', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    bind: [
      new Date().toISOString(),
      new Date().toISOString(),
      authToken,
      proxyUrl,
    ],
  });
  dispatch({ type: 'SYNC_COMPLETE', payload: { count: bookmarks.length }, id });
  dispatch({ type: 'REFRESH_REQUIRED' });
  refreshPopularTags('popular-tags');
};

// ─── Main Dispatcher ─────────────────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<WorkerInboundMessage>) => {
  const msg = e.data;
  const id = msg.id || 'system';

  /** Post a correlated RPC_ERROR. Always includes the originating id. */
  const postRpcError = (message: string, code: string = 'UNKNOWN') => {
    console.error(`[Worker] RPC_ERROR (${code}) id=${id}:`, message);
    dispatch({ type: 'RPC_ERROR', id, payload: { message, code } });
  };

  try {
    // ── INIT (runs before DB is ready) ──────────────────────────────────────
    if (msg.type === 'INIT') {
      if (!dbPromise) dbPromise = initDb(msg.payload?.dbName);
      await dbPromise;
      dispatch({ type: 'INIT_SUCCESS', id });
      return;
    }

    // Ensure DB is ready for all other messages
    if (!db && dbPromise) await dbPromise;
    if (!db) {
      dbPromise = initDb();
      await dbPromise;
    }
    if (!db) throw new Error('CRITICAL: Database failed to mount.'); // Type assertion guard

    // The TypeScript Discriminated Union provides flawless autocomplete and type safety below.
    switch (msg.type) {
      // ══════════════════════════════════════════════════════════════════════
      // PHASE 5.0: GENERIC RPC HANDLERS
      // The Sovereign State Machine issues these commands.
      // The Dumb Muscle executes them. Nothing more.
      // ══════════════════════════════════════════════════════════════════════

      case 'RPC_FETCH': {
        const { proxyUrl, path, params = {} } = msg.payload;
        try {
          const data = await fetchRitual(proxyUrl, path, params);
          dispatch({ type: 'RPC_SUCCESS', id, payload: data });
        } catch (err: any) {
          postRpcError(err.message, classifyFetchError(err));
        }
        break;
      }

      case 'RPC_SQL_QUERY': {
        const { sql, bind = [] } = msg.payload;
        try {
          const rows = db.exec({
            sql,
            bind,
            returnValue: 'resultRows',
            rowMode: 'object',
          });
          dispatch({ type: 'RPC_SUCCESS', id, payload: rows });
        } catch (err: any) {
          postRpcError(err.message, 'SQL_ERROR');
        }
        break;
      }

      case 'RPC_SQL_EXEC': {
        const { sql, bind = [] } = msg.payload;
        try {
          db.exec({ sql, bind });
          dispatch({ type: 'RPC_SUCCESS', id });
        } catch (err: any) {
          postRpcError(err.message, 'SQL_ERROR');
        }
        break;
      }

      case 'RPC_SQL_TRANSACTION': {
        // payload: Array<{ sql: string, bind?: any[] }>
        try {
          db.transaction((trx) => {
            for (const stmt of msg.payload) {
              trx.exec({ sql: stmt.sql, bind: stmt.bind || [] });
            }
          });
          dispatch({ type: 'RPC_SUCCESS', id });
        } catch (err: any) {
          postRpcError(err.message, 'SQL_ERROR');
        }
        break;
      }

      // ══════════════════════════════════════════════════════════════════════
      // BIG PULL EXCEPTION
      // Retained by architectural necessity: 15MB → postMessage = UI freeze.
      // This is the ONLY location in the worker that knows a Pinboard endpoint.
      // ══════════════════════════════════════════════════════════════════════

      case 'START_HYDRATION': {
        try {
          await hydrateArchive(msg.payload.proxyUrl, msg.payload.authToken, id);
        } catch (err: any) {
          postRpcError(err.message, classifyFetchError(err));
        }
        break;
      }

      // ══════════════════════════════════════════════════════════════════════
      // LEGACY HANDLERS — retained for Phase 5.1 Elm port compatibility.
      // These will be removed once the Elm layer issues RPC_SQL_* commands.
      // ══════════════════════════════════════════════════════════════════════

      case 'QUERY_SEARCH': {
        const payloadStr = typeof msg.payload === 'string' ? msg.payload : '';
        if (!payloadStr || payloadStr.trim() === '') {
          const all = db.exec({
            sql: 'SELECT * FROM bookmarks ORDER BY time DESC',
            returnValue: 'resultRows',
            rowMode: 'object',
          });
          dispatch({ type: 'QUERY_RESULTS', payload: all, id });
          break;
        }
        const aliasRows = db.exec({
          sql: 'SELECT mapped_tag FROM tag_aliases WHERE keyword = ?',
          bind: [payloadStr.toLowerCase()],
          returnValue: 'resultRows',
          rowMode: 'object',
        });
        const effectiveQuery =
          aliasRows.length > 0 ? aliasRows[0].mapped_tag : payloadStr;
        const sql = effectiveQuery.startsWith('#')
          ? "SELECT * FROM bookmarks WHERE (' ' || tags || ' ') LIKE ? ORDER BY time DESC"
          : 'SELECT b.* FROM bookmarks b JOIN bookmarks_fts f ON b.rowid = f.rowid WHERE bookmarks_fts MATCH ? ORDER BY b.time DESC';
        const bind = effectiveQuery.startsWith('#')
          ? [`% ${effectiveQuery.substring(1)} %`]
          : [`"${effectiveQuery.replace(/"/g, '""')}"`];
        const results = db.exec({
          sql,
          bind,
          returnValue: 'resultRows',
          rowMode: 'object',
        });
        dispatch({ type: 'QUERY_RESULTS', payload: results, id });
        break;
      }

      case 'QUERY_ALL': {
        const all = db.exec({
          sql: 'SELECT * FROM bookmarks ORDER BY time DESC',
          returnValue: 'resultRows',
          rowMode: 'object',
        });
        console.log(
          '[Worker] QUERY_ALL results count:',
          all.length,
          all.length > 0 ? all[0].href : 'NONE'
        );
        dispatch({ type: 'QUERY_RESULTS', payload: all, id });
        break;
      }

      case 'LOCAL_UPSERT': {
        console.log(
          '[Worker] LOCAL_UPSERT:',
          msg.payload.href,
          msg.payload.description
        );
        db.transaction((trx) => {
          const now = Date.now();
          const existing = trx.exec({
            sql: 'SELECT sync_status FROM bookmarks WHERE href = ?',
            bind: [msg.payload.href],
            returnValue: 'resultRows',
          });
          const status =
            existing.length > 0 ? 'PENDING_UPDATE' : 'PENDING_INSERT';
          trx.exec({
            sql: 'INSERT INTO bookmarks (href, description, extended, tags, time, sync_status, local_last_modified) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(href) DO UPDATE SET description=excluded.description, extended=excluded.extended, tags=excluded.tags, time=excluded.time, sync_status=excluded.sync_status, local_last_modified=excluded.local_last_modified',
            bind: [
              msg.payload.href,
              msg.payload.description || '',
              msg.payload.extended || '',
              msg.payload.tags || '',
              msg.payload.time || new Date().toISOString(),
              status,
              now,
            ],
          });
        });
        console.log(
          '[Worker] LOCAL_UPSERT committed. Sending REFRESH_REQUIRED'
        );
        dispatch({ type: 'REFRESH_REQUIRED' });
        dispatch({ type: 'EXEC_SUCCESS', id });
        refreshPopularTags('popular-tags');
        break;
      }

      case 'LOCAL_DELETE':
        db.exec({
          sql: "UPDATE bookmarks SET sync_status = 'PENDING_DELETE', local_last_modified = ? WHERE href = ?",
          bind: [Date.now(), msg.payload],
        });
        dispatch({ type: 'REFRESH_REQUIRED' });
        dispatch({ type: 'EXEC_SUCCESS', id });
        break;

      case 'QUERY':
        dispatch({
          type: 'QUERY_RESULTS',
          payload: db.exec({
            sql: msg.payload.sql,
            bind: msg.payload.bind,
            returnValue: 'resultRows',
            rowMode: 'object',
          }),
          id,
        });
        break;

      case 'EXEC':
        db.exec({ sql: msg.payload.sql, bind: msg.payload.bind });
        dispatch({ type: 'EXEC_SUCCESS', id });
        break;

      case 'GET_POPULAR_TAGS':
        refreshPopularTags(id);
        break;

      case 'UPSERT_TAG_ALIAS':
        db.exec({
          sql: 'INSERT INTO tag_aliases (keyword, mapped_tag) VALUES (?, ?) ON CONFLICT(keyword) DO UPDATE SET mapped_tag=excluded.mapped_tag',
          bind: [msg.payload.keyword, msg.payload.mapped_tag],
        });
        dispatch({ type: 'EXEC_SUCCESS', id });
        refreshPopularTags('popular-tags');
        break;

      // ══════════════════════════════════════════════════════════════════════
      // DEBUG UTILITIES
      // ══════════════════════════════════════════════════════════════════════

      case 'SET_DEBUG_CAP':
        // Acknowledged for test compatibility.
        dispatch({ type: 'EXEC_SUCCESS', id });
        break;

      case 'DEBUG_CLEAR_DB':
        db.transaction((trx) => {
          trx.exec(
            'DROP TABLE IF EXISTS bookmarks; DROP TABLE IF EXISTS bookmarks_fts; DROP TABLE IF EXISTS tag_aliases; DROP TABLE IF EXISTS metadata;'
          );
          trx.exec(SCHEMA);
        });
        dispatch({ type: 'EXEC_SUCCESS', id });
        break;

      default:
        console.warn(
          '[Worker] Unknown or removed message type:',
          (msg as any).type
        );
    }
  } catch (error: any) {
    // Global safety net: no unhandled rejection escapes.
    // Always emit RPC_ERROR with the originating id.
    console.error('[Worker] Unhandled exception:', error);
    postRpcError(error.message, 'UNKNOWN');
  }
};
