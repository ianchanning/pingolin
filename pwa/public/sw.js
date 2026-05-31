const CACHE_NAME = 'pinboard-pwa-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/worker.ts',
  '/src/style.css',
  '/vendor/sqlite3-bundler-friendly.mjs',
  '/vendor/sqlite3.wasm',
  '/vendor/sqlite3-opfs-async-proxy.js'
];

// Install Event: Cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Fortress Assets');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// Fetch Event: Cache-First Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for our assets
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
