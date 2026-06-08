const urlParams = new URLSearchParams(window.location.search);
const dbName = urlParams.get('dbName') || '/pinboard.db';
const initialQuery = urlParams.get('q') || '';

// Initialize Worker with cache busting
const worker = new Worker('/sync-worker.js?v=' + Date.now(), {
    type: 'module'
});

// Database Bridge for Tests & Debugging
class DatabaseBridge {
    async send(type, payload = {}) {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substring(7);
            const handler = (e) => {
                if (e.data.id === id) {
                    worker.removeEventListener('message', handler);
                    if (e.data.type === 'ERROR') reject(new Error(e.data.payload));
                    else resolve(e.data.payload);
                }
            };
            worker.addEventListener('message', handler);
            worker.postMessage({ type, payload, id });
        });
    }

    async query(sql, bind = []) {
        return this.send('QUERY', { sql, bind });
    }

    async upsertTagAlias(keyword, mapped_tag) {
        return this.send('UPSERT_TAG_ALIAS', { keyword, mapped_tag });
    }

    async debugClearDb() {
        return this.send('DEBUG_CLEAR_DB');
    }
}

window.db = new DatabaseBridge();

// Initial Handshake: DO THIS FIRST
window.db.send('INIT', { dbName });

const app = Elm.Main.init({
    node: document.getElementById('elm-app'),
    flags: {
        query: initialQuery,
        isHydrated: localStorage.getItem('pingolin_hydrated') === 'true'
    }
});

if (app.ports && app.ports.viewportSize) {
    const monitorContainer = () => {
        const container = document.querySelector('.archive-scroll-container');
        if (container) {
            // Report actual container height for virtual scrolling range
            app.ports.viewportSize.send(container.clientHeight);
            
            // Report scroll position
            container.addEventListener('scroll', () => {
                if (app.ports.scrollPosition) {
                    app.ports.scrollPosition.send(Math.round(container.scrollTop));
                }
            }, { passive: true });

            // Watch for size changes
            const resizer = new ResizeObserver(() => {
                app.ports.viewportSize.send(container.clientHeight);
            });
            resizer.observe(container);
            return true;
        }
        return false;
    };

    // Retry until the container is rendered by Elm
    const retryMonitor = () => {
        if (!monitorContainer()) setTimeout(retryMonitor, 100);
    };
    retryMonitor();
}

// Port Bridge
if (app.ports && app.ports.toWorker) {
    app.ports.toWorker.subscribe((msg) => {
        if (msg.type === 'START_HYDRATION') {
            window.sync.proxyUrl = msg.payload.proxyUrl;
            window.sync.authToken = msg.payload.authToken;
        }
        worker.postMessage(msg);
    });
}

if (app.ports && app.ports.updateUrl) {
    app.ports.updateUrl.subscribe((query) => {
        const url = new URL(window.location);
        if (query) {
            url.searchParams.set('q', query);
        } else {
            url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url);
    });
}

if (app.ports && app.ports.networkStatus) {
    const updateOnlineStatus = () => {
        app.ports.networkStatus.send(navigator.onLine);
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
}

worker.onmessage = (e) => {
    if (app.ports && app.ports.fromWorker) {
        app.ports.fromWorker.send(e.data);
    }
    
    // Persistence Hints
    if (e.data.type === 'SYNC_COMPLETE' || e.data.type === 'SESSION_RESTORED') {
        localStorage.setItem('pingolin_hydrated', 'true');
    }

    // Auto-update popular tags in Elm when they arrive
    if (e.data.type === 'QUERY_RESULTS' && e.data.id === 'popular-tags') {
        if (app.ports && app.ports.tagSuggestions) {
            app.ports.tagSuggestions.send(e.data.payload);
        }
    }
};

// Sync Orchestrator for Tests & Debugging
class SyncOrchestrator {
    constructor(db) {
        this.db = db;
        this.proxyUrl = 'https://pinboard-proxy.ian-pinboard-proxy.workers.dev/';
        this.authToken = '';
    }

    async startLoop() {
        return this.db.send('START_SYNC_LOOP', { proxyUrl: this.proxyUrl, authToken: this.authToken });
    }

    async setInterval(ms) {
        return this.db.send('SET_SYNC_INTERVAL', ms);
    }

    async setThrottle(ms) {
        return this.db.send('SET_THROTTLE', ms);
    }

    async setDebugCap(cap) {
        console.log('Setting debug cap:', cap);
    }

    async renameTag(oldTag, newTag) {
        return this.db.send('RENAME_TAG', { oldTag, newTag, proxyUrl: this.proxyUrl, authToken: this.authToken });
    }
}

window.sync = new SyncOrchestrator(window.db);

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('[SW] Registered:', reg.scope))
            .catch(err => console.error('[SW] Registration Failed:', err));
    });
}

// Periodically fetch popular tags for autocomplete
setInterval(() => {
    worker.postMessage({ type: 'GET_POPULAR_TAGS', id: 'popular-tags' });
}, 30000);
worker.postMessage({ type: 'GET_POPULAR_TAGS', id: 'popular-tags' });

console.log('Pingolin Bootstrapped. DB:', dbName);
