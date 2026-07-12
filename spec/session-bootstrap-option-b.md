# Session Bootstrap: Option B — The Level 1 Boss (v3.0.22 → v3.1.2 Domain Migration)
v3.0.22 restored. Ready for the next struggle.

## Invoke First
Read and follow the instructions in `.agents/skills/elm-machine-studying-wiki/SKILL.md` before doing anything else.

---
## Context
We are continuing the **Elm Refactoring Study** defined in `spec/elm-refactoring-study.md`.

We have completed **Step 1** (v3.0.22: Sovereign Decomposition).
We are now beginning **Step 2**: the migration from the flat model architecture (v3.0.22, tag `6cace23`) toward the **federated domain architecture** that exists in the current codebase (approximately v3.1.2, tag `e000246`).

The goal is **not** to mechanically reproduce the exact commits. The goal is to **understand and practice** the structural patterns involved, arrive at a working implementation that passes all 28 Playwright E2E Fortress scenarios, and codify every friction point into the wiki.

---
## The Target Architecture
The final state of the codebase (HEAD / v3.1.2) has these source files in `pwa/src/`:

AppState.elm     ← NEW: holds the nested Model type alias
Auth.elm         ← NEW: Auth.Model, Auth.Msg, Auth.update, Auth.view
Archive.elm      ← NEW: Archive.Model, Archive.Msg, Archive.update, Archive.view
BookmarkForm.elm ← NEW: BookmarkForm.Model, BookmarkForm.Msg, BookmarkForm.update, BookmarkForm.view
Main.elm         ← REFACTORED: thin orchestrator, delegates to domains
Rpc.elm          ← UNCHANGED from v3.0.22
Sync.elm         ← UNCHANGED from v3.0.22 (still operates on flat Model)
Types.elm        ← LARGELY UNCHANGED (shared domain entities only)

The key structural insight is that `Sync.elm` continues to operate on a **flat `Model` projection** (a `SyncEnv` record) — it does NOT know about the nested domain sub-models.
`Main.elm` is the only place that flattens (Model → SyncEnv) and inflates (SyncEnv → nested sub-models) across the boundary.

---
## The Critical Patterns to Implement (Pre-Loaded from Wiki)
All of these are documented in the wiki. Read them before starting:

1. **`wiki/Fixing-State-Loss-in-Federated-Models.md`** — The two-phase flatten/inflate pattern for `FromWorker`.
2. **`wiki/concepts/Sovereign-Domain-Pattern.md`** — The `updateWith` helper, message wrapping, and `Html.map` for views.
3. **`wiki/Sovereign-Domain-Migration.md`** — The explicit reconstruction law.
4. **`wiki/concepts/Monolith-Decomposition-Rules.md`** — The `mapSyncMsg` bridge pattern.
5. **`wiki/Elm-Where-Clauses.md`** — Compiler law: no Haskell-style `where` inside `let` blocks.

---
## The Execution Protocol
### Step 0: Establish the Sandbox
```bash
git reset --hard HEAD && git clean -fd && git checkout -f 6cace23
```
The sandbox should now be at v3.0.22.

### Step 1: Study the Diff First (Archaeological Survey)
```bash
git diff 6cace23..e000246 -- pwa/src/
```

### Step 2: Implement the Migration
Order of implementation:
1. `Types.elm`
2. `Auth.elm`
3. `Archive.elm`
4. `BookmarkForm.elm`
5. `AppState.elm`
6. `Main.elm`

### Step 3: The Mandatory Verification Ritual
ALWAYS compile before running tests:
`npx elm make src/Main.elm --output=public/main.js`

Then run the full test suite:
`npm run test:unit && npm run test:e2e`
Target: **14/14 unit tests + 28/28 E2E Fortress scenarios passing.**

### Step 4: Wiki Integration
Every compiler error that teaches something new gets a page.

---
## The Known Boss Mechanics (Pre-loaded Intel)
### Boss Attack 1: The Amnesia Trap (State Loss in FromWorker)
`Sync.handleWorkerMsg` returns a flat updated model. `Main.elm` must explicitly reconstruct domain models.

### Boss Attack 2: The Circular Import Gremlin
Dependency graph: `Types ← Auth/Archive/Form ← AppState ← Main`.

### Boss Attack 3: The mapSyncMsg Gap
Every `FromWorker` branch must end with `Cmd.map mapSyncMsg cmd`.

### Boss Attack 4: The UI-Only State Wipe
`scrollTop`, `viewportHeight`, `newBookmark`, `showAddForm` must be preserved from the existing model during inflation.

---
## Success Criteria
- [ ] `ls pwa/src/` shows all 9 modules.
- [ ] `npx elm make src/Main.elm` → Success!
- [ ] `npm run test:unit` → 14/14 passed.
- [ ] `npm run test:e2e` → 28/28 passed.
