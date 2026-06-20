import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockDb, mockStmt, mockSqlite3 } from './__mocks__/sqlite-mock.js';

// ============================================================================
// THE QUANTUM CONTAINMENT FIELD (MOCKS)
// Must be set up BEFORE importing the worker (ES module evaluation is immediate)
// ============================================================================

const mockPostMessage = vi.fn();
global.self = {
  postMessage: mockPostMessage,
  onmessage: null,
};
global.fetch = vi.fn();

// Dynamic import defeats ES Module hoisting — worker wakes up AFTER globals exist.
await import('../public/sync-worker.js');

// ============================================================================
// SHARED TEST HELPERS
// ============================================================================

/** Send a message to the worker and wait for its async handler to complete. */
const sendToWorker = async (type, payload, id = 'test-id') => {
  await global.self.onmessage({ data: { type, payload, id } });
};

/** Return all calls to postMessage matching a given type. */
const messagesOfType = (type) =>
  mockPostMessage.mock.calls
    .map(([msg]) => msg)
    .filter((msg) => msg.type === type);

// ============================================================================
// THE TRIALS — Phase 5.0 RPC Contract
// ============================================================================

describe('Pingolin Worker: Phase 5.0 Dumb Muscle RPC Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Default: empty DB (no existing session)
    mockDb.exec.mockImplementation(({ sql } = {}) => {
      if (sql && sql.includes('SELECT key, value FROM metadata')) return [];
      return [];
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── INIT ─────────────────────────────────────────────────────────────────

  it('INIT: initialises the DB and reports INIT_SUCCESS', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });

    expect(mockSqlite3.oo1.OpfsDb).toHaveBeenCalledWith('/test.db');
    expect(mockDb.exec).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS bookmarks')
    );
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'INIT_SUCCESS',
      id: 'test-id',
    });
  });

  // ── RPC_SQL_QUERY ─────────────────────────────────────────────────────────

  it('RPC_SQL_QUERY: executes SQL and returns rows as RPC_SUCCESS payload', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    const fakeRows = [{ href: 'https://a.com', description: 'A' }];
    mockDb.exec.mockReturnValueOnce(fakeRows);

    await sendToWorker('RPC_SQL_QUERY', {
      sql: 'SELECT * FROM bookmarks',
      bind: [],
    });

    expect(mockDb.exec).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: 'SELECT * FROM bookmarks',
        returnValue: 'resultRows',
        rowMode: 'object',
      })
    );
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'RPC_SUCCESS',
      id: 'test-id',
      payload: fakeRows,
    });
  });

  it('RPC_SQL_QUERY: posts RPC_ERROR with SQL_ERROR code on DB exception', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    mockDb.exec.mockImplementationOnce(() => {
      throw new Error('no such table: bookmarks');
    });

    await sendToWorker('RPC_SQL_QUERY', { sql: 'SELECT * FROM bookmarks' });

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'RPC_ERROR',
      id: 'test-id',
      payload: { message: 'no such table: bookmarks', code: 'SQL_ERROR' },
    });
  });

  // ── RPC_SQL_EXEC ──────────────────────────────────────────────────────────

  it('RPC_SQL_EXEC: executes a mutation and returns RPC_SUCCESS', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    await sendToWorker('RPC_SQL_EXEC', {
      sql: "UPDATE bookmarks SET tags = 'newtag' WHERE href = 'https://a.com'",
      bind: [],
    });

    expect(mockDb.exec).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining('UPDATE bookmarks'),
      })
    );
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'RPC_SUCCESS',
      id: 'test-id',
    });
  });

  it('RPC_SQL_EXEC: posts RPC_ERROR with SQL_ERROR code on DB exception', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    mockDb.exec.mockImplementationOnce(() => {
      throw new Error('UNIQUE constraint failed');
    });

    await sendToWorker('RPC_SQL_EXEC', {
      sql: 'INSERT INTO bookmarks VALUES (?)',
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'RPC_ERROR',
      id: 'test-id',
      payload: { message: 'UNIQUE constraint failed', code: 'SQL_ERROR' },
    });
  });

  // ── RPC_SQL_TRANSACTION ───────────────────────────────────────────────────

  it('RPC_SQL_TRANSACTION: executes all statements atomically and returns RPC_SUCCESS', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    const stmts = [
      {
        sql: 'DELETE FROM bookmarks WHERE href = ?',
        bind: ['https://ghost.com'],
      },
      {
        sql: 'DELETE FROM bookmarks WHERE href = ?',
        bind: ['https://ghost2.com'],
      },
    ];
    await sendToWorker('RPC_SQL_TRANSACTION', stmts);

    expect(mockDb.transaction).toHaveBeenCalled();
    expect(mockDb.exec).toHaveBeenCalledWith(
      expect.objectContaining({ sql: 'DELETE FROM bookmarks WHERE href = ?' })
    );
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'RPC_SUCCESS',
      id: 'test-id',
    });
  });

  it('RPC_SQL_TRANSACTION: posts RPC_ERROR on failure and transaction is aborted', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    mockDb.transaction.mockImplementationOnce(() => {
      throw new Error('disk I/O error');
    });

    await sendToWorker('RPC_SQL_TRANSACTION', [
      { sql: 'DELETE FROM bookmarks' },
    ]);

    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'RPC_ERROR',
      id: 'test-id',
      payload: { message: 'disk I/O error', code: 'SQL_ERROR' },
    });
  });

  // ── RPC_FETCH ─────────────────────────────────────────────────────────────

  it('RPC_FETCH: calls fetch with correct URL and returns RPC_SUCCESS with parsed payload', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    const fakeData = [{ href: 'https://pinboard.in/b/1' }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(fakeData),
    });

    await sendToWorker('RPC_FETCH', {
      proxyUrl: 'https://proxy.example.com',
      path: '/posts/all',
      params: { auth_token: 'user:abc', format: 'json' },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/all')
    );
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'RPC_SUCCESS',
      id: 'test-id',
      payload: fakeData,
    });
  });

  it('RPC_FETCH: posts RPC_ERROR with HTTP_404 code on non-ok response', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Not Found',
    });

    await sendToWorker('RPC_FETCH', {
      proxyUrl: 'https://proxy.example.com',
      path: '/posts/all',
      params: {},
    });

    const errors = messagesOfType('RPC_ERROR');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      type: 'RPC_ERROR',
      id: 'test-id',
      payload: { code: 'HTTP_404' },
    });
  });

  it('RPC_FETCH: posts RPC_ERROR with NETWORK_ERROR code when fetch throws', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    await sendToWorker('RPC_FETCH', {
      proxyUrl: 'https://proxy.example.com',
      path: '/posts/update',
      params: {},
    });

    const errors = messagesOfType('RPC_ERROR');
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      type: 'RPC_ERROR',
      id: 'test-id',
      payload: { code: 'NETWORK_ERROR' },
    });
  });

  // ── ERROR CONTRACT ────────────────────────────────────────────────────────

  it('ERROR CONTRACT: every RPC_ERROR always includes the originating id', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    // Trigger errors on all three SQL RPC types
    mockDb.exec.mockImplementation(() => {
      throw new Error('boom');
    });
    mockDb.transaction.mockImplementation(() => {
      throw new Error('boom');
    });
    global.fetch.mockRejectedValue(new Error('offline'));

    await sendToWorker('RPC_SQL_QUERY', { sql: 'SELECT 1' }, 'id-q');
    await sendToWorker(
      'RPC_SQL_EXEC',
      { sql: 'INSERT INTO x VALUES(1)' },
      'id-e'
    );
    await sendToWorker(
      'RPC_SQL_TRANSACTION',
      [{ sql: 'DELETE FROM x' }],
      'id-t'
    );
    await sendToWorker(
      'RPC_FETCH',
      { proxyUrl: 'https://p.com', path: '/x', params: {} },
      'id-f'
    );

    const errors = messagesOfType('RPC_ERROR');
    expect(errors).toHaveLength(4);

    const ids = errors.map((e) => e.id);
    expect(ids).toContain('id-q');
    expect(ids).toContain('id-e');
    expect(ids).toContain('id-t');
    expect(ids).toContain('id-f');

    // No id should ever be undefined
    expect(errors.every((e) => e.id !== undefined)).toBe(true);
  });

  // ── LEGACY: LOCAL_UPSERT ──────────────────────────────────────────────────

  it('LOCAL_UPSERT (legacy): writes to DB, sends REFRESH_REQUIRED and EXEC_SUCCESS', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    // Reset to default: the error contract test above leaves transaction throwing.
    mockDb.transaction.mockImplementation((cb) => cb(mockDb));
    mockDb.exec.mockImplementation(({ sql } = {}) => {
      if (sql && sql.includes('SELECT sync_status FROM bookmarks')) return [];
      return [];
    });

    await sendToWorker('LOCAL_UPSERT', {
      href: 'https://nyx.ai',
      description: 'Liberated Intelligence',
      tags: 'chaos ai',
      time: '2025-01-01T12:00:00Z',
    });

    expect(mockDb.transaction).toHaveBeenCalled();
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'REFRESH_REQUIRED' });
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'EXEC_SUCCESS',
      id: 'test-id',
    });
  });

  // ── START_HYDRATION ────────────────────────────────────────────────────────

  it('START_HYDRATION: chunked insertion produces correct SYNC_PROGRESS updates and SYNC_COMPLETE', async () => {
    vi.useRealTimers();
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    // Reset to default: mockDb transaction implementation
    mockDb.transaction.mockImplementation((cb) => cb(mockDb));

    // 1500 bookmarks: fits in 2 chunks of 1000 and 500
    const mockBookmarks = Array.from({ length: 1500 }, (_, i) => ({
      href: `https://test-${i}.com`,
      description: `Description ${i}`,
      extended: `Extended ${i}`,
      tags: `tags-${i}`,
      time: '2023-10-01T12:00:00Z',
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockBookmarks),
    });

    await sendToWorker(
      'START_HYDRATION',
      {
        proxyUrl: 'https://proxy.example.com',
        authToken: 'test-token',
      },
      'hb-hydrate'
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/posts/all')
    );

    // Verify progress updates
    const progressMsgs = messagesOfType('SYNC_PROGRESS');
    expect(progressMsgs.length).toBeGreaterThanOrEqual(3); // Initial progress + 2 chunks
    expect(progressMsgs[0].payload.progress).toBe(0.1);

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SYNC_COMPLETE',
        payload: { count: 1500 },
        id: 'hb-hydrate',
      })
    );
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: 'REFRESH_REQUIRED',
    });
  });

  it('START_HYDRATION: posts RPC_ERROR if proxy returns non-ok status', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Internal Server Error',
    });

    await sendToWorker(
      'START_HYDRATION',
      {
        proxyUrl: 'https://proxy.example.com',
        authToken: 'test-token',
      },
      'hb-hydrate'
    );

    const errorMsgs = messagesOfType('RPC_ERROR');
    expect(errorMsgs).toHaveLength(1);
    expect(errorMsgs[0]).toMatchObject({
      type: 'RPC_ERROR',
      id: 'hb-hydrate',
      payload: { code: 'HTTP_500' },
    });
  });
});
