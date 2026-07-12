# The Law of Functional Parity

## The Sovereign Law
**Compilation is not Verification.** In a federated architecture, the most dangerous bugs are not syntax errors, but "silent" state-loss bugs during the inflation phase.

## The Trigger
The codebase compiles perfectly, and E2E tests fail on "visual" assertions (e.g., "expect bookmark count to be 2" but it is 0), even though the logs show the data was successfully fetched from the server.

## The Pattern: The Inflation Gap

### The Setup
The `Sync.handleWorkerMsg` returns a flat `SyncEnv`. `Main.update` must then "inflate" this into the nested `AppState.Model`.

### The Failure (Shattered State)
The developer blindly patches the model:
`{ model | auth = { model.auth | token = nextEnv.token } }`
This looks correct, but it often overwrites UI-only state (like `showLoginForm` or `scrollTop`) or fails to trigger a necessary view refresh because the reference change was too shallow.

### The Fix (Sovereign State)
Use a verbose, explicit reconstruction:
1. **Flatten:** Create a `SyncEnv` from the current `Model`.
2. **Process:** Get `nextEnv` from `Sync.handleWorkerMsg`.
3. **Inflate:** Explicitly assign every field, combining `nextEnv` truths with `model` (UI) truths.
   - `bookmarks = nextEnv.bookmarks` (Server truth)
   - `scrollTop = model.archive.scrollTop` (UI truth)

**Rule:** If a field exists in both the `SyncEnv` and the `DomainModel`, you must consciously decide who wins. Never use blind record updates for the inflation phase.
