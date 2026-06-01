/**
 * Pinboard PWA - Main Thread
 */

class DatabaseBridge {
  private worker: Worker;
  private pendingRequests: Map<string, {
    resolve: Function,
    reject: Function,
    onProgress?: (data: any) => void
  }> = new Map();

  constructor() {
    // Vite handles worker bundling
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.onmessage = (e) => {
      const { type, payload, id } = e.data;
      console.log(`[Bridge] Received: ${type} (${id})`, payload);
      const promise = this.pendingRequests.get(id);

      if (promise) {
        if (type === 'SYNC_PROGRESS') {
          promise.onProgress?.(payload);
        } else if (type === 'ERROR') {
          console.error(`[Bridge] Worker Error:`, payload);
          promise.reject(payload);
          this.pendingRequests.delete(id);
        } else {
          // Success case for any other message type
          promise.resolve(payload);
          this.pendingRequests.delete(id);
        }
      } else if (type !== 'SYNC_PROGRESS') {
        console.warn(`[Bridge] Orphaned message: ${type} (${id})`);
      }
    };
  }

  async init() {
    return this.send('INIT');
  }

  async search(query: string) {
    return this.send('QUERY_SEARCH', query);
  }

  async getAll() {
    return this.send('QUERY_ALL');
  }

  async getBookmarkCount(): Promise<number> {
    return this.send('GET_BOOKMARK_COUNT');
  }

  async getPopularTags(): Promise<string[]> {
    return this.send('GET_POPULAR_TAGS');
  }

  async upsertBatch(bookmarks: any[]) {
    return this.send('UPSERT_BATCH', bookmarks);
  }

  async localUpsert(bookmark: any) {
    return this.send('LOCAL_UPSERT', bookmark);
  }

  async getMetadata(key: string) {
    return this.send('GET_METADATA', key);
  }

  async setMetadata(key: string, value: string) {
    return this.send('SET_METADATA', { key, value });
  }

  async getPending() {
    return this.send('GET_PENDING');
  }

  async getDateCounts(): Promise<any[]> {
    return this.send('QUERY_DATE_COUNTS');
  }

  async reconcileDate(date: string, bookmarks: any[]) {
    return this.send('RECONCILE_DATE', { date, bookmarks });
  }

  async setSynchronized(href: string) {
    return this.send('SET_SYNCHRONIZED', href);
  }

  async localDelete(href: string) {
    return this.send('LOCAL_DELETE', href);
  }

  async debugClearDb() {
    console.log('[Bridge] Requesting Clear DB');
    await this.send('DEBUG_CLEAR_DB');
    if (typeof window !== 'undefined' && (window as any).refreshApp) {
      await (window as any).refreshApp();
    }
  }

  async fetchAllFromServer(proxyUrl: string, authToken: string, onProgress: (data: any) => void) {
    const id = Math.random().toString(36).substring(7);
    console.log(`[Bridge] Sending: FETCH_ALL_SERVER (${id})`);
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject, onProgress });
      this.worker.postMessage({ type: 'FETCH_ALL_SERVER', payload: { proxyUrl, authToken }, id });
    });
  }

  private send(type: string, payload?: any): Promise<any> {
    const id = Math.random().toString(36).substring(7);
    console.log(`[Bridge] Sending: ${type} (${id})`);
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({ type, payload, id });
    });
  }
}

class VirtualizedList {
  private viewport: HTMLElement;
  private canvas: HTMLElement;
  private list: HTMLElement;
  private items: any[] = [];
  private itemHeight = 120;
  private buffer = 10;
  private lastRange: [number, number] = [-1, -1];
  private ticking = false;

  constructor(viewportId: string, canvasId: string, listId: string) {
    this.viewport = document.getElementById(viewportId)!;
    this.canvas = document.getElementById(canvasId)!;
    this.list = document.getElementById(listId)!;

    this.viewport.addEventListener('scroll', () => {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.render();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
  }

  updateItems(items: any[]) {
    this.items = items;
    this.canvas.style.height = `${items.length * this.itemHeight}px`;
    this.viewport.scrollTop = 0;
    this.lastRange = [-1, -1];
    this.render();
  }

  render() {
    const scrollTop = this.viewport.scrollTop;
    const viewportHeight = this.viewport.clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(this.items.length - 1, Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.buffer);

    // Only update DOM if the range actually changed
    if (startIndex === this.lastRange[0] && endIndex === this.lastRange[1]) return;
    this.lastRange = [startIndex, endIndex];

    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i <= endIndex; i++) {
      const b = this.items[i];
      if (b.sync_status === 'PENDING_DELETE') continue;

      const li = document.createElement('li');
      li.className = 'bookmark';
      li.style.transform = `translateY(${i * this.itemHeight}px)`;
      li.style.willChange = 'transform';
      li.innerHTML = `
        <div>
          <h3>
            ${b.sync_status !== 'SYNCHRONIZED' ? ' 🔄' : ''}
            <a href="${b.href}" target="_blank">${b.description}</a>
          </h3>
          ${b.tags ? `<div class="tags">Tags: ${b.tags.split(' ').join(', ')}</div>` : ''}
        </div>
        <div class="tags">
          <button class="delete-btn" data-href="${b.href}">delete</button>
        </div>
      `;
      fragment.appendChild(li);
    }

    this.list.innerHTML = '';
    this.list.appendChild(fragment);

    // Add delete listeners
    this.list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const href = (e.target as HTMLElement).getAttribute('data-href');
        if (href && confirm('Delete this bookmark?')) {
          await (window as any).deleteBookmark(href);
        }
      });
    });
  }
}

class SyncOrchestrator {
  private isSyncing = false;
  private needsSync = false;
  private proxyUrl = 'https://pinboard-proxy.ian-pinboard-proxy.workers.dev';
  private authToken: string | null = null;
  private syncIndicator: HTMLElement;

  constructor(syncIndicatorId: string) {
    this.syncIndicator = document.getElementById(syncIndicatorId)!;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  setBusy(busy: boolean) {
    this.isSyncing = busy;
    if (busy) {
      this.syncIndicator.style.display = 'block';
    } else {
      const checkPending = async () => {
        const pending = await db.getPending();
        if (!pending || pending.length === 0) {
          this.syncIndicator.style.display = 'none';
        }
      };
      checkPending();
    }
  }

  async trigger() {
    console.log('[Sync] Trigger requested.');
    this.needsSync = true;
    if (this.isSyncing) {
      console.log('[Sync] Sync already in progress, queuing next run.');
      return;
    }
    this.startLoop();
  }

  async startLoop() {
    if (this.isSyncing) return;
    if (!this.authToken) {
      console.warn('[Sync] Loop aborted: No authToken set. Please enter your Pinboard key.');
      return;
    }
    this.isSyncing = true;
    this.needsSync = false;
    this.syncIndicator.style.display = 'block';

    try {
      console.log('[Sync] Starting Precision Sync Loop (The Dates Hack)...');

      // 0. Sanity Check: If DB is empty, abort.
      const count = await db.getBookmarkCount();
      if (count === 0) {
        console.info('[Sync] Loop aborted: Local database is empty. Please perform an Initial Sync.');
        return;
      }

      // 1. Push PENDING writes first
      const pushedCount = await this.pushPending();
      if (pushedCount > 0 && (window as any).refreshApp) {
        await (window as any).refreshApp();
      }

      // 2. Check for server updates
      const serverUpdate = await this.fetchServerUpdateTime();
      const localLastUpdate = (await db.getMetadata('last_server_update_time'))?.value;

      console.log(`[Sync] Server update: ${serverUpdate}, Local last: ${localLastUpdate}`);

      // Mandatory Throttle after /posts/update
      await this.wait(5000);

      let forceSentinel = false;
      if (serverUpdate !== localLastUpdate) {
        console.log('[Sync] Server has mutations. Entering Precision Strike mode...');

        // Path A: Fast-Path Delta (Additions/Edits)
        const lastFullSync = (await db.getMetadata('last_full_sync_time'))?.value;
        if (lastFullSync) {
          console.log(`[Sync] Requesting additions since ${lastFullSync}`);
          const deltaUrl = `${this.proxyUrl}/posts/all?auth_token=${this.authToken}&fromdt=${lastFullSync}&format=json`;
          const deltaResp = await fetch(deltaUrl);
          if (deltaResp.ok) {
            const additions = await deltaResp.json();
            if (additions.length > 0) {
              console.log(`[Sync] Found ${additions.length} server-side additions/edits.`);
              await db.upsertBatch(additions);
            }
          }
          // Throttle after Path A
          await this.wait(5000);
        } else {
          // No previous sync time? Fallback to big pull
          await db.fetchAllFromServer(this.proxyUrl, this.authToken, (p) => console.log(p.status));
          await this.wait(5000);
        }
        forceSentinel = true;
      }

      // Path B: The Dates Hack (Deletions)
      // We run this if the timestamp changed OR if we haven't successfully run it yet this session
      let sentinelSuccess = true;
      if (forceSentinel || !hasRunSentinelThisSession) {
        sentinelSuccess = await this.runDatesSentinel();
        if (sentinelSuccess) {
          hasRunSentinelThisSession = true;
          console.log('[Sync] Sentinel session ritual complete.');
        }
      } else {
        console.log('[Sync] Server and local are in sync. (Dates Sentinel skipped)');
      }

      // 3. Update sync state ONLY if everything succeeded
      if (sentinelSuccess) {
        await db.setMetadata('last_server_update_time', serverUpdate);
        await db.setMetadata('last_full_sync_time', new Date().toISOString());
        console.log('[Sync] Handshake successfully recorded.');
      } else {
        console.warn('[Sync] Sync state NOT updated due to sentinel failure.');
      }

    } catch (err) {
      console.error('[Sync] Precision Sync failed:', err);
    } finally {
      this.isSyncing = false;
      const pending = await db.getPending();
      if (!pending || pending.length === 0) {
        this.syncIndicator.style.display = 'none';
      }

      // If a new change happened while we were syncing, run again immediately
      if (this.needsSync) {
        this.startLoop();
      } else {
        // Schedule next run in 1 minute
        setTimeout(() => this.startLoop(), 60000);
      }
    }
  }

  async renameTag(oldTag: string, newTag: string) {
    console.log(`[Sync] Starting Tag Rename Workaround: ${oldTag} -> ${newTag}`);
    this.setBusy(true);

    try {
      // 1. Get all local bookmarks with the old tag
      const all = await db.getAll();
      const targets = all.filter((b: any) => (b.tags || '').split(' ').includes(oldTag));
      console.log(`[Sync] Found ${targets.length} bookmarks with tag '${oldTag}'`);

      for (const b of targets) {
        const tags = new Set((b.tags || '').split(' ').filter(t => t !== oldTag));
        tags.add(newTag);
        b.tags = Array.from(tags).join(' ');

        console.log(`[Sync] Updating ${b.href}...`);
        // We write locally first
        await db.localUpsert(b);
      }

      // 2. Trigger a push to flush these changes
      await this.pushPending();

      // 3. Delete the old tag globally from Pinboard
      console.log(`[Sync] Deleting old tag '${oldTag}' from server...`);
      const params = new URLSearchParams({
        auth_token: this.authToken!,
        tag: oldTag,
        format: 'json'
      });
      const resp = await fetch(`${this.proxyUrl}/tags/delete?${params.toString()}`, { cache: 'no-store' });
      const res = await resp.json();
      console.log('[Sync] Server response:', res.result_code);

      console.log('[Sync] Tag Rename Complete.');
      if ((window as any).refreshApp) await (window as any).refreshApp();

    } catch (err) {
      console.error('[Sync] Tag Rename Failed:', err);
    } finally {
      this.setBusy(false);
    }
  }

  private async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async runDatesSentinel(): Promise<boolean> {
    console.log('[Sync] Sentinel: Start');

    try {
      // 1. Get Local Counts
      console.log('[Sync] Sentinel: Requesting Local Counts');
      const localCountsArray = await db.getDateCounts();
      console.log(`[Sync] Sentinel: Received ${localCountsArray.length} local date buckets`);

      const localCounts: Record<string, number> = {};
      let localTotal = 0;
      localCountsArray.forEach((row: any) => {
        localCounts[row.date_str] = row.qty;
        localTotal += row.qty;
      });

      // 2. Fetch Server Counts
      console.log('[Sync] Sentinel: Fetching Server Dates from Proxy');
      // Remove cache-buster, legacy APIs can be sensitive to unknown params
      let resp = await fetch(`${this.proxyUrl}/posts/dates?auth_token=${this.authToken}&format=json`, { cache: 'no-store' });
      let text = resp.ok ? await resp.text() : '';

      // Retry once if empty (could be quiet throttling) - wait 5s now
      if (resp.ok && (!text || text.trim() === '')) {
        console.warn('[Sync] Sentinel: Received 0 bytes. Waiting 5s and retrying...');
        await this.wait(5000);
        resp = await fetch(`${this.proxyUrl}/posts/dates?auth_token=${this.authToken}&format=json`, { cache: 'no-store' });
        text = resp.ok ? await resp.text() : '';
      }


      if (!resp.ok) throw new Error(`Dates Sentinel fetch failed: ${resp.status}`);
      console.log(`[Sync] Sentinel: Received ${text.length} bytes from server`);

      if (!text || text.trim() === '') {
        console.warn('[Sync] Sentinel: Abort - Server returned empty body.');
        return false;
      }

      let serverData;
      try {
        serverData = JSON.parse(text);
      } catch (parseErr) {
        console.error('[Sync] Sentinel: JSON Parse Failed. Raw text:', text.substring(0, 500));
        throw parseErr;
      }

      console.log('[Sync] Sentinel: Successfully parsed Server Dates');
      const serverCounts: Record<string, number> = {};
      let serverTotal = 0;
      Object.entries(serverData.dates).forEach(([date, count]) => {
        const c = parseInt(count as string, 10);
        serverCounts[date] = c;
        serverTotal += c;
      });

      console.log(`[Sync] Sentinel Totals: Local ${localTotal} vs Server ${serverTotal}`);

      // 3. Compare and Pinpoint Mismatches
      console.log('[Sync] Sentinel: Comparing buckets...');
      const allDates = new Set([...Object.keys(localCounts), ...Object.keys(serverCounts)]);
      const mismatches: string[] = [];

      for (const date of allDates) {
        if (localCounts[date] !== serverCounts[date]) {
          console.log(`[Sync] Date Mismatch at ${date}: Local ${localCounts[date] || 0} vs Server ${serverCounts[date] || 0}`);
          mismatches.push(date);
        }
      }

      if (mismatches.length > 0) {
        console.log(`[Sync] Sentinel: Reconciling ${mismatches.length} mismatched dates...`);
        for (const date of mismatches) {
          console.log(`[Sync] Sentinel: Reconciling bucket ${date}`);
          // Throttle between date buckets
          await this.wait(5000);
          const getUrl = `${this.proxyUrl}/posts/get?auth_token=${this.authToken}&dt=${date}&format=json`;
          const getResp = await fetch(getUrl, { cache: 'no-store' });
          if (getResp.ok) {
            const data = await getResp.json();
            const authoritativeBookmarks = data.posts || [];
            console.log(`[Sync] Sentinel: Reconciling ${authoritativeBookmarks.length} records for ${date}`);
            await db.reconcileDate(date, authoritativeBookmarks);
            await db.upsertBatch(authoritativeBookmarks);
          }
        }
        return true;
      } else {
        console.log('[Sync] Sentinel: Perfect parity achieved.');
        return true;
      }
    } catch (e) {
      console.error('[Sync] Sentinel: CRITICAL FAILURE:', e);
      return false;
    }
  }

  private async pushPending(): Promise<number> {
    const pending = await db.getPending();
    if (!pending || pending.length === 0) return 0;

    console.log(`[Sync] Found ${pending.length} pending writes.`);
    let count = 0;

    for (const b of pending) {
      try {
        console.log(`[Sync] Pushing ${b.sync_status} for ${b.href}...`);

        if (b.sync_status === 'PENDING_DELETE') {
          const params = new URLSearchParams({
            auth_token: this.authToken!,
            url: b.href,
            format: 'json'
          });
          const resp = await fetch(`${this.proxyUrl}/posts/delete?${params.toString()}`, { cache: 'no-store' });
          if (!resp.ok) throw new Error(`Delete failed with status ${resp.status}`);
          const res = await resp.json();
          if (res.result_code === 'done' || res.result_code === 'item not found') {
            await db.setSynchronized(b.href);
            console.log(`[Sync] Successfully deleted ${b.href}`);
            count++;
          }
        } else {
          const params = new URLSearchParams({
            auth_token: this.authToken!,
            url: b.href,
            description: b.description,
            extended: b.extended || '',
            tags: b.tags || '',
            dt: b.time,
            replace: 'yes',
            format: 'json'
          });

          const resp = await fetch(`${this.proxyUrl}/posts/add?${params.toString()}`, { cache: 'no-store' });
          if (!resp.ok) {
            if (resp.status === 429) {
              console.warn('[Sync] Rate limited. Stopping push.');
              break;
            }
            throw new Error(`Push failed with status ${resp.status}`);
          }

          const res = await resp.json();
          if (res.result_code === 'done') {
            await db.setSynchronized(b.href);
            console.log(`[Sync] Successfully pushed ${b.href}`);
            count++;
          } else {
            console.error(`[Sync] API Error pushing ${b.href}:`, res.result_code);
          }
        }

        // Respect 5-second delay between write-intensive requests
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (err) {
        console.error(`[Sync] Failed to push ${b.href}:`, err);
        break;
      }
    }
    return count;
  }

  private async fetchServerUpdateTime(): Promise<string> {
    const resp = await fetch(`${this.proxyUrl}/posts/update?auth_token=${this.authToken}&format=json`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Failed to fetch server update time: ${resp.status}`);
    const data = await resp.json();
    return data.update_time;
  }
}



// Initialize Application
const db = new DatabaseBridge();
(window as any).db = db;
const vList = new VirtualizedList('viewport', 'canvas', 'bookmark-list');
const sync = new SyncOrchestrator('sync-indicator');
(window as any).sync = sync;

let hasRunSentinelThisSession = false;

let popularTagsCache: string[] = [];

const populateTagSuggestions = async (inputVal: string = '') => {
  if (popularTagsCache.length === 0) {
    popularTagsCache = await db.getPopularTags();
  }

  const datalist = document.getElementById('tag-suggestions')!;
  if (!datalist) return;

  // Extract prefix (everything before the last space)
  const lastSpaceIndex = inputVal.lastIndexOf(' ');
  const prefix = lastSpaceIndex === -1 ? '' : inputVal.substring(0, lastSpaceIndex + 1);

  datalist.innerHTML = popularTagsCache.map(t => `<option value="${prefix}${t}">`).join('');
};

const initApp = async () => {
  // Register Service Worker for Offline Fortress Support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('[SW] Service Worker Registered', reg.scope);
        
        // Quantum Leap: GitHub Pages Header Hack
        // If we are not cross-origin isolated, it means the COOP/COEP headers are missing.
        // Once the Service Worker is active and controlling the page, it will inject them.
        // We reload once to 'boot' into the secure context.
        const isIsolated = window.crossOriginIsolated;
        const hasReloaded = sessionStorage.getItem('sw-bootstrap-reloaded');

        if (!isIsolated && reg.active && !hasReloaded) {
          console.log('[SW] Secure context established. Reloading to unlock fortress...');
          sessionStorage.setItem('sw-bootstrap-reloaded', 'true');
          location.reload();
        } else if (isIsolated) {
          console.log('[SW] Fortress is secure (CrossOriginIsolated).');
          sessionStorage.removeItem('sw-bootstrap-reloaded');
        }
      }).catch(err => {
        console.error('[SW] Registration Failed', err);
      });
    });
  }

  const statusEl = document.getElementById('status')!;
  const searchContainer = document.getElementById('search-container')!;
  const loginContainer = document.getElementById('login-container')!;
  const addForm = document.getElementById('add-form')!;
  const toggleAddBtn = document.getElementById('toggle-add-btn')!;
  const syncButton = document.getElementById('sync-button') as HTMLButtonElement;
  const authTokenInput = document.getElementById('auth-token') as HTMLInputElement;
  const searchInput = document.getElementById('search') as HTMLInputElement;
  const offlineIndicator = document.getElementById('offline-indicator')!;
  const syncIndicator = document.getElementById('sync-indicator')!;

  // Offline detection
  const updateOnlineStatus = () => {
    offlineIndicator.style.display = navigator.onLine ? 'none' : 'block';
  };
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  console.log('Initializing Pinboard PWA...');
  try {
    await db.init();
    await populateTagSuggestions();
    console.log('Database Ready.');

    // Load persisted token
    const savedToken = (await db.getMetadata('auth_token'))?.value;
    if (savedToken) {
      authTokenInput.value = savedToken;
      sync.setAuthToken(savedToken);
      sync.startLoop();
    }

    const refreshData = async () => {
      const existing = await db.getAll();
      const hasToken = !!(await db.getMetadata('auth_token'))?.value;
      const hasSynced = !!(await db.getMetadata('last_full_sync_time'))?.value;
      const hasData = existing && existing.length > 0;

      // Unlock UI if we have a token AND (data exists OR setup ritual complete)
      const isUnlocked = hasToken && (hasData || hasSynced);

      toggleAddBtn.style.display = isUnlocked ? 'inline' : 'none';
      searchContainer.style.display = (isUnlocked || hasData) ? 'block' : 'none';

      // If we are locked, ensure form is hidden
      if (!isUnlocked) {
        addForm.style.display = 'none';
        toggleAddBtn.innerHTML = '+';
      }

      // If we have data, we hide the login container (unless token is missing)
      // If we have NO data, we ALWAYS show the sync button to allow re-ingestion
      loginContainer.style.display = hasData && hasToken ? 'none' : 'flex';

      if (hasData) {
        statusEl.innerHTML = `${existing.length} ${!hasToken ? '<span class="token-error">(Sync Disabled: No Key)</span>' : ''}`;
        vList.updateItems(existing);
      } else if (isUnlocked) {
        statusEl.textContent = 'Fortress initialized. No bookmarks found on server.';
        vList.updateItems([]);
      } else {
        statusEl.innerHTML = 'Empty database. Insert your token from <a href="https://pinboard.in/settings/password">pinboard.in/settings/password</a>.';
        vList.updateItems([]);
      }
    };

    (window as any).refreshApp = refreshData;

    // Toggle Add Form handler
    toggleAddBtn.onclick = (e) => {
      e.preventDefault();
      const isHidden = addForm.style.display === 'none';
      addForm.style.display = isHidden ? 'flex' : 'none';
      toggleAddBtn.innerHTML = isHidden ? '&times;' : '+';
    };

    (window as any).deleteBookmark = async (href: string) => {
      await db.localDelete(href);
      await refreshData();
      sync.trigger();
    };
    await refreshData();

    // Add Bookmark handler
    const addButton = document.getElementById('add-button') as HTMLButtonElement;
    const resetButton = document.getElementById('reset-button') as HTMLButtonElement;
    const newUrlInput = document.getElementById('new-url') as HTMLInputElement;
    const newTitleInput = document.getElementById('new-title') as HTMLInputElement;
    const newTagsInput = document.getElementById('new-tags') as HTMLInputElement;

    newTagsInput.oninput = () => {
      populateTagSuggestions(newTagsInput.value);
    };

    resetButton.onclick = async () => {
      if (confirm('DEEP RESET: Wipe database and credentials?')) {
        await db.debugClearDb();
        location.reload();
      }
    };

    addButton.onclick = async () => {
      const url = newUrlInput.value.trim();
      const title = newTitleInput.value.trim();
      const tags = newTagsInput.value.trim();
      if (!url || !title) return;

      const bookmark = {
        href: url,
        description: title,
        tags: tags,
        extended: '',
        time: new Date().toISOString()
      };

      // 1. Write instantly to local DB
      await db.localUpsert(bookmark);
      console.log('[UI] Local write complete.');

      // 2. Refresh UI immediately
      await refreshData();
      popularTagsCache = [];
      await populateTagSuggestions();

      // 3. Trigger background sync immediately
      sync.trigger();

      newUrlInput.value = '';
      newTitleInput.value = '';
      newTagsInput.value = '';
    };

    // Search logic
    let searchTimeout: any;
    searchInput.oninput = () => {
      clearTimeout(searchTimeout);
      const query = searchInput.value.trim();

      searchTimeout = setTimeout(async () => {
        if (!query) {
          await refreshData();
          return;
        }
        // FTS5 Match
        try {
          const results = await db.search(query);
          vList.updateItems(results);
          statusEl.textContent = `${results.length}`;
        } catch (e) {
          console.error('Search error:', e);
        }
      }, 50); // 50ms debounce as per spec
    };

    syncButton.onclick = async () => {
      const token = authTokenInput.value.trim();
      if (!token) return alert('Please enter your Pinboard auth_token (username:HEX)');

      syncButton.disabled = true;
      sync.setBusy(true); // Lock the sync orchestrator
      statusEl.textContent = 'Connecting to Proxy...';
      try {
        const proxyUrl = 'https://pinboard-proxy.ian-pinboard-proxy.workers.dev';

        // Initial Full Sync
        await db.fetchAllFromServer(proxyUrl, token, (progress) => {
          statusEl.textContent = progress.status;
        });

        // Save token and start background sync
        await db.setMetadata('auth_token', token);
        const serverUpdate = await fetch(`${proxyUrl}/posts/update?auth_token=${token}&format=json`, { cache: 'no-store' })
          .then(r => r.json())
          .then(d => d.update_time);
        await db.setMetadata('last_server_update_time', serverUpdate);
        await db.setMetadata('last_full_sync_time', new Date().toISOString());

        sync.setAuthToken(token);
        sync.startLoop();

        await refreshData();
        popularTagsCache = [];
        await populateTagSuggestions();
      } catch (err) {
        console.error('Sync Error:', err);
        statusEl.textContent = 'Sync Failed: ' + err;
      } finally {
        syncButton.disabled = false;
        sync.setBusy(false); // Release the lock
      }
    };

  } catch (error) {
    console.error('Initialization Failed:', error);
    statusEl.textContent = 'Error: ' + error;
  }
};

window.addEventListener('DOMContentLoaded', initApp);
