// 350 Chess service worker (SDD §8.7, ADR-013). Generated into dist/sw.js at build time:
// sw/serviceWorkerPlugin.ts fills in the cache version and the precache list below.
//
// Goal: local mode works offline after the first visit (SRS 2.3).
// - install:  precache the app shell (index + every built asset)
// - navigate: network first (so new deploys show up), cached app shell when offline
// - assets:   cache first (file names are content-hashed, so they never go stale)
// - live API: /socket.io and /healthz are never cached
const CACHE = 'chess350-__VERSION__';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('chess350-') && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/socket.io') || url.pathname === '/healthz') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.open(CACHE).then((cache) => cache.match('/'))),
    );
    return;
  }

  event.respondWith(caches.match(request).then((hit) => hit || fetch(request)));
});
