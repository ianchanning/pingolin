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
    - Local keyword -> Tag mapping via `tag_aliases`.
    - Domain-based tagging logic.
- [x] Asset Audit: Ensure 0 external dependencies (Vendor all scripts like `sqlite-wasm` locally).
