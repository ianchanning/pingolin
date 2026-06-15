import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockDb, mockStmt, mockSqlite3 } from './__mocks__/sqlite-mock.js';

// ============================================================================
// THE QUANTUM CONTAINMENT FIELD (MOCKS)
// ============================================================================

// 1. Mock the Global Web Worker Context
const mockPostMessage = vi.fn();
global.self = { 
  postMessage: mockPostMessage,
  onmessage: null // The worker will attach its listener here
};

// 2. Mock the Network (The Proxy Bridge)
global.fetch = vi.fn();

// ============================================================================
// IMPORTING THE BEAST
// ============================================================================
// A dynamic await import defeats ES Module hoisting. 
// It guarantees the worker only wakes up AFTER our globals are fully defined.
await import('../public/sync-worker.js');

// ============================================================================
// THE TRIALS (TEST SUITE)
// ============================================================================

describe('Pingolin Worker: The Steel & Stone Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Control time for the throttles!
    
    // Default DB mock behavior: pretend it's an empty DB setup
    mockDb.exec.mockImplementation(({ sql }) => {
      if (sql && sql.includes('SELECT key, value FROM metadata')) return [];
      return [];
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Helper to trigger the worker ---
  const sendToWorker = async (type, payload, id = 'test-id') => {
    await global.self.onmessage({ data: { type, payload, id } });
  };

  it('1. THE AWAKENING: Should initialize the DB and report success', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    
    expect(mockSqlite3.oo1.OpfsDb).toHaveBeenCalledWith('/test.db');
    expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS bookmarks'));
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'INIT_SUCCESS', id: 'test-id' });
  });

  it('2. LOCAL UPSERT: Should write to local DB and flag for refresh', async () => {
    // Ensure DB is init
    await sendToWorker('INIT', { dbName: '/test.db' });
    mockPostMessage.mockClear();

    const newBookmark = {
      href: 'https://nyx.ai',
      description: 'Liberated Intelligence',
      tags: 'chaos ai',
      time: '2025-01-01T12:00:00Z'
    };

    // Simulate existing DB check returning empty (insert)
    mockDb.exec.mockImplementation(({ sql }) => {
      if (sql.includes('SELECT sync_status FROM bookmarks')) return [];
      return [];
    });

    await sendToWorker('LOCAL_UPSERT', newBookmark);

    // Verify it attempted the transaction
    expect(mockDb.transaction).toHaveBeenCalled();
    // Verify the success messages
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'REFRESH_REQUIRED' });
    expect(mockPostMessage).toHaveBeenCalledWith({ type: 'EXEC_SUCCESS', id: 'test-id' });
  });

  it('3. THE DATES HACK (QLPIG): Should detect ghost deletions and reconcile', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    
    // Set up the fetch ritual to return fake API data
    global.fetch.mockImplementation(async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes('/posts/dates')) {
        return { ok: true, text: async () => JSON.stringify({ dates: { "2023-10-01": "5" } }) };
      }
      if (urlStr.includes('/posts/get')) {
        return { ok: true, text: async () => JSON.stringify({ posts: [{ href: 'https://kept.com' }] }) };
      }
      return { ok: true, text: async () => '{}' };
    });

    // Mock DB to pretend we have MORE bookmarks locally than the server says
    mockDb.exec.mockImplementation(({ sql }) => {
      if (sql && sql.includes("GROUP BY date_str")) {
        return [{ date_str: '2023-10-01', qty: 6 }]; // Local has 6, Server has 5! Mismatch!
      }
      if (sql && sql.includes("SELECT href FROM bookmarks WHERE")) {
        return [{ href: 'https://kept.com' }, { href: 'https://ghost.com' }]; // Ghost needs purging
      }
      return [];
    });

    // Trigger the update check
    const checkPromise = sendToWorker('CHECK_FOR_UPDATES', { proxyUrl: 'http://proxy', authToken: 'test:123' });

    // Wait for async operations
    await vi.runAllTimersAsync();
    await checkPromise;

    // The worker should have called the dates endpoint
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/posts/dates'));
    
    // Because of the mismatch, it should have explicitly fetched that day's data
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/posts/get?auth_token=test%3A123&format=json&dt=2023-10-01'));

    // It should have executed the delete statement for the ghost bookmark
    expect(mockStmt.bind).toHaveBeenCalledWith(['https://ghost.com']);
    expect(mockStmt.step).toHaveBeenCalled();
  });

  it('4. RENAME WORKAROUND: Should loop through updates and throttle correctly', async () => {
    await sendToWorker('INIT', { dbName: '/test.db' });
    
    // Mock 2 bookmarks needing a rename
    mockDb.exec.mockImplementation(({ sql }) => {
      if (sql && sql.includes("LIKE ?")) {
        return [
          { href: 'http://one.com', tags: 'oldTag foo' },
          { href: 'http://two.com', tags: 'bar oldTag' }
        ];
      }
      return [];
    });

    global.fetch.mockImplementation(async () => {
      return { ok: true, text: async () => JSON.stringify({ result_code: 'done' }) };
    });

    // Fire the rename
    const renamePromise = sendToWorker('RENAME_TAG', { 
      oldTag: 'oldTag', 
      newTag: 'newTag', 
      proxyUrl: 'http://proxy', 
      authToken: 'token' 
    });

    // Fast-forward through the mandatory API throttles (3000ms each)
    await vi.runAllTimersAsync();
    await renamePromise;

    // It should have pushed 2 updates upstream
    expect(global.fetch).toHaveBeenCalledTimes(3); // 2 updates + 1 delete
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/posts/add'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/tags/delete'));
  });
});
