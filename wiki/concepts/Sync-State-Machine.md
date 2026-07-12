# Anatomy of the Sync State Machine

## Overview
The Sync State Machine (codified in `Sync.elm`) is the "General" of the Pingolin PWA. While the UI domains (`Auth`, `Archive`, `BookmarkForm`) handle the "what" (rendering and user input), the State Machine handles the "how" of data synchronization.

## The Projection: `SyncEnv`
As defined in `spec/session-bootstrap-option-b.md`, the State Machine does NOT operate on the global `AppState.Model`. Instead, it operates on a **projection** called `SyncEnv`.

**Why this is critical:**
1. **Decoupling:** `Sync.elm` doesn't need to know about `scrollTop`, `viewportHeight`, or whether the `AddForm` is open.
2. **Stability:** Changes to the UI model cannot break the sync logic.
3. **Testability:** The sync logic can be tested as a pure function: `(WorkerMsg, SyncEnv) -> (SyncEnv, Cmd Msg)`.

## The Phases (`SyncPhase`)
The state machine moves through a strict lifecycle to ensure reliability:
- `SyncIdle`: Waiting for a trigger.
- `SyncCheckingUpdate`: Calling `/posts/update` to see if the server has newer data.
- `SyncHydrating`: Performing the "Big Pull" for new devices.
- `SyncCheckingDates`: Using the **Dates Hack** to find deletions.
- `SyncReconcilingDay`: Fetching specific days to prune ghosts.
- `SyncFlushing`: Pushing local `PENDING` changes upstream.

## The Bridge: `Main.elm`
`Main.elm` acts as the diplomatic interpreter. It is the only place where the `SyncEnv` is flattened from the `Model` and inflated back into it.

### The Critical Path:
`WorkerMsg` $\rightarrow$ `Main.update` $\rightarrow$ `Sync.handleWorkerMsg(SyncEnv)` $\rightarrow$ `nextEnv` $\rightarrow$ `Main.inflate(nextEnv)` $\rightarrow$ `Model`.

## Summary of Importance
Without this state machine, the app would be a chaotic mess of `setTimeout` calls and race conditions. The `SyncPhase` ensures that we never attempt to prune a day before we've verified the date counts, and we never flush changes while a hydration is in progress. It transforms a complex asynchronous process into a **deterministic sequence of states**.
