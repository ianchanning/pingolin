# Implementation Plan: Phase 7 - The Sovereign Domain Migration

## Overview
Following the "Sovereign Decomposition" of business logic (Phase 6), `Main.elm` remains a "UI God Module." While visually organized via helper functions, it still manages the entirety of the UI state and update logic. 

To ensure 30Y durability and developer sanity, we are migrating from a "flat model" to a "federated domain" architecture. This shift follows the core Elm principle: **Modules should be built around a central type.**

## 1. The Architectural Shift
We are moving away from "Component-based" thinking (visual fragments) and toward "Domain-based" thinking (state ownership).

**Current State (Flat):**
`Main.Model` contains all fields $\rightarrow$ `Main.update` handles all messages $\rightarrow$ `Main.view` composes all HTML.

**Target State (Federated):**
`Main.Model` nests child models $\rightarrow$ `Main.update` delegates to child update functions $\rightarrow$ `Main.view` maps child views into the global message space.

## 2. Domain Definitions

### A. `Auth.elm` (The Gateway Domain)
- **Type Ownership:** `Auth.Model`
- **State:** `{ token : String, proxyUrl : String, showLoginForm : Bool }`
- **Responsibility:** Managing credentials and the entry ritual.

### B. `Archive.elm` (The Knowledge Domain)
- **Type Ownership:** `Archive.Model`
- **State:** `{ query : String, bookmarks : List Bookmark, scrollTop : Int, viewportHeight : Int }`
- **Responsibility:** Search orchestration, virtual list calculations, and bookmark display.

### C. `BookmarkForm.elm` (The Forge Domain)
- **Type Ownership:** `BookmarkForm.Model`
- **State:** `{ newBookmark : Bookmark, showAddForm : Bool, tagSuggestions : List String }`
- **Responsibility:** Input handling for new entries and tag discovery.

## 3. Execution Roadmap

### Step 1: Type Purification (`Types.elm`)
- Remove UI-specific state fields from the global `Model` in `Types.elm`.
- Retain only shared domain entities (`Bookmark`, `SyncPhase`, `RpcState`).

### Step 2: Domain Extraction
Extract logic into the new modules in the following order:
1. **`Auth.elm`**: Extract `Auth.Model`, `Auth.Msg`, `Auth.update`, and `Auth.view`.
2. **`BookmarkForm.elm`**: Extract `BookmarkForm.Model`, `BookmarkForm.Msg`, `BookmarkForm.update`, and `BookmarkForm.view`.
3. **`Archive.elm`**: Extract `Archive.Model`, `Archive.Msg`, `Archive.update`, and `Archive.view`.

### Step 3: The Orchestrator Refactor (`Main.elm`)
- **Model:** Update `Model` to nest the three domain models.
- **Msg:** Add wrapper messages: `GotAuthMsg Auth.Msg`, `GotArchiveMsg Archive.Msg`, `GotFormMsg BookmarkForm.Msg`.
- **Update:** Implement delegation logic using the `updateWith` pattern to route messages to the correct domain.
- **View:** Use `Html.map` to integrate domain views into the `Main` view.

## 4. Verification Protocol
- **Type Check:** Ensure the Elm compiler accepts the new module boundaries without circular dependencies.
- **Regression Test:** Run the Playwright E2E suite (`npm run test:e2e`) to verify that no visual or functional regressions were introduced during the migration.
- **State Audit:** Verify that the "Sovereign State Machine" in `Sync.elm` still interacts correctly with the nested models.
