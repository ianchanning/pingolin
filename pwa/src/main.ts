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
  private itemHeight = 80;
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
        <div style="display: flex; justify-content: space-between;">
          <a href="${b.href}" target="_blank">${b.description}</a>
          <button class="delete-btn" data-href="${b.href}">Delete</button>
        </div>
        <div class="tags">${b.tags || ''}</div>
        <div style="font-size: 0.7rem; color: #999;">${new URL(b.href).hostname} ${b.sync_status !== 'SYNCHRONIZED' ? ' 🔄' : ''}</div>
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
        } else {
          // No previous sync time? Fallback to big pull
          await db.fetchAllFromServer(this.proxyUrl, this.authToken, (p) => console.log(p.status));
        }

        // Path B: The Dates Hack (Deletions)
        await this.runDatesSentinel();

        // 3. Update sync state
        await db.setMetadata('last_server_update_time', serverUpdate);
        await db.setMetadata('last_full_sync_time', new Date().toISOString());

        if ((window as any).refreshApp) await (window as any).refreshApp();
        console.log('[Sync] Precision Sync Complete.');
      } else {
        console.log('[Sync] Server and local are in sync.');
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

  private async runDatesSentinel() {
    console.log('[Sync] Running Dates Sentinel...');

    // 1. Get Local Counts
    const localCountsArray = await db.getDateCounts();
    const localCounts: Record<string, number> = {};
    localCountsArray.forEach((row: any) => localCounts[row.date_str] = row.qty);

    // 2. Fetch Server Counts
    const resp = await fetch(`${this.proxyUrl}/posts/dates?auth_token=${this.authToken}&format=json`);
    if (!resp.ok) throw new Error(`Dates Sentinel fetch failed: ${resp.status}`);
    const serverData = await resp.json();
    const serverCounts: Record<string, number> = {};
    Object.entries(serverData.dates).forEach(([date, count]) => {
      serverCounts[date] = parseInt(count as string, 10);
    });

    // 3. Compare and Pinpoint Mismatches
    const allDates = new Set([...Object.keys(localCounts), ...Object.keys(serverCounts)]);
    const mismatches: string[] = [];

    for (const date of allDates) {
      if (localCounts[date] !== serverCounts[date]) {
        mismatches.push(date);
      }
    }

    if (mismatches.length > 0) {
      console.log(`[Sync] Found ${mismatches.length} mismatched dates. Reconciling targeted buckets...`);

      for (const date of mismatches) {
        console.log(`[Sync] Reconciling ${date}...`);
        const getUrl = `${this.proxyUrl}/posts/get?auth_token=${this.authToken}&dt=${date}&format=json`;
        const getResp = await fetch(getUrl);
        if (getResp.ok) {
          const authoritativeBookmarks = await getResp.json();
          // reconcileDate handles deleting what's missing locally
          await db.reconcileDate(date, authoritativeBookmarks);
          // upsertBatch handles updating edits/additions for that specific day
          await db.upsertBatch(authoritativeBookmarks);
        }
        // Throttling
        await new Promise(r => setTimeout(r, 1000));
      }
    } else {
      console.log('[Sync] Dates Sentinel: No mismatches found.');
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
          const resp = await fetch(`${this.proxyUrl}/posts/delete?${params.toString()}`);
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

          const resp = await fetch(`${this.proxyUrl}/posts/add?${params.toString()}`);
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

        // Respect 3-second delay between write-intensive requests
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (err) {
        console.error(`[Sync] Failed to push ${b.href}:`, err);
        break;
      }
    }
    return count;
  }

  private async fetchServerUpdateTime(): Promise<string> {
    const resp = await fetch(`${this.proxyUrl}/posts/update?auth_token=${this.authToken}&format=json`);
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

const initApp = async () => {
  const statusEl = document.getElementById('status')!;
  const searchContainer = document.getElementById('search-container')!;
  const loginContainer = document.getElementById('login-container')!;
  const addForm = document.getElementById('add-form')!;
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
      
      addForm.style.display = (isUnlocked && hasToken) ? 'flex' : 'none';
      searchContainer.style.display = (isUnlocked || hasData) ? 'block' : 'none';
      
      // If we have data, we hide the login container (unless token is missing)
      // If we have NO data, we ALWAYS show the sync button to allow re-ingestion
      loginContainer.style.display = hasData && hasToken ? 'none' : 'block';

      if (hasData) {
        statusEl.innerHTML = `${existing.length} bookmarks. ${!hasToken ? '<span class="token-error">(Sync Disabled: No Key)</span>' : ''}`;
        vList.updateItems(existing);
      } else if (isUnlocked) {
        statusEl.textContent = 'Fortress initialized. No bookmarks found on server.';
        vList.updateItems([]);
      } else {
        statusEl.textContent = 'Empty database. Ready for initial sync.';
        vList.updateItems([]);
      }
    };

    (window as any).refreshApp = refreshData;
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

    resetButton.onclick = async () => {
      if (confirm('DEEP RESET: Wipe database and credentials?')) {
        await db.debugClearDb();
        location.reload();
      }
    };
    const newTitleInput = document.getElementById('new-title') as HTMLInputElement;

    addButton.onclick = async () => {
      const url = newUrlInput.value.trim();
      const title = newTitleInput.value.trim();
      if (!url || !title) return;

      const bookmark = {
        href: url,
        description: title,
        tags: '',
        extended: '',
        time: new Date().toISOString()
      };

      // 1. Write instantly to local DB
      await db.localUpsert(bookmark);
      console.log('[UI] Local write complete.');

      // 2. Refresh UI immediately
      await refreshData();

      // 3. Trigger background sync immediately
      sync.trigger();

      newUrlInput.value = '';
      newTitleInput.value = '';
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
          statusEl.textContent = `${results.length} results.`;
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
        const serverUpdate = await fetch(`${proxyUrl}/posts/update?auth_token=${token}&format=json`)
          .then(r => r.json())
          .then(d => d.update_time);
        await db.setMetadata('last_server_update_time', serverUpdate);
        await db.setMetadata('last_full_sync_time', new Date().toISOString());

        sync.setAuthToken(token);
        sync.startLoop();

        await refreshData();
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
