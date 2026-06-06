# SPEC-004: The Universal Testing Fortress (Unified Playwright Scenarios)

## 1. Objective
Establish a language-agnostic, behavior-driven E2E test suite that treats the PWA as a "Black Box." These tests must pass regardless of whether the underlying implementation is TypeScript, PureScript, or a hand-cranked state machine.

---

## 2. Test Architecture: The POM (Page Object Model)
To ensure durability, we decouple the *intent* of the test from the *selectors* of the UI.
- **`AppPage`**: Handles Token Input, Search, List Visibility, and Sync Status.
- **`BookmarkItem`**: Represents a single row in the virtualized list.
- **`AddForm`**: Handles local creation of bookmarks.

### Locators (The `data-testid` Mandate)
We will utilize explicit `data-testid` attributes to ensure test stability:
- `[data-testid="sync-status"]`: Transient status (SYNCING, READY).
- `[data-testid="sync-progress"]`: Detailed background indexing status text.
- `[data-testid="network-status"]`: Offline/Online banner.
- `[data-testid="search-input"]`: The main search bar.
- `[data-testid="bookmark-item"]`: A single bookmark row.
- `[data-testid="pending-icon"]`: Dirty state indicator for unsynced changes.
- `[data-testid="add-button"]`: Trigger for the add form.
- `[data-testid="save-button"]`: Submit the add/edit form.

---

## 3. Mock Strategy: The Proxy Simulator
We intercept all calls to the Cloudflare Proxy (`/api/*`) using Playwright's `page.route()`.
- **`mockUpdate(timestamp)`**: Simulates `/posts/update`.
- **`mockAll(bookmarks)`**: Simulates `/posts/all`.
- **`mockRecent(bookmarks)`**: Simulates `/posts/recent`.
- **`mockGet(bookmarks)`**: Simulates `/posts/get`.
- **`mockDates(dateCounts)`**: Simulates `/posts/dates`.
- **`mockAdd(status)`**: Simulates `/posts/add`.

---

## 4. Test Scenarios (The Rituals)

### Scenario 1: The Bootstrap Launch (First-Page Priority)
- **Objective:** Verify that on a fresh launch with an empty database, the app loads instantly by fetching only the first page.
- **Steps:**
    1. Initialize database in an empty state.
    2. Mock `/posts/recent` to return 100 mock bookmark entries.
    3. Launch the PWA.
- **Assertions:**
    1. `[data-testid="sync-status"]` briefly shows `SYNCING`.
    2. Exactly 100 `[data-testid="bookmark-item"]` rows are rendered in under 100ms.
    3. The app transitions into "Background Hydration" mode.
    4. "Handshake Sentinel" (`last_full_sync_time`) is written to metadata.

### Scenario 2: Background Hydration & Progress Indicator
- **Objective:** Verify that the background thread lazily pulls down the remaining archive pages and updates the progress bar.
- **Given:** Bootstrap sync is complete.
- **When:** The background worker starts the hydration loop (mocking 300 total records).
- **Assertions:**
    1. `[data-testid="sync-progress"]` displays progress (e.g., `"Indexing older bookmarks... (100 / 300)"`).
    2. The list remains responsive (60fps) during chunked insertion.
    3. Virtual list height updates, but the active viewport remains stable.
    4. Final row count matches the total server count.

### Scenario 3: The Punctuation Paradox (Search)
- **Objective:** Verify that FTS5 handles special punctuation (`.` and `:`) for exact tag filtering.
- **Given:** Database seeded with:
    - Bookmark A: Tags: `subject:cs.AI`, `tui`
    - Bookmark B: Tags: `subject:cs.CL`, `terminal`
- **When:** User types `#subject:cs.AI` into `[data-testid="search-input"]`.
- **Assertions:**
    1. Bookmark A is visible.
    2. Bookmark B is hidden (verifying `:` and `.` delimiters work).
    3. FTS5 fuzzy logic is bypassed for the `#` prefix.

### Scenario 4: The Ghost Ingestion (Delta Sync)
- **Objective:** Verify background updates appear without refresh.
- **Given:** App is open and idle.
- **When:** Server update detected (mocked via `/posts/update`).
- **Then:**
    1. Sync loop triggers `/posts/all?fromdt=...`.
    2. New record appears at the top of the list instantly.
    3. `[data-testid="sync-status"]` flashes activity.

### Scenario 5: The Deletion Exorcism (The Dates Hack)
- **Objective:** Verify bookmarks deleted on the server are pruned from local SQLite.
- **Given:** Local state has 1 record for `2023-10-01`.
- **When:** Mock `/posts/dates` returns `0` for `2023-10-01`.
- **Then:**
    1. App detects mismatch.
    2. App fetches `/posts/get?dt=2023-10-01` (returns empty).
    3. Record is pruned from SQLite and removed from UI.

### Scenario 6: The Offline Adding & Immediate Local Write
- **Objective:** Verify offline additions write instantly to SQLite with a pending indicator.
- **Given:** `page.setOffline(true)`.
- **When:** User saves a new bookmark via the add form.
- **Assertions:**
    1. `[data-testid="network-status"]` displays `"Offline"`.
    2. New record is rendered at the top instantly.
    3. Record displays `[data-testid="pending-icon"]`.
    4. App survives a refresh while still offline (reloading from OPFS).

### Scenario 7: The Upstream Flush (Reconnection)
- **Objective:** Verify offline additions are pushed and dirty flags cleared on reconnection.
- **Given:** A pending local addition (`PENDING_INSERT`).
- **When:** `page.setOffline(false)` and mock `/posts/add` returns `200 OK`.
- **Assertions:**
    1. Network status bar updates to clean.
    2. `/posts/add` is called with correct parameters.
    3. `[data-testid="pending-icon"]` disappears.
    4. Respects **3-second delay** mandate if multiple records are pending.

### Scenario 8: The Conflict Resolution (Last-Write-Wins + Tag Merge)
- **Objective:** Verify concurrent edits are merged cleanly.
- **Given:** Local Bookmark A modified offline with tags `["tui", "rust"]`.
- **When:** Delta sync finds Bookmark A on server with tags `["tui", "elm"]`.
- **Assertions:**
    1. UI tags updated to `["tui", "rust", "elm"]` (Union).
    2. Local metadata (Title, Notes) overwrites server metadata (Last-Write-Wins).
    3. Record marked as `SYNCHRONIZED`.

### Scenario 9: Rate-Limiting Graceful Degradation (429 Backoff)
- **Objective:** Verify the sync engine pauses on 429 without locking the UI.
- **When:** Mock proxy returns `429 Too Many Requests`.
- **Assertions:**
    1. UI remains responsive (no freeze).
    2. Notification appears: `"Rate limit encountered. Retrying in background..."`.
    3. No further API calls dispatched during backoff.

### Scenario 10: URL Deep Linking (State Sync)
- **Given:** User navigates to `/?q=%23coding`.
- **Assertions:** `[data-testid="search-input"]` is pre-filled with `#coding` and list is filtered.

---

## 5. Success Metrics
- **Zero Flakiness:** 10/10 pass rate in headless CI.
- **Performance Budget:** 
    - Initial Sync Test < 15s.
    - Search Query < 100ms.
    - List Render < 50ms.
