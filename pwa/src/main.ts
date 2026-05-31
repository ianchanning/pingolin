/**
 * Pinboard PWA - Main Thread
 */

class DatabaseBridge {
  private worker: Worker;
  private pendingRequests: Map<string, { resolve: Function, reject: Function }> = new Map();

  constructor() {
    // Vite handles worker bundling
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.onmessage = (e) => {
      const { type, payload, id } = e.data;
      const promise = this.pendingRequests.get(id);

      if (promise) {
        if (type === 'ERROR') {
          promise.reject(payload);
        } else {
          promise.resolve(payload);
        }
        this.pendingRequests.delete(id);
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

  private send(type: string, payload?: any): Promise<any> {
    const id = Math.random().toString(36).substring(7);
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({ type, payload, id });
    });
  }
}

// Initialize Application
const db = new DatabaseBridge();

const initApp = async () => {
  console.log('Initializing Pinboard PWA...');
  try {
    await db.init();
    console.log('Database Ready.');

    // Test: Insert a bookmark
    await db.upsertBatch([{
      href: 'https://pinboard.in',
      description: 'Pinboard',
      extended: 'Social Bookmarking for introverts',
      tags: 'bookmarking social',
      time: new Date().toISOString()
    }]);
    console.log('Test Bookmark Inserted.');
    
    // Test search
    const results = await db.search('Pinboard');
    console.log('Search Results:', results);

    document.getElementById('status')!.textContent = `Database Ready. (${results.length} bookmarks found in test search)`;
    
    if (results.length > 0) {
      const list = document.getElementById('bookmark-list')!;
      results.forEach((b: any) => {
        const li = document.createElement('li');
        li.className = 'bookmark';
        li.innerHTML = `
          <a href="${b.href}" target="_blank">${b.description}</a>
          <div class="tags">${b.tags}</div>
        `;
        list.appendChild(li);
      });
      (document.getElementById('search') as HTMLInputElement).disabled = false;
    }

  } catch (error) {
    console.error('Initialization Failed:', error);
    document.getElementById('status')!.textContent = 'Error: ' + error;
  }
};

window.addEventListener('DOMContentLoaded', initApp);
