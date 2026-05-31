# Pinboard PWA: Steel & Stone Edition (0R/0M/30Y)

A liberated, offline-first, zero-maintenance Progressive Web App (PWA) designed to manage tens of thousands of Pinboard bookmarks with "Steel and Stone" reliability. Built to last 30 years without intervention.

## Core Architecture

- **The Bridge (Proxy):** A Cloudflare Worker that acts as a transparent, CORS-bypassing conduit to `api.pinboard.in`. It injects mandatory headers (User-Agent) to satisfy Pinboard's legacy backend and handles 429 rate-limiting backpressure.
- **The Engine (Local Storage):** SQLite WASM backed by the Origin Private File System (OPFS). All data operations (22,000+ records) happen in a background Web Worker to ensure a guaranteed 60fps UI.
- **The Search:** Lightning-fast Full-Text Search (FTS5) index that updates via SQL triggers.
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

## Developer & Debugging Tools

Access these commands directly from the Browser Console (F12):

- `await db.debugClearDb()`: Wipes the local OPFS database and resets the application to the login state.
- `await refreshApp()`: Forces the UI to re-query the database and re-render.
- `db`: The `DatabaseBridge` instance for manual SQL execution or inspection.

## Principles of the Fortress (30Y Durability)
- **Zero Reading (0R):** No manuals, no nested menus.
- **Zero Maintenance (0M):** No server-side databases to patch.
- **30 Year Lifespan (30Y):** Built on native Web Standards and vendored binaries (SQLite WASM) to survive the decay of the modern web.
