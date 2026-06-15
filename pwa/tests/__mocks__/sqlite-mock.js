import { vi } from 'vitest';

export const mockStmt = {
  bind: vi.fn(),
  step: vi.fn(),
  reset: vi.fn(),
  finalize: vi.fn()
};

export const mockDb = {
  exec: vi.fn(),
  transaction: vi.fn((cb) => cb(mockDb)),
  prepare: vi.fn(() => mockStmt)
};

// We swap the arrow functions '() =>' for standard 'function() {}'
// This grants the mock the [[Construct]] internal method, allowing the 
// worker to use the 'new' keyword without V8 throwing a fatal TypeError.
export const mockSqlite3 = {
  opfs: true, // <-- THE MISSING LYNCHPIN: Tell the worker OPFS is available!
  oo1: { 
    OpfsDb: vi.fn(function() { return mockDb; }),
    DB: vi.fn(function() { return mockDb; }) 
  }
};

export default vi.fn(() => Promise.resolve(mockSqlite3));
