# SPEC-003: High-Density Eventual Consistency Engine (Pingolin Sync V2)

## 1. Objective
Establish an anti-fragile, low-overhead sync pipeline designed for 22,000+ bookmarks. The system must render the UI immediately with fresh bookmarks, perform a non-blocking background hydration of the archive, mitigate pagination drift, and utilize a date-count sentinel to guarantee eventual consistency and catch deletes.

---

## 2. Phase-by-Phase TODO List

### Phase 1: Bootstrap & Immediate UI Render (The Fast Path)
Before indexing the archive, we must unblock the user. The app should load and render their active bookmark viewport in milliseconds.

- [x] **1.1. Create `/posts/recent` API Endpoint Interface:**
  Configure the Cloudflare proxy to support fetching a limited, fast-response slice of recent bookmarks.
- [x] **1.2. Implement Bootstrap Trigger in Web Worker:**
  On initial app launch (if database rowcount is `0`), bypass the standard sync crawl and dispatch an immediate request for the 100 most recent bookmarks.
- [x] **1.3. Execute Fast Write to SQLite:**
  Write these 100 bookmarks instantly to SQLite with `sync_status = 'SYNCHRONIZED'`.
- [x] **1.4. Emit Render-Ready Event:**
  Post a message back to the main thread (`type: 'BOOTSTRAP_COMPLETE'`) to render the active list viewport immediately.

---

### Phase 2: Background Hydration Loop (The Cursor Crawl)
While the user browses Page 1, we pull down the rest of the 22,000+ backlog in the background without UI stutter.

- [x] **2.1. Implement Cursor Parsing:**
  Configure the Web Worker to read the timestamp (`time`) of the oldest bookmark on the currently fetched page to act as the cursor for the next page query. (Implemented using 'start' offset for Pinboard compatibility).
- [x] **2.2. Build the Pagination Loop:**
  Implement an iterative async loop in `sync-worker.js` that fetches the next page using the cursor:
  `GET /v1/posts/all?before_dt=CURSOR_TIMESTAMP&limit=100&format=json`
- [x] **2.3. Implement SQLite Batch Transactions:**
  Wrap each page insertion inside an explicit SQLite transaction block (`BEGIN TRANSACTION;` and `COMMIT;`) to minimize disk write IOPS and avoid database lockups.
- [x] **2.4. Track Progress Metadata:**
  Calculate the sync progress by evaluating the current ingested rowcount against the total estimated rowcount. Emit periodic `SYNC_PROGRESS` messages to the UI thread to update the background status text.

---

### Phase 3: Eventual Consistency Sentinel (The Dates Hack)
Once background hydration is complete, we run our final safety net to reconcile any omissions or deletions caused by concurrent updates.

- [x] **3.1. Build Local Date-Count Query:**
  Implemented in Web Worker.
- [x] **3.2. Fetch Remote `/posts/dates` Payload:**
  Intercepted and transformed from XML to JSON in the Cloudflare Proxy.
- [x] **3.3. Compare Local vs. Server Indexes:**
  Implemented in `SyncOrchestrator`.
- [x] **3.4. Execute Targeted Day Repair:**
  Uses `/posts/get?dt=...` to authorized and prune local records.
- [x] **3.5. Update Sync Meta Timestamp:**
  Handshake successfully recorded in metadata stone.

---

### Phase 4: Defensive Network & Rate-Limiting (The Safe-Guard)
Pinboard strictly enforces rate limits. A multi-page background crawl can easily trigger a temporary block if we are too aggressive.

- [x] **4.1. Implement Throttling Delay:**
  Add a non-blocking artificial delay (e.g., 500ms to 1000ms) between consecutive background page fetches to respect the server's API limits.
- [x] **4.2. Build 429 Backoff Handler:**
  Audit every network fetch. If any API call returns HTTP `429 Too Many Requests`, pause the sync engine completely, schedule a retry using exponential backoff (starting at 60 seconds), and notify the UI of the temporary rate-limit delay.
- [x] **4.3. Implement Transaction Rollbacks:**
  Ensure every database transaction block has a robust catch block that executes `ROLLBACK;` in SQLite to prevent database files from getting locked on thread crashes. (Handled by oo1 transaction wrapper).

---

### Phase 5: UI Integration & Status Mapping
- [x] **5.1. Map UI Progress State:**
  Bind the background worker's progress events to a low-profile text status indicator.
- [x] **5.2. Map Offline Banner:**
  Bind `navigator.onLine` window events to a quiet `"Offline"` notification bar.

---

### --- VERIFICATION BLOCK ---

#### Axioms:
*   Assumes the SQLite DB is hosted in Web Worker scope via OPFS.
*   Assumes timezone handling parses all ISO timestamps natively as UTC to prevent date grouping misalignment during Step 3.1.

#### Sycophancy Scan:
*   *Rating: Low.* I have explicitly broken down the tasks to require sequential throttling and rate-limit backoff handling. A simple loop without throttling will fail immediately under active use due to Pinboard's strict IP rate limits.

#### Failure Modes:
*   **Database Write Lock Contention:** If the background hydration thread is writing to SQLite continuously while the user is actively saving or editing bookmarks in the UI, a database write lock contention can occur. The database must use `journal_mode=WAL` (Write-Ahead Logging) to allow concurrent reads during active background writes.

#### First Principles Check:
*   By structuring the sync engine into distinct, modular phases (Bootstrap $\rightarrow$ Hydrate $\rightarrow$ Reconcile), we guarantee that if the app is closed or network connection drops at any point, the local database remains self-contained, stable, and ready to pick up exactly where it left off on next launch.
