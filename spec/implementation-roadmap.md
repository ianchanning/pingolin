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
- [ ] Initialize `sqlite-wasm` inside a dedicated background Web Worker.
- [ ] Setup **OPFS** (Origin Private File System) for durable persistence.
- [ ] Implement the Relational Schema (`bookmarks`, `tag_aliases`).
- [ ] Implement the **FTS5 Virtual Table** for lightning-fast search.
- [ ] Build the message-passing bridge between UI thread and Worker.

## Phase 2: Initial Ingestion (The "Big Pull")
**Goal:** Efficiently move 22,000+ server records into the local database.
- [ ] Fetch full dataset using `/posts/all` (handled by Worker).
- [ ] Implement **Chunked Insertion** to prevent main-thread or memory lockups.
- [ ] Store the `update_time` locally for future delta-syncs.
- [ ] Verify FTS5 search performance on the full 22,000 records (<50ms target).

## Phase 3: The "Brutal" UI (Search & List)
**Goal:** A UI that feels like a native app and loads in milliseconds.
- [ ] Build single-screen searchable list.
- [ ] Implement virtualized scrolling (only render visible items) to handle 20k rows.
- [ ] Create the **"Honest Sync Indicator"**:
    - Show icon if `sync_status != 'SYNCHRONIZED'`.
    - Show indicator if a background fetch is active.
- [ ] Implement "Offline" banner using `navigator.onLine`.

## Phase 4: Local-First Synchronization
**Goal:** Enable offline writes and robust conflict resolution.
- [ ] Implement local write (Set status to `PENDING_INSERT/UPDATE`).
- [ ] Build the Background Sync Loop:
    - On Startup: Check `/posts/update` to detect server changes.
    - If needed: Fetch only new posts.
- [ ] Implement **Upstream Flush**:
    - Iterate through pending records.
    - **Constraint:** Respect 3-second delay between write requests.
- [ ] Conflict Logic: Implement the "Merge & Overwrite" strategy.
- [ ] **Tag Rename Workaround:** Implement "Add New Tag + Global Delete Old" logic to bypass broken `tags/rename` endpoint.

## Phase 5: PWA Hardening
**Goal:** Offline application availability and final 30Y durability check.
- [ ] Setup Service Worker for asset caching (offline app loading).
- [ ] Implement **Heuristic Tagging**:
    - Local keyword -> Tag mapping via `tag_aliases`.
    - Domain-based tagging logic.
- [ ] Asset Audit: Ensure 0 external dependencies (Vendor all scripts like `sqlite-wasm` locally).
