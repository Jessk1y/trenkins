// Сервис-воркер: приложение работает без интернета.
// Стратегия: stale-while-revalidate для своих файлов — мгновенно из кэша, обновление в фоне.
// При изменении состава файлов поднимай VERSION.
const VERSION = 'trenkins-v3';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'css/views/history.css', 'css/views/progress.css', 'css/views/settings.css', 'css/views/templates.css',
  'js/main.js', 'js/router.js',
  'js/core/db.js', 'js/core/store.js', 'js/core/ui.js', 'js/core/util.js', 'js/core/workout.js', 'js/core/progression.js', 'js/core/seed.js',
  'js/components/exercise-picker.js', 'js/components/plates.js', 'js/components/chart.js', 'js/components/library.js',
  'js/data/exercises.js', 'js/data/program.js', 'js/data/library.js',
  'js/views/today.js', 'js/views/workout.js', 'js/views/templates.js', 'js/views/history.js', 'js/views/progress.js', 'js/views/settings.js',
  'icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (cached) { e.waitUntil(net); return cached; }
    const res = await net;
    if (res) return res;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  }));
});
