/* Planting Guide Naija - service worker (offline + low data) */
const VERSION = 'pgn-v1';
const SHELL = ['./', 'index.html', 'css/styles.css', 'js/config.js', 'js/crops.js', 'js/app.js', 'manifest.webmanifest', 'icons/icon.svg'];
const IMG_CACHE = 'pgn-img-v1';
const MAX_IMGS = 80;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== IMG_CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_IMGS) await Promise.all(keys.slice(0, keys.length - MAX_IMGS).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Weather and news: always live (the app saves its own copy)
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('gnews.io') || url.pathname.includes('/w/api.php')) return;

  // Photos and fonts: use saved copy first, update quietly
  if (req.destination === 'image' || url.hostname.includes('wikimedia.org') || url.hostname.includes('gstatic.com') || url.hostname.includes('googleapis.com')) {
    e.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) { cache.put(req, res.clone()).then(() => trim(cache)); } return res; }).catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  // App files: saved copy first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
    );
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
