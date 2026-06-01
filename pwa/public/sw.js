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

// Install Event: Cache what we can
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Take control immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Fortress Assets');
      // Use map and individual add to prevent one 404 from failing the whole cache
      // In production, /src/ files won't exist at these paths.
      return Promise.allSettled(
        [...VENDOR_ASSETS, ...APP_ASSETS].map(url => cache.add(url))
      );
    })
  );
});

// Activate Event: Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
      self.clients.claim() // Take control of all clients immediately
    ])
  );
});

// Helper to inject COOP/COEP headers
function enhanceResponse(response) {
  if (!response) return response;
  
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// Fetch Event: Mixed Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strategy A: Cache-First for heavy/static vendor assets
  if (VENDOR_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return enhanceResponse(cached);
        return fetch(event.request).then(enhanceResponse);
      })
    );
    return;
  }

  // Strategy B: Network-First for app logic/styles
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with fresh version
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return enhanceResponse(response);
      })
      .catch(() => {
        // Fallback to cache if network is dead
        return caches.match(event.request).then(enhanceResponse);
      })
  );
});
