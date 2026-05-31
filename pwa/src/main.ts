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

  async upsertBatch(bookmarks: any[]) {
    return this.send('UPSERT_BATCH', bookmarks);
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
      const li = document.createElement('li');
      li.className = 'bookmark';
      // Use transform for hardware acceleration and to avoid the "scroll-linked" warning
      li.style.transform = `translateY(${i * this.itemHeight}px)`;
      li.style.willChange = 'transform';
      li.innerHTML = `
        <a href="${b.href}" target="_blank">${b.description}</a>
        <div class="tags">${b.tags || ''}</div>
        <div style="font-size: 0.7rem; color: #999;">${new URL(b.href).hostname}</div>
      `;
      fragment.appendChild(li);
    }
    
    this.list.innerHTML = '';
    this.list.appendChild(fragment);
  }
}

// Initialize Application
const db = new DatabaseBridge();
(window as any).db = db;
const vList = new VirtualizedList('viewport', 'canvas', 'bookmark-list');

const initApp = async () => {
  const statusEl = document.getElementById('status')!;
  const searchContainer = document.getElementById('search-container')!;
  const loginContainer = document.getElementById('login-container')!;
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

    const refreshData = async () => {
      const existing = await db.getAll();
      if (existing && existing.length > 0) {
        statusEl.textContent = `${existing.length} bookmarks.`;
        loginContainer.style.display = 'none';
        searchContainer.style.display = 'block';
        vList.updateItems(existing);
      } else {
        statusEl.textContent = 'Empty database. Ready for initial sync.';
        loginContainer.style.display = 'block';
        searchContainer.style.display = 'none';
        vList.updateItems([]);
      }
    };

    (window as any).refreshApp = refreshData;
    await refreshData();

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
      syncIndicator.style.display = 'block';
      try {
        const proxyUrl = 'https://pinboard-proxy.ian-pinboard-proxy.workers.dev';
        await db.fetchAllFromServer(proxyUrl, token, (progress) => {
          statusEl.textContent = progress.status;
        });

        await refreshData();
      } catch (err) {
        console.error('Sync Error:', err);
        statusEl.textContent = 'Sync Failed: ' + err;
      } finally {
        syncButton.disabled = false;
        syncIndicator.style.display = 'none';
      }
    };

  } catch (error) {
    console.error('Initialization Failed:', error);
    statusEl.textContent = 'Error: ' + error;
  }
};

window.addEventListener('DOMContentLoaded', initApp);
