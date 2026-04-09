// The Library — Service Worker
// Network-first for HTML: always fetches the latest deployed version.
// No cache version bumping needed when you redeploy.
// Falls back to cache if offline.

const CACHE_NAME = 'the-library-cache';
const APP_URLS = ['/THE-LIBRARY/', '/THE-LIBRARY/index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { pathname } = new URL(event.request.url);
  const isAppShell = pathname === '/THE-LIBRARY/' || pathname === '/THE-LIBRARY/index.html';

  if (isAppShell) {
    // Network-first: try to get fresh HTML, update cache, fall back offline
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Everything else (icons, manifest, PDF.js CDN): cache-first
    event.respondWith(
      caches.match(event.request).then(r => r || fetch(event.request))
    );
  }
});
