# Pingolin: Steel & Stone Architecture (30Y Durability)

## Core Architecture

### 1. The Bridge (Cloudflare Worker Proxy)
- **Role:** CORS-free gateway to `api.pinboard.in`.
- **Hardening:** Forces `User-Agent: PinboardPWA/1.0` and implements XML-to-JSON alchemy to bypass unstable origin serializers.
- **Security:** Transparent header forwarding for `auth_token`.

### 2. The Engine (Background Web Worker)
- **Storage:** `sqlite-wasm` utilizing **OPFS** (Origin Private File System) for durable, local-first persistence.
- **Search:** FTS5 Virtual Table for fuzzy search + Heuristic SQL prefix-matching for exact tag queries (The Punctuation Paradox Fix).
- **Isolation:** Message-passing bridge with request IDs and persistent response mapping.

### 3. The Sync Orchestrator (Eventual Consistency)
- **Bootstrap:** "The Big Pull" (Chunked ingestion of 22,000+ records).
- **Heartbeat:** Automatic polling loop with configurable intervals and rate-limit backoff.
- **The Dates Hack (Delta Sync):** 
    - Date-count sentinel comparison (`/posts/dates`) to detect invisible deletions.
    - Targeted reconciliation via `/posts/get?dt=...` for mismatched buckets.
- **The Upstream Flush:** Local-first writes (`PENDING_INSERT/UPDATE`) pushed with a mandatory 3s throttle.
- **Self-Healing:** Automatic sync-handshake recovery for "Zombie Databases" (data exists but sentinel is missing).

### 4. The "Brutal" UI (Virtualized & Reactive)
- **Rendering:** requestAnimationFrame + GPU-accelerated transforms for 60fps virtualized scrolling.
- **State:** Search-aware refreshes (syncing does not clear active filters).
- **Intelligence:** Prefix-match autocomplete engine leveraging cached popular tags and authoritative aliases.

### 5. The Universal Fortress (E2E Validation)
- **Tooling:** Playwright-based behavior-driven integration suite.
- **Contract:** Verifies the app as a "Black Box" using `data-testid` locators.
- **Rituals:** 12 automated scenarios covering bootstrap, offline persistence, deletion reconciliation, and deep-link reliability.

---

## Technical Debt & Future Map
- **Heuristic Tagging:** Expand co-occurrence logic (History-based co-occurrence is currently lean).
- **Offline Hardening:** Service Worker lifecycle refinements for faster asset updates.
- **Migration Path:** The Fortress is ready for a potential PureScript or ClojureScript migration of the UI thread.
