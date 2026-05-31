const CACHE_NAME = 'pinboard-pwa-v2';
const VENDOR_ASSETS = [
  '/vendor/sqlite3-bundler-friendly.mjs',
  '/vendor/sqlite3.wasm',
  '/vendor/sqlite3-opfs-async-proxy.js',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/site.webmanifest'
];

const APP_ASSETS = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/worker.ts',
  '/src/style.css'
];

// Install Event: Cache everything
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Fortress Assets');
      return cache.addAll([...VENDOR_ASSETS, ...APP_ASSETS]);
    })
  );
});

// Activate Event: Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch Event: Mixed Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy A: Cache-First for heavy/static vendor assets
  if (VENDOR_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Strategy B: Network-First for app logic/styles
  // This prevents the "MIME Type" mismatch and "Stale CSS" issues during dev
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with fresh version
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is dead
        return caches.match(event.request);
      })
  );
});
