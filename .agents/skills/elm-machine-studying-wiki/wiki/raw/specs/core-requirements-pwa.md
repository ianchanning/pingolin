# Pingolin: Steel & Stone Architecture (30Y Durability)

## Core Architecture

### 1. The Bridge (Cloudflare Worker Proxy)
- **Role:** CORS-free gateway to `api.pinboard.in`.
- **Hardening:** Forces `User-Agent: PinboardPWA/1.0` and implements XML-to-JSON alchemy to bypass unstable origin serializers.
- **Security:** Transparent header forwarding for `auth_token`.

### 2. The Engine (The Lobotomized Worker / "The Muscle")
- **Role:** A procedural, stateless Remote Procedure Call (RPC) endpoint. It executes commands; it makes zero tactical decisions. It is the only entity permitted to touch the I/O layer.
- **Storage:** `sqlite-wasm` utilizing **OPFS** (Origin Private File System) for durable, local-first persistence.
- **Capabilities (Strictly Limited):**
  1. `RPC_FETCH`: Executes a network request to the proxy and returns the raw JSON/Text.
  2. `RPC_SQL`: Runs a query or transaction and returns the raw rows or success state.
  3. `HYDRATE_ARCHIVE`: The *only* complex procedural exception. A highly optimized, chunked batch-insert function to handle the 15MB "Big Pull" without freezing the UI thread by avoiding the need to transfer a massive JSON payload across the `postMessage` boundary.
- **Isolation:** Operates purely on message-passing. It does not know what "Pinboard" is, nor what a "Bookmark" represents conceptually; it only executes HTTP requests and SQL statements.

### 3. The Sync Orchestrator (The Sovereign State Machine / "The General")
- **Role:** The brain of the operation. Operates on pure, deterministic logic, strict state transitions, and unidirectional data flow to guarantee 30Y zero-maintenance durability. (Implementation agnostic: currently Elm, but treats the UI thread as a pure logical controller).
- **State Management:** Maintains the strict phases of the sync lifecycle (Idle, Fetching Deltas, Reconciling Dates, Flushing) in isolated, verifiable memory.
- **The Dates Hack (Delta Sync) via RPC:** 
    - The State Machine commands the Worker: `RPC_SQL` to get local date counts.
    - The State Machine commands the Worker: `RPC_FETCH` to get `/posts/dates`.
    - The State Machine (via pure logic) compares the two datasets and identifies mismatched buckets.
    - The State Machine commands the Worker: `RPC_FETCH` to get `/posts/get?dt=...` for the mismatches.
    - The State Machine commands the Worker: `RPC_SQL` to explicitly delete the ghost records.
- **API Throttling & Backoff:** The mandatory 3-second throttle between API mutations is managed by the State Machine's effect-scheduler, ensuring perfect, unyielding patience without relying on dirty, untracked `setTimeout` callbacks in the JS environment.

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
- **Migration Path:** The Fortress is ready for a potential Elm, PureScript or ClojureScript migration of the UI thread.
