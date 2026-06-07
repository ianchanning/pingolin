# Core Requirements - Pinboard PWA: Steel & Stone Edition (As-Built 2026)

## Goal
A zero-maintenance (0M), highly durable (30Y) Progressive Web App (PWA) client for Pinboard.in. Optimized for 22,000+ bookmarks with offline-first local search and precision synchronization.

## Core Architecture (The Trinity)
- **The Bridge (Proxy):** Hardened Cloudflare Worker. Handles CORS, User-Agent injection, and **XML-to-JSON transformation** for legacy date-distribution endpoints.
- **The Engine (Local):** SQLite WASM on **Origin Private File System (OPFS)**. Execution occurs in a background Web Worker with **WAL mode** and **60fps UI virtualization**.
- **The Sentinel (Sync):** **The Dates Hack** protocol. Uses date-count distributions to pinpoint deletions/modifications without full dataset downloads.

## SQLite Database Schema
```sql
-- Relational Store
CREATE TABLE IF NOT EXISTS bookmarks (
    href TEXT PRIMARY KEY,
    description TEXT, -- Title
    extended TEXT,    -- Notes
    tags TEXT,        -- Space-separated
    time TEXT NOT NULL,
    sync_status TEXT DEFAULT 'SYNCHRONIZED', -- 'SYNCHRONIZED', 'PENDING_INSERT/UPDATE/DELETE'
    local_last_modified INTEGER NOT NULL
);

-- Tag Aliases Store (Heuristic Intelligence)
CREATE TABLE IF NOT EXISTS tag_aliases (
    keyword TEXT PRIMARY KEY,
    mapped_tag TEXT NOT NULL
);

-- Metadata Stone (Auth & Sync State)
CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- FTS5 Virtual Table (Automatic Sync via Triggers)
CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
    href UNINDEXED, description, extended, tags,
    content='bookmarks', content_rowid='rowid'
);
```

## Sync Strategy: The "Dates Hack" Ritual
1.  **Passive Heartbeat:** Handshake with `/posts/update`. If timestamps match, sync additions/edits is skipped.
2.  **Mandatory Sentinel:** Regardless of timestamp, a **Dates Distribution Check** runs once per session. 
3.  **Mismatch Detection:** Compares local `GROUP BY strftime('%Y-%m-%d')` counts vs. server `/posts/dates` counts.
4.  **Targeted Reconcile:** Pulls authoritative data *only* for mismatched dates via `/posts/get?dt=...`.
5.  **Self-Healing:** If bookmarks exist but the handshake sentinel is missing, the app automatically adopts the timestamp of the latest local bookmark to resume sync.
6.  **Upstream Flush:** Pushes local `PENDING_*` changes first. Marks `🔄` in UI until confirmed.

## Implementation Realities (Hard-Won Knowledge)
- **Patience Protocol:** Mandatory throttle (default **5-second**) between API calls to prevent "Quiet 429" responses. Configurable for high-speed automated testing.
- **XML Alchemy:** The proxy fetches raw XML for `/posts/dates` and transforms it to JSON to bypass origin-side serialization crashes on large datasets.
- **Self-Bootstrapping SW:** The Service Worker injects **COOP/COEP headers** at runtime to enable `SharedArrayBuffer` and OPFS on static hosts like GitHub Pages.
- **Search Heuristic:** Bypasses FTS5 for `#` prefixed queries to handle punctuation-heavy tags (`tags LIKE '% tag %'`).
- **Simplified Mycelium:** Prefix-match autocomplete engine leveraging cached popular tags and authoritative aliases.

## Success Criteria
- **Instant Search:** FTS5 filtering over 20k records in <10ms.
- **UI Fluidity:** 60fps virtual scrolling with **120px row height**.
- **Total Isolation:** App is fully searchable and operational with zero network connectivity.
- **Universal Installability:** Works on Chrome, Firefox, and Safari on any host.
