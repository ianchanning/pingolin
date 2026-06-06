# Phase 1.1: Stabilization & The Universal Validator

## Goals
Refine the current prototype into a "Golden Master" state. Fix lingering UI/Sync bugs and establish a language-agnostic E2E test suite to facilitate safe future migrations.

---

## 1. UI: The Dynamic Viewport (Flexbox Overhaul)
**Problem:** The current fixed-height viewport (`70vh`) causes the list to overflow the screen when the "Add Form" is toggled, or leaves excessive dead space on large displays.
**Solution:**
- Refactor `#app` to use `display: flex; flex-direction: column; height: 100vh;`.
- Set `#viewport` to `flex: 1; min-height: 0;`.
- This ensures the list always fills the available space and shrinks/expands dynamically when the header or add-form changes size.

## 2. Search: The Punctuation Paradox
**Problem:** FTS5 tokenizer ignores punctuation (`.` and `:`), making it impossible to search for exact tags like `subject:cs.CL`.
**Solution:**
- Implement a dual-query strategy in the Worker.
- Use FTS5 for general text search.
- Add a specific `tags LIKE ?` filter for exact tag matching (e.g., searching for `#tagname`).
- Ensure the UI search bar recognizes a `#` prefix as an "Exact Tag" instruction.

## 3. Sync: The "Ghost Ingestion" Bug
**Problem:** Server-side additions are downloaded into SQLite, but they don't appear in the UI until a manual refresh.
**Solution:**
- Audit `SyncOrchestrator.startLoop`.
- Ensure `(window as any).refreshApp()` is called immediately after `db.upsertBatch(additions)` completes.
- Verify that `last_full_sync_time` uses a format compatible with Pinboard's `fromdt` parameter (UTC ISO-8601).

## 4. Search: URL-Driven State & Tag Deep Linking
**Problem:** The current search state is lost on refresh, and tags in the list are static text.
**Solution:**
- Synchronize the search input with a `?q=` URL parameter.
- On page load, read the `q` parameter and trigger an initial search.
- Use `history.replaceState` to update the URL in real-time as the user types (debounced).
- Transform tags in the bookmark list into clickable links.
- Clicking a tag should set the search query to `#tagname` (Exact Match mode) and update the URL.

## 5. Validation: The Universal Fortress (Playwright)
**Problem:** We need a way to verify the application's behavior that survives a complete rewrite in PureScript/ClojureScript.
**Plan:**
- See **[SPEC-004: The Universal Testing Fortress](./004-testing-scenarios.md)** for detailed rituals.
- Initialize Playwright in the `pwa/` directory.
- Implement **Page Object Model (POM)** for the main interface (Search, Add Form, List).
- **Mock Strategy:**
  - Use Playwright's `page.route()` to intercept proxy calls.
  - Create JSON fixtures for:
    - `/posts/update` (handshake)
    - `/posts/all` (ingestion/deltas)
    - `/posts/dates` (the Dates Hack)
    - `/posts/add` / `/posts/delete` (write-back)

---

## Success Criteria
- [x] UI layout is responsive to form toggles with 0 scrollbar jitter.
- [x] Searching for `#subject:cs.CL` returns exact matches including punctuation.
- [x] Background additions appear in the list automatically within 5 seconds of the sync loop.
- [x] A complete Playwright test suite passes against the current JS implementation.
