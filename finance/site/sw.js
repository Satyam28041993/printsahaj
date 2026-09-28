// Family Finance service worker.
//
// Network-first for everything. The app changes often right now, so a
// stale cache is worse than no cache — this only exists so the app is
// installable and shows something if the network is briefly down.
// API calls (financial data) are NEVER cached, at any point.
//
// Bump CACHE when the shell files below change materially, so old
// clients pick up the new version instead of serving a stale copy.
const CACHE = 'ff-shell-v1';
const SHELL = ['./', 'index.html', 'assets/app.css', 'assets/app.js', 'assets/vendor/chart.umd.min.js'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.includes('/api/')) {
    return; // Never touch API calls — always straight to the network.
  }
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
