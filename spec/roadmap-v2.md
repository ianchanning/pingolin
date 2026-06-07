# Implementation Plan: Brutally Simple Pinboard PWA (Elm + SQLite WASM)

## Overview
A 5-phase approach to building a zero-maintenance, 30-year-lifespan PWA that performantly handles 22,000+ bookmarks using local-first SQLite, a background Web Worker, and an Elm presentation layer.

---

## Phase 0: The Bridge (Cloudflare Worker Proxy)
**Goal:** Establish a CORS-free, stable connection to the Pinboard API.
- [x] Create a minimal Cloudflare Worker to proxy `api.pinboard.in`.
- [x] Implement transparent header forwarding (Pass through `auth_token`).
- [x] **API Knowledge Fix:** Force a standard `User-Agent` (`PinboardPWA/1.0`) to avoid 500 errors.
- [x] Implement rate-limit protection (detect 429 and pass it through).
- [x] **XML Alchemy:** Parse XML returned from `/posts/dates` into clean JSON on the edge to bypass origin-side serialization bugs.

## Phase 1: The Engine (Web Worker & SQLite)
**Goal:** Setup the persistent local storage layer using high-performance OPFS.
- [x] Initialize `sqlite-wasm` inside a dedicated background Web Worker (`sync-worker.js`).
- [x] Setup **OPFS** (Origin Private File System) for durable persistence.
- [x] Implement the Relational Schema (`bookmarks`, `tag_aliases`, `metadata`).
- [x] Implement the **FTS5 Virtual Table** and triggers for lightning-fast search.
- [x] **The Punctuation Paradox Fix:** Add the `#` prefix search bypass inside the worker's query handler to execute space-padded SQL relational exact-tag matching.

## Phase 2: The Sync Orchestrator (Eventual Consistency)
**Goal:** Implement the "Dates Hack" sync algorithm in the Web Worker.
- [x] **Bootstrap:** Implement chunked batch ingestion of 22,000+ bookmarks inside a single SQLite transaction.
- [x] **Heartbeat:** Setup a passive polling loop that monitors `/posts/update`.
- [x] **Fast-Path Delta:** Implement `/posts/all?fromdt=last_sync` to pull additions and modifications instantly.
- [x] **The Dates Hack (Deletions):** Compare local date counts (`GROUP BY date`) against remote `/posts/dates` distribution to identify invisible deletes.
- [x] **Targeted Reconcile:** Fetch mismatched date buckets via `/posts/get?dt=...` and prune local deletes.
- [x] **The Upstream Flush:** Implement a local write queue (`PENDING_INSERT/UPDATE/DELETE`) with a mandatory 3-5 second api throttle.
- [x] **Self-Healing:** Implement sync-handshake recovery for "Zombie Databases" (auto-adopt timestamp of latest local bookmark if metadata sentinel is lost).

## Phase 3: The "Brutal" UI (Elm Presentation Layer)
**Goal:** Build the unidirectional, crash-free presentation layer using Elm.
- [x] **Workspace Setup:** Configure `package.json`, `Main.elm`, and `vite.config.js` with the required COOP/COEP headers to enable OPFS.
- [x] **Domain Modeling:** Define the `Bookmark` record, `SyncStatus` union types, and the pure Model-View-Update (TEA) structure.
- [x] **The Ports Bridge:** Setup outgoing (`toWorker`) and incoming (`fromWorker`) ports to communicate with `sync-worker.js`.
- [x] **Robust Decoders:** Write Elm `Json.Decode` schemas to validate, type-enforce, and clean incoming SQLite records at the port boundary.
- [ ] **Vanilla Virtual Scroller:** Write a dependency-free, GPU-accelerated virtual scroller inside Elm to render only visible bookmarks at **120px row height**.
- [ ] **The Autocomplete Engine:** Build a prefix-match autocomplete bar utilizing cached popular tags and authoritative aliases.
- [ ] **States and Indicators:** Wire Elm views to render the `"Offline"` network status and the transient `"Syncing"` icon based on the active worker state.

## Phase 4: The Universal Fortress (Playwright E2E Validation)
**Goal:** Validate the Elm UI's behavior as a black box using your existing test suite.
- [ ] Create Page Object Models (`AppPage`, `AddForm`, `BookmarkItem`) targeting Elm's DOM selectors.
- [ ] Ensure all Elm elements expose the correct `data-testid` properties.
- [ ] Execute the 12 automated scenarios (bootstrap, offline persistence, exact tag matching, deep-link persistence, self-healing).
- [ ] Verify that your test suite passes with **zero runtime exceptions** thrown in the browser console.
