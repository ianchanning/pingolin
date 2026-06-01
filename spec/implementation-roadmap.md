# Implementation Plan: Brutally Simple Pinboard PWA

## Overview
A 5-phase approach to building a zero-maintenance, 30-year-lifespan PWA that handles 22,000+ bookmarks using local-first architecture.

---

## Phase 0: The Bridge (Cloudflare Worker Proxy)
**Goal:** Establish a CORS-free, stable connection to the Pinboard API.
- [x] Create a minimal Cloudflare Worker to proxy `api.pinboard.in`.
- [x] Implement transparent header forwarding (Pass through `auth_token`).
- [x] **API Knowledge Fix:** Force a standard `User-Agent` (e.g., `PinboardPWA/1.0`) to avoid the 500 errors discovered during reorganization.
- [x] Implement basic rate-limit protection (detect 429 and pass it through).

## Phase 1: The Engine (Web Worker & SQLite)
**Goal:** Setup the persistent local storage layer using high-performance OPFS.
- [x] Initialize `sqlite-wasm` inside a dedicated background Web Worker.
- [x] Setup **OPFS** (Origin Private File System) for durable persistence.
- [x] Implement the Relational Schema (`bookmarks`, `tag_aliases`).
- [x] Implement the **FTS5 Virtual Table** for lightning-fast search.
- [x] Build the message-passing bridge between UI thread and Worker.

## Phase 2: Initial Ingestion (The "Big Pull")
**Goal:** Efficiently move 22,000+ server records into the local database.
- [x] Fetch full dataset using `/posts/all` (handled by Worker).
- [x] Implement **Chunked Insertion** to prevent main-thread or memory lockups.
- [x] Store the `update_time` locally for future delta-syncs.
- [x] Verify FTS5 search performance on the full 22,000 records (<50ms target).

## Phase 3: The "Brutal" UI (Search & List)
**Goal:** A UI that feels like a native app and loads in milliseconds.
- [x] Build single-screen searchable list.
- [x] Implement virtualized scrolling (only render visible items) to handle 20k rows.
- [x] Create the **"Honest Sync Indicator"**:
    - Show icon if `sync_status != 'SYNCHRONIZED'`.
    - Show indicator if a background fetch is active.
- [x] Implement "Offline" banner using `navigator.onLine`.

## Phase 4: Local-First Synchronization
**Goal:** Enable offline writes and robust conflict resolution.
- [x] Implement local write (Set status to `PENDING_INSERT/UPDATE`).
- [x] Build the Background Sync Loop:
    - On Startup: Check `/posts/update` to detect server changes.
    - If needed: Fetch only new posts.
- [x] Implement **Upstream Flush**:
    - Iterate through pending records.
    - **Constraint:** Respect 3-second delay between write requests.
- [x] Conflict Logic: Implement the "Merge & Overwrite" strategy.
- [x] **Tag Rename Workaround:** Implement "Add New Tag + Global Delete Old" logic to bypass broken `tags/rename` endpoint.

## Phase 5: Precision Delta Sync (The "Dates Hack")
**Goal:** Eliminate full dataset downloads by pinpointing deletions and edits via date-count sentinels.
- [x] Implement **Fast-Path Delta**: Use `/posts/all?fromdt=...` to fetch additions and edits since last sync.
- [x] Implement **Local Date Grouping**: High-speed SQL query to count bookmarks by UTC date.
- [x] Implement **Dates Sentinel**: Fetch `/posts/dates` and compare against local counts to detect invisible deletions.
- [x] Implement **Targeted Reconciliation**: Fetch specific mismatched dates via `/posts/get?dt=...` to prune deleted local records.
- [x] **Optimization:** Update `last_server_update_time` only after successful delta reconciliation.

## Phase 6: PWA Hardening
**Goal:** Offline application availability and final 30Y durability check.
- [x] Setup Service Worker for asset caching (offline app loading).
- [x] Implement **Heuristic Tagging**:
    - [x] Local keyword -> Tag mapping via `tag_aliases`.
    - [x] Domain-based tagging logic.
    - [x] **History-based Co-occurrence logic.**
- [x] Asset Audit: Ensure 0 external dependencies (Vendor all scripts like `sqlite-wasm` locally).

---

## Retrospective: The "What We Missed" Log

The voyage from plan to reality encountered several "Quantum Gremlins" that required surgical intervention.

### 1. The Async State Lock (Bridge Stability)
- **Problem:** The original `DatabaseBridge` temporarily replaced its message handler during sync, causing other commands (like `debugClearDb`) to hang if a sync failed or was slow.
- **Fix:** Refactored to a **Static Message Handler** with request IDs and a persistent response map.

### 2. The Browser Rendering Schism (Firefox Scroll Warnings)
- **Problem:** Firefox warned about "scroll-linked positioning" because we moved DOM elements directly on the scroll event.
- **Fix:** Switched to **requestAnimationFrame (rAF)** and **GPU-accelerated transforms** (`translateY`), achieving silky smooth 60fps scrolling.

### 3. The Vite Asset Trap (MIME Type Errors)
- **Problem:** Vite treats `public/` files differently than `src/` modules. Importing SQLite from `public/` caused MIME type errors in the Service Worker.
- **Fix:** Split the engine: JS modules moved to `src/vendor`, while raw binaries (WASM) stayed in `public/vendor`.

### 4. Worker Scope Collisions
- **Problem:** TypeScript/ES6 `switch` cases share a scope. Declaring `const counts` in two different cases crashed the worker.
- **Fix:** Wrapped all case handlers in **Private Blocks `{}`** to ensure perfect isolation.

### 5. The "Ghost User" Deadlock
- **Problem:** Logic assumed if `bookmarkCount === 0`, we were in "Setup Mode." Users with 0 bookmarks on the server could never leave the setup screen.
- **Fix:** Introduced the **Handshake Sentinel** (`last_full_sync_time`). If a sync has been attempted, we unlock the UI regardless of data count.

### 6. The 0-Byte Vacuum (Proxy Hardening)
- **Problem:** Pinboard returned 200 OK but 0 bytes for large JSON date distributions.
- **Fix:** Implemented **XML-to-JSON Alchemy**. The proxy now fetches stable XML and transforms it into JSON via regex, bypassing the failing origin serializer.
