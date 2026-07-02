# Pinboard State Flow: Worker to Model

This document maps the critical hand-off points between the asynchronous worker and the synchronous Elm state.

## The Pipeline
`Worker (JS)` $\rightarrow$ `FromWorker (Msg)` $\rightarrow$ `Sync.handleWorkerMsg` $\rightarrow$ `SyncEnv` $\rightarrow$ `Main.Model`

## The "Amnesia" Trap
A critical failure occurred where `Sync.handleWorkerMsg` correctly updated the `SyncEnv` (the temporary projection), but `Main.update` failed to write those changes back into the `Main.Model`.

**The Leak Point:**
In `Main.elm`, the `FromWorker` handler was updating the `status` and `bookmarks`, but ignoring the `auth` and `query` fields of the returned `nextEnv`.

**The Fortification:**
Every field in `SyncEnv` that represents persistent or session-level state **MUST** be explicitly mapped back:
- `nextEnv.token` $\rightarrow$ `model.auth.token`
- `nextEnv.proxyUrl` $\rightarrow$ `model.auth.proxyUrl`
- `nextEnv.query` $\rightarrow$ `model.archive.query`
- `nextEnv.tagSuggestions` $\rightarrow$ `model.form.tagSuggestions`

## Verification Checklist
- [ ] Does the `WorkerMsg` payload contain the field?
- [ ] Does the `WorkerMessageDecoder` decode it?
- [ ] Does `Sync.handleWorkerMsg` apply it to the `SyncEnv`?
- [ ] Does `Main.update` write it back to the `Model`?
