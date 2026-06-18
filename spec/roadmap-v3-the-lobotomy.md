# Implementation Plan: Phase 5 - The Great Lobotomy (Sovereign RPC Architecture)

## Overview
To achieve true 30-year `0M` (Zero Maintenance) reliability, we must extract all business logic, API knowledge, and state management from the volatile `sync-worker.js`. The Worker becomes a "Dumb Muscle" RPC interface (pure I/O), controlled by a Sovereign State Machine (currently implemented in Elm, but architecturally interchangeable).

## Phase 5.0: Forging the RPC Spinal Cord (Worker Side) ✅
**Goal:** Strip `sync-worker.js` of Pinboard domain logic and expose raw, strictly typed I/O capabilities.
- [x] **Establish RPC Handlers:** Replace domain-specific messages (`CHECK_FOR_UPDATES`, `RENAME_TAG`) with generic execution channels:
  - `RPC_FETCH`: Payload `{ proxyUrl, path, params }`. Worker hits the proxy, returns raw text/JSON.
  - `RPC_SQL_QUERY`: Payload `{ sql, bind }`. Worker reads DB, returns row arrays.
  - `RPC_SQL_EXEC`: Payload `{ sql, bind }`. Worker mutates DB, returns success/fail.
  - `RPC_SQL_TRANSACTION`: Payload `[{ sql, bind }, ...]`. Executes batch mutations atomically.
- [x] **Retain the "Big Pull" Blackbox:** Keep `START_HYDRATION` intact inside the worker.
- [x] **Kill the Heartbeat:** Deleted all `setInterval` and `setTimeout` calls from the worker.

## Phase 5.1: The Cartridge Slot (Adapter Boundary) ✅
**Goal:** Prepare the Sovereign UI layer (Elm) to act as the General, issuing commands and interpreting raw I/O results.
- [x] **Update Adapter Types:** `RpcState` type added (`RpcPending | RpcSuccess | RpcFailed`). `WorkerMsg` updated: `RpcSuccessMsg String (Maybe Value)` and `RpcErrorMsg String String String` (id-correlated).
- [x] **Implement Request Tracking:** `inFlightRpcs : Dict String RpcState` added to Model and initialised to `Dict.empty`. All RPC builder helpers (`rpcFetch`, `rpcSqlQuery`, `rpcSqlExec`, `rpcSqlTransaction`) atomically insert `RpcPending` and dispatch `toWorker`.
- [x] **Strict Deserialization:** `workerMessageDecoder` now decodes `RPC_SUCCESS` payload as opaque `Decode.Value` (preserved for Phase 5.2+ routing). `RPC_ERROR` now carries `id`, `message`, and `code`.

## Phase 5.2: Sovereign Time & The Flush Queue
**Goal:** The State Machine assumes absolute control over the passage of time and network mutation pacing.
- [ ] **Deterministic Heartbeat:** The State Machine's own effect-scheduler (e.g., Elm's `Time.every`) triggers the synchronization loop.
- [ ] **The Flush Query:** The UI triggers an `RPC_SQL_QUERY` for `PENDING_*` records.
- [ ] **Controlled Throttling:** If records exist, the State Machine enforces the mandatory 3000ms Pinboard API delay using pure delayed effects (e.g., Elm's `Process.sleep`), firing `RPC_FETCH` mutations sequentially while dynamically updating the UI ("Flushing X of Y").

## Phase 5.3: Relocating the QLPIG Dates Hack (Delta Sync)
**Goal:** The complex, multi-step delta reconciliation becomes pure functional logic in the UI thread.
- [ ] State Machine issues `RPC_SQL_QUERY` for local date distributions.
- [ ] State Machine issues `RPC_FETCH` for `/posts/dates`.
- [ ] State Machine runs pure comparison logic to find mismatches.
- [ ] For mismatches, State Machine issues `RPC_FETCH` for `/posts/get?dt=...`.
- [ ] State Machine calculates exact ghost `href`s and issues `RPC_SQL_TRANSACTION` to purge.

## Phase 5.4: Relocating the Rename Workaround
**Goal:** Extract the volatile 3-step tag rename loop out of the worker.
- [ ] State Machine issues `RPC_SQL_QUERY` for bookmarks with the old tag.
- [ ] State Machine processes the string replacements purely in memory.
- [ ] State Machine issues `RPC_SQL_TRANSACTION` to update local UI state.
- [ ] State Machine orchestrates throttled `RPC_FETCH` calls to `/posts/add`, followed by `/tags/delete`.

## Phase 5.5: RPC Error Contract (Resilient Failure Propagation)
**Goal:** Every RPC failure must be identifiable, recoverable, and never silently swallowed.

### The Error Envelope
All worker-side failures must respond with a **correlated error message** that preserves the originating request `id`:
```js
// Worker always echoes the id back, even on failure.
self.postMessage({ type: 'RPC_ERROR', id, payload: { message: err.message, code: err.code ?? 'UNKNOWN' } });
```
This allows the State Machine's `Dict String RpcState` to match the error back to its pending request and transition the correct sub-state to `Failed`, rather than leaving dangling in-flight entries.

### Error Categories the State Machine Must Handle
| Category | `code` | State Machine Response |
|----------|--------|------------------------|
| Network failure (proxy unreachable) | `NETWORK_ERROR` | Retry after backoff; surface "Offline" status |
| HTTP error (4xx / 5xx from Pinboard) | `HTTP_<status>` | Surface error message; halt flush loop |
| SQL error (schema mismatch, constraint) | `SQL_ERROR` | Log + surface; do **not** retry automatically |
| Timeout (hung fetch) | `TIMEOUT` | Cancel in-flight; retry next heartbeat |
| Unknown / unexpected | `UNKNOWN` | Surface verbatim; treat as fatal for that request |

### Worker-Side Implementation Requirements
- [ ] Wrap **every** `RPC_*` handler in a `try/catch` that posts `RPC_ERROR` with the originating `id`.
- [ ] Distinguish HTTP errors (non-`response.ok`) from network errors (fetch throws) and set the appropriate `code`.
- [ ] Never let an unhandled rejection escape the `self.onmessage` handler — the global `catch` block at the bottom of the switch statement must always emit `RPC_ERROR`.

### State Machine-Side Requirements
- [ ] The `Dict String RpcState` entry transitions: `Pending → Success` or `Pending → Failed { message, code }`.
- [ ] A `Failed` RPC in the middle of a multi-step sequence (e.g., Dates Hack) must **halt** that sequence and surface the error — not silently continue to the next step.
- [ ] The UI must display a human-readable error state distinguishing "network offline" from "sync conflict" from "database error".

---

## Phase 5.6: Black Box RPC Testing
**Goal:** Ensure the Vitest suite validates the Worker strictly as an I/O conduit, including all failure paths.

### Worker Unit Tests (`sync-worker.spec.js` via Vitest)
After the Lobotomy, the worker tests become **beautifully simple** — no Pinboard domain knowledge required:

**`RPC_FETCH` tests:**
- [ ] Given `{ path, params }`, verify `fetch` is called with the correct fully-qualified proxy URL.
- [ ] Verify the raw JSON response is returned unchanged as the `payload`.
- [ ] On `!response.ok`, verify `RPC_ERROR` is posted with `code: 'HTTP_<status>'` and the correct `id`.
- [ ] On network throw (fetch rejects), verify `RPC_ERROR` is posted with `code: 'NETWORK_ERROR'`.

**`RPC_SQL_QUERY` tests:**
- [ ] Given `{ sql, bind }`, verify `db.exec` is called with the correct arguments.
- [ ] Verify the row array is returned as `payload`.
- [ ] On DB exception, verify `RPC_ERROR` is posted with `code: 'SQL_ERROR'`.

**`RPC_SQL_EXEC` tests:**
- [ ] Given `{ sql, bind }`, verify `db.exec` is called and `RPC_SUCCESS` is returned.
- [ ] On DB exception, verify `RPC_ERROR` is posted with `code: 'SQL_ERROR'`.

**`RPC_SQL_TRANSACTION` tests:**
- [ ] Given an array of `{ sql, bind }`, verify all statements execute inside a single `db.transaction`.
- [ ] On partial failure mid-transaction, verify the transaction is rolled back and `RPC_ERROR` is posted.

**`START_HYDRATION` tests (the retained black-box):**
- [ ] Verify chunked insertion produces the correct `SYNC_PROGRESS` updates.
- [ ] Verify `SYNC_COMPLETE` is posted with the correct bookmark count after a successful hydration.
- [ ] Verify `RPC_ERROR` is posted if the proxy returns a non-OK response.

**Error contract tests:**
- [ ] For every `RPC_*` message type, verify that an unknown exception always results in an `RPC_ERROR` message containing the originating `id`.
- [ ] Verify that `id` is **never** undefined in any `RPC_ERROR` payload.

### State Machine Unit Tests (`elm-test`)
Because the business logic now lives in pure Elm functions, each phase becomes independently testable:
- [ ] **Dates Hack comparison:** Given a local date map and a server date map, verify the pure function returns exactly the mismatched date strings.
- [ ] **Ghost calculation:** Given a server `href` set and a local `href` list, verify the deletion list is exact.
- [ ] **Flush throttle logic:** Verify the state transitions correctly sequence `Pending → Flushing → Idle` with the expected `Process.sleep` delays.
- [ ] **Rename logic:** Given a list of bookmarks and old/new tag strings, verify the pure in-memory replacement produces the correct updated records.
- [ ] **RPC in-flight tracking:** Verify that a `Dict String RpcState` correctly transitions to `Failed` when an `RPC_ERROR` with a matching `id` arrives, and does not affect other in-flight entries.

### Playwright E2E Tests (The Universal Fortress)
The existing Playwright suite remains the **integration contract** — it should not need to know about RPC internals:
- [ ] All existing 20 scenarios must pass without modification after the Lobotomy (black-box guarantee).
- [ ] Add a Scenario 26: **RPC Error Recovery** — simulate a proxy failure mid-sync and verify the UI surfaces a human-readable error and the app remains usable (does not freeze or blank).
