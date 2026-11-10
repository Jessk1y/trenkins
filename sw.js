// Сервис-воркер: приложение работает без интернета.
// Код и стили — «сначала сеть» (обновления видны сразу, кэш — запасной вариант офлайн, ждём сеть не дольше 3 с).
// Картинки упражнений — «сначала кэш» (не меняются). Запросы в сеть идут мимо HTTP-кэша браузера.
// При изменении состава файлов поднимай VERSION.
const VERSION = 'trenkins-v11';
const CORE = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'css/views/history.css', 'css/views/progress.css', 'css/views/settings.css', 'css/views/templates.css', 'css/views/library.css',
  'js/main.js', 'js/router.js',
  'js/core/db.js', 'js/core/store.js', 'js/core/ui.js', 'js/core/util.js', 'js/core/workout.js', 'js/core/progression.js', 'js/core/seed.js', 'js/core/api.js', 'js/core/sync.js',
  'js/components/exercise-picker.js', 'js/components/plates.js', 'js/components/chart.js', 'js/components/library.js', 'js/components/account.js', 'js/components/exercise-info.js',
  'js/data/exercises.js', 'js/data/program.js', 'js/data/library.js',
  'js/views/today.js', 'js/views/workout.js', 'js/views/templates.js', 'js/views/history.js', 'js/views/progress.js', 'js/views/settings.js', 'js/views/library.js',
  'icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => Promise.all(CORE.map((u) => fetch(new Request(u, { cache: 'reload' })).then((r) => r.ok && c.put(u, r)).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const fromNet = (req) => fetch(req, { cache: 'no-cache' });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // API и чужие сайты — мимо
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: true });
    // картинки: из кэша, а нет — из сети и запомнить
    if (url.pathname.includes('/img/')) {
      if (cached) return cached;
      const res = await fromNet(req).catch(() => null);
      if (res?.ok) cache.put(req, res.clone());
      return res || Response.error();
    }
    // остальное: сеть (до 3 с, если есть кэш), иначе кэш
    const net = fromNet(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
    const timeout = cached ? new Promise((r) => setTimeout(() => r(null), 3000)) : null;
    try {
      const res = await (timeout ? Promise.race([net, timeout]) : net);
      if (res) return res;
      e.waitUntil(net.catch(() => null)); // сеть медленная — отдаём кэш, но обновим его
    } catch { /* офлайн */ }
    if (cached) return cached;
    if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
    return Response.error();
  }));
});

// Push «отдых окончен» (присылает сервер, см. server/src/index.js)
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Тренькинс', {
    body: d.body || '',
    tag: d.tag || 'trenkins',
    renotify: true,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    data: { url: d.url || './' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const c = list.find((x) => x.url.startsWith(self.registration.scope));
    if (c) { c.navigate?.(url).catch(() => {}); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
