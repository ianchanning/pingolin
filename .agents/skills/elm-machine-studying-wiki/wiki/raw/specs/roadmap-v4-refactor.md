# Implementation Plan: Phase 6 - The Modularization (Sovereign Decomposition)

## Overview
Now that all business logic has been successfully relocated to `Main.elm` (Phase 5), the `Main.elm` file has become a "God Module." To maintain long-term maintainability and testability, we will decompose the monolithic state machine into specialized modules.

## 1. `Types.elm` (The Domain Foundation)
**Goal:** Centralize all shared data structures to avoid circular dependencies.
- Move `Model`, `Msg`, `Bookmark`, `SyncPhase`, `RpcState`, and `PendingRow` here.
- Move all `Json.Decode` decoders (`bookmarkDecoder`, `workerMessageDecoder`, etc.) to ensure consistency across the app.

## 2. `Rpc.elm` (The I/O Conduit)
**Goal:** Encapsulate the wire protocol and the `inFlightRpcs` tracking logic.
- Move all `rpc*` builder helpers: `rpcFetch`, `rpcSqlQuery`, `rpcSqlExec`, `rpcSqlTransaction`.
- Move `rpcResult` and `rpcClear`.
- This module will be the only place where `Encode.object` is used to construct worker envelopes.

## 3. `Sync.elm` (The Sovereign State Machine)
**Goal:** Isolate the complex sync orchestration from the UI rendering.
- Move `handleWorkerMsg` and `routeRpcSuccess`.
- Move all specific sync handlers:
    - Heartbeat logic: `handleHeartbeatUpdate`.
    - Delta Sync (Dates Hack): `handleDeltaFetchResult`, `reconcileNextDay`, etc.
    - Flush Queue: `flushNext`, `handleFlushDone`.
    - Tag Rename: `handleRenameQueryResult`, `renamePushNext`, etc.

## 4. Finalizing `Main.elm`
**Goal:** Reduce `Main.elm` to a thin UI layer.
- `update` becomes a high-level dispatcher that calls `Sync.handleWorkerMsg` or `Rpc` helpers.
- `view` remains the primary source of HTML generation.
- This separation ensures that the "Business Logic" (how syncing works) is decoupled from the "Presentation" (how it looks).

## Verification Plan
- **Regression Testing:** Run the Playwright E2E suite to ensure no behavior changed.
- **Type Check:** Ensure the Elm compiler accepts the new module boundaries.
