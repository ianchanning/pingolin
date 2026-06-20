import { vi } from 'vitest';

// -------------------------------------------------------------------
// Minimal Web‑Worker global mock
// -------------------------------------------------------------------
const selfMock = {
  // The worker calls this to send messages back to the UI
  postMessage: vi.fn(),

  // The worker assigns its message handler here
  onmessage: () => {},

  // The worker may listen for 'error' or other events
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),

  // In the real worker `self` is also a `WorkerGlobalScope` with a `console`
  // forward to the real console so debugging still works.
  console,
};

// Expose it as the global `self` used by the worker script.
// NOTE: use `globalThis` – it works in both Node and jsdom.
globalThis.self = selfMock;

// -------------------------------------------------------------------
// Stub `fetch` (the worker uses it for the proxy)
// -------------------------------------------------------------------
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({}),
  text: async () => '',
});
