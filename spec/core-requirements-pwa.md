# Core Requirements - Brutally Simple Pinboard PWA (0R/0M/30Y)

## Goal
Build an offline-first, zero-maintenance (0M), highly durable (30-year lifespan (30Y)) Progressive Web App (PWA) client for Pinboard.in. The system must performantly index, search, and synchronize 22,000+ bookmarks entirely client-side using a browser-embedded database, bypassing standard browser network and main-thread limitations.

## Core Architecture
- **Runtime:** Single-Page PWA executing all data operations inside a background **Web Worker** to guarantee 60fps UI performance.
- **Local Storage Engine:** **SQLite WASM** backed by the **Origin Private File System (OPFS)** for high-speed, persistent, relational database operations.
- **Search Engine:** SQLite **FTS5** virtual table extension for instantaneous, on-device full-text search across titles, descriptions, and tags.
- **Network Interface:** Private, zero-maintenance **Cloudflare Worker** acting as a transparent CORS-bypassing proxy to route client-side requests directly to `api.pinboard.in`.

## SQLite Database Schema
The background database must implement the following schema to handle local writes, syncing states, and fast search:

```sql
-- Relational Store
CREATE TABLE IF NOT EXISTS bookmarks (
    href TEXT PRIMARY KEY,
    description TEXT, -- Pinboard Title
    extended TEXT,    -- Pinboard Description/Notes
    tags TEXT,        -- Space-separated tag list
    time TEXT NOT NULL,
    sync_status TEXT DEFAULT 'SYNCHRONIZED', -- 'SYNCHRONIZED', 'PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE'
    local_last_modified INTEGER NOT NULL
);

-- Tag Aliases Table
CREATE TABLE IF NOT EXISTS tag_aliases (
    keyword TEXT PRIMARY KEY,
    mapped_tag TEXT NOT NULL
);

-- FTS5 Search Table
CREATE VIRTUAL TABLE IF NOT EXISTS bookmarks_fts USING fts5(
    href UNINDEXED,
    description,
    extended,
    tags,
    content='bookmarks',
    content_rowid='rowid'
);
```

## Sync Strategy (Dual-Trigger Pipeline)
Synchronization must operate on a unidirectional state flow with local overrides to resolve conflicts cleanly without user-facing modals.

1.  **Passive Background Loop:**
    - On application startup or when reclaiming network connectivity, query the Pinboard `/posts/update` API endpoint.
    - If the server timestamp matches the local last-sync timestamp, and there are no local pending writes: **Halt.**
    - If local pending writes exist (`PENDING_*`): **Push upstream first.** Execute raw API requests. Clear the dirty flags upon confirmation.
    - If the server timestamp is newer: **Pull downstream.** Fetch the full dataset. Overwrite local clean records.

2.  **Active Event-Driven Trigger:**
    - On bookmark add/edit: Write instantly to the local SQLite DB, set the status to `PENDING_INSERT`/`PENDING_UPDATE`, and make the changes immediately visible in the UI.
    - Trigger an immediate, non-blocking background fetch API call to commit the change to the server. If successful, clear the pending state.

3.  **Conflict Resolution (Merge & Overwrite):**
    - When a server pull conflicts with a local record marked `PENDING_UPDATE`:
        - **Tags:** Merged using a mathematical set union of local and server tag strings.
        - **Metadata (URL, Title, Notes):** The local PWA values overwrite the server values.
        - **State:** The merged record is saved locally and remains marked `PENDING_UPDATE` to push the merged state back to the server.

## Heuristic Tagging Engine
- **Local Deterministic Translation:** Extract space-separated text tokens from the shared URL's domain, title, and description.
- **Alias Mapping:** Query `tag_aliases` to translate common keywords to structured taxonomies (e.g., token `llm` maps to tag `subject:cs.CL`; token `rust` maps to tag `language:rust`).
- **Co-occurrence Logic:** Analyze local history to suggest tags that frequently appear together with matched terms.

## UI/UX Specifications (Brutal Simplicity)
- **Zero-Reading (0R) Philosophy:** Avoid verbose alerts, menus, or nested settings. The primary interface is a single-screen, lightning-fast searchable list.
- **Honest Sync Indicator:**
    - A subtle sync icon is visible *only* when the system is processing background writes or when `sync_status != 'SYNCHRONIZED'` records exist in the database. 
    - The icon disappears completely when the database is fully synchronized.
- **Offline State:** Monitor `navigator.onLine`. If disconnected, display a static, low-contrast, non-intrusive `"Offline"` text banner on the screen.

## Constraints & Considerations
- **Scale:** 22,000+ bookmarks. All imports, parsing, and database transactions must be executed incrementally in chunks within the Web Worker to prevent memory crashes on mobile devices.
- **CORS Limitations:** Browser security models prevent direct PWA interaction with the Pinboard API. The Cloudflare Worker proxy is mandatory.
- **Rate Limits:** Pinboard enforces strict API throttling. The sync loop must back off exponentially if a `429 Too Many Requests` status is encountered.

## API Constraints & Implementation Nuances (Verified)
The following behaviors have been empirically verified and must be respected by the Proxy and PWA:

1.  **Mandatory User-Agent:** The API will return `500 Internal Server Error` for many valid requests (especially `tags/` and `posts/all`) if a `User-Agent` header is missing. The Proxy must inject a consistent User-Agent (e.g., `PinboardPWA/1.0`).
2.  **Auth Token Format:** The `auth_token` parameter must be in the format `username:hex_token`.
3.  **Sync-Check Endpoint:** The `/posts/update` endpoint returns a JSON object with a single `update_time`. This must be the first call in any sync loop to determine if a full `/posts/all` pull is required.
4.  **Bulk Data Handling:** `/posts/all` returns the entire 22,000+ bookmark collection as a single JSON array. This requires chunked processing in the Web Worker to avoid memory pressure.
5.  **Atomic Upserts:** The `/posts/add` endpoint with `replace=yes` handles both creation and updates.
6.  **Broken Rename Endpoint:** The official `tags/rename` endpoint is unreliable and frequently returns `500` errors. Tag renaming must be implemented as a local `PENDING_UPDATE` state that adds the new tag to all relevant bookmarks via `posts/add` and then deletes the old tag globally via `tags/delete`.
7.  **Rate Limiting:** A strict 3-second delay between write-intensive requests is mandatory to avoid `429 Too Many Requests` and temporary IP bans.

## Success Criteria
- The PWA loads instantly, rendering the local database list within milliseconds.
- Search queries over 22,000+ titles, descriptions, and tags return filtered results in less than 50ms.
- Unsynchronized changes made offline are automatically reconciled and flushed to the Pinboard server when network status becomes active.
