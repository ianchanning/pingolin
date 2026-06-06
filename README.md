# Pingolin: Steel & Stone Edition (0R/0M/30Y)

A mashup of pinboard.in and ma.gnol.ia.

A liberated, offline-first, zero-maintenance Progressive Web App (PWA) designed to manage tens of thousands of Pinboard bookmarks with "Steel and Stone" reliability. Built to last 30 years without intervention.

## Core Architecture

- **The Bridge (Proxy):** A Cloudflare Worker that acts as a transparent, CORS-bypassing conduit to `api.pinboard.in`. It injects mandatory headers (User-Agent) to satisfy Pinboard's legacy backend and handles 429 rate-limiting backpressure.
- **The Engine (Local Storage):** SQLite WASM backed by the Origin Private File System (OPFS). All data operations (22,000+ records) happen in a background Web Worker to ensure a guaranteed 60fps UI.
- **The Search:** Lightning-fast Full-Text Search (FTS5) index that handles punctuation-heavy tags via a dual-query strategy (Exact Match vs. Fuzzy).
- **The Universal Fortress (Validation):** A language-agnostic Playwright E2E suite that verifies the app's behavior as a black box using a Page Object Model (POM).
- **The UI:** "Brutally Simple" design philosophy. Single-screen, virtualized scrolling, and instantaneous reactive filtering.

## Setup Instructions

### 1. Deploy the Proxy (The Bridge)
The PWA cannot talk directly to Pinboard due to browser CORS restrictions.
```bash
cd proxy
npm install
npx wrangler deploy
```
*Take note of the deployed URL (e.g., `https://pinboard-proxy.your-subdomain.workers.dev`).*

### 2. Configure the PWA
Ensure the PWA is pointing to your proxy URL.
1. Open `pwa/src/main.ts`.
2. Update the `proxyUrl` variable in the `SyncOrchestrator` class:
   ```typescript
   private proxyUrl = 'https://YOUR_PROXY_URL_HERE';
   ```

### 3. Run the PWA
```bash
cd pwa
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

## Usage Guide

1.  **Authentication:** Get your Pinboard API Token from [pinboard.in/settings/password](https://pinboard.in/settings/password). Format must be `username:HEX_TOKEN`.
2.  **Initial Sync:** Enter your token and hit "Initial Sync". This will download your entire collection and build the local FTS index.
3.  **Search:** Just start typing. Results are debounced at 50ms and filtered via SQLite FTS5.
4.  **Add/Delete:** Operations are **Local-First**. Changes appear in the UI instantly and are marked with a `🔄` icon until successfully flushed to Pinboard by the background sync loop (60s interval or immediate trigger).
5.  **Offline Mode:** If you lose connectivity, a red **OFFLINE** banner appears. You can still search and add/delete bookmarks; they will sync automatically when you reconnect.

## The Technical Map: Pinboard API v1 Nuances

Building this fortress required deep-packet inspection of the aging Pinboard v1 backend. Here is the technical ground truth we discovered:

### 1. The Handshake (`/posts/update`)
*   **Purpose:** Determine if the local fortress needs a sync.
*   **Payload:** Tiny JSON object: `{"update_time": "ISO8601"}`.
*   **The Trap:** This timestamp **only** changes on additions or edits. **Deletions are invisible to this endpoint.**
*   **Throttling:** Requires a mandatory 5s pause after calling.

### 2. The Big Pull (`/posts/all`)
*   **Purpose:** Full ingestion or delta updates.
*   **Parameter:** `fromdt` used for Fast-Path Deltas.
*   **The Trap:** Returns the **entire dataset** as a single JSON array. For 22,000+ bookmarks, this is a ~15MB stream. 
*   **PWA Fix:** We ingest this in 500-record chunks to prevent worker-thread memory pressure.
*   **Mandatory Identity:** Returns `500 Error` if a `User-Agent` is missing.

### 3. The Dates Hack (`/posts/dates`)
*   **Purpose:** Pinpointing deletions without downloading all 15MB of data.
*   **The Ghost Signal:** On large accounts, the JSON endpoint (`format=json`) returns `200 OK` with `Content-Length: 0`. 
*   **Quantum Leap:** The proxy now strips the JSON request, fetches authoritative **XML**, and performs a regex-based transformation into JSON.
*   **Parity Logic:** We compare local date-counts vs. server counts. Any mismatch triggers a targeted reconcile.

### 4. Precision Reconciliation (`/posts/get`)
*   **Purpose:** authoritatively fetch all bookmarks for a specific day.
*   **Parameter:** `dt=YYYY-MM-DD`.
*   **Structure:** Returns a wrapper object `{"posts": [...]}`. (Note: Many wrappers mistakenly expect a raw array).

### 5. Local-First Write-Back (`/posts/add` & `/posts/delete`)
*   **Atomic Upsert:** We use `/posts/add?replace=yes` for both inserts and updates.
*   **Patience Protocol:** We enforce a **5-second mandatory throttle** *between* every consecutive API call. This prevents "Quiet 429" (Silent 0-byte) responses and IP blocks. Startup is immediate, but consecutive rituals are paced with stone-cold patience.

### 6. Local Ingestion (Worker Thread)
*   **Zero Network Noise:** Once the "Big Pull" JSON is downloaded, the ingestion into SQLite happens entirely offline. 
*   **Event-Loop Yielding:** The worker yields to the event loop between 500-record chunks to ensure progress messages are dispatched smoothly and the browser remains responsive.

### 7. The Broken Renamer (`/tags/rename`)
*   **Reality:** This endpoint is unstable and frequently returns 500s.
*   **Workaround:** We perform a manual loop:
    1.  Update all affected bookmarks locally.
    2.  Push them upstream via `/posts/add`.
    3.  Globally delete the old tag via `/tags/delete`.

### 8. The Punctuation Paradox (FTS5)
*   **Problem:** FTS5 tokenizers often strip punctuation (`.` and `:`), making it impossible to search for tags like `subject:cs.AI`.
*   **Fix:** The search engine detects a `#` prefix and switches from fuzzy FTS5 to a precise `tags LIKE ?` SQL query, ensuring punctuation is honored.

### 9. The Ghost User Deadlock (Handshake Stability)
*   **Problem:** Accounts with 0 bookmarks could deadlock the UI because the sync handshake sentinel was only written if data was ingested.
*   **Fix:** The worker now authoritatively writes the `last_full_sync_time` sentinel at the end of every hydration ritual, even for empty datasets, unlocking the UI for new users.

## The Universal Fortress (E2E Validation)

To guarantee the 30-year lifespan, we have armored the codebase with **The Universal Fortress**—a Playwright-based testing suite (see `spec/004-testing-scenarios.md`).

- **Black Box Testing:** Tests target `data-testid` attributes, treating the PWA as a black box. This allows the underlying implementation to be rewritten (e.g., in PureScript or Elm) while maintaining the behavioral contract.
- **The 10 Rituals:** We automate 10 critical scenarios including **Bootstrap Sync**, **Offline Persistence**, **The Dates Hack (Deletion)**, and **429 Rate-Limit Backoff**.
- **Run Tests:**
  ```bash
  cd pwa
  npm test
  ```

## Developer & Debugging Tools

Access these commands directly from the Browser Console (F12):

- `await db.debugClearDb()`: Wipes the local OPFS database and resets the application to the login state.
- `await refreshApp()`: Forces the UI to re-query the database and re-render.
- `db`: The `DatabaseBridge` instance for manual SQL execution or inspection.

## Principles of the Fortress (30Y Durability)
- **Zero Reading (0R):** No manuals, no nested menus.
- **Zero Maintenance (0M):** No server-side databases to patch.
- **30 Year Lifespan (30Y):** Built on native Web Standards and vendored binaries (SQLite WASM) to survive the decay of the modern web.
