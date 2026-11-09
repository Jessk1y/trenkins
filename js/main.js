// Точка входа: загрузка данных, тема, таббар, плашка активной тренировки, сервис-воркер.
import { store } from './core/store.js';
import { h, icon } from './core/ui.js';
import { route, onRouteTab } from './router.js';
import { fmtDuration } from './core/util.js';

const TABS = [
  { id: 'today', href: '#/', label: 'Сегодня', icon: 'today' },
  { id: 'programs', href: '#/programs', label: 'Программы', icon: 'programs' },
  { id: 'history', href: '#/history', label: 'История', icon: 'history' },
  { id: 'progress', href: '#/progress', label: 'Прогресс', icon: 'progress' },
];

export function applyTheme() {
  const t = store.settings().theme;
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f1114' : '#f2f3f6');
}

function buildTabbar() {
  const bar = document.getElementById('tabbar');
  bar.replaceChildren(...TABS.map((t) => h('a', { href: t.href, dataset: { tab: t.id } }, icon(t.icon), t.label)));
  onRouteTab((tab) => {
    bar.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
    updateLiveBar();
  });
}

const live = document.getElementById('live-bar');
function updateLiveBar() {
  const w = store.activeWorkout();
  const onWorkout = location.hash.startsWith('#/workout');
  const show = !!w && !onWorkout;
  live.hidden = !show;
  document.body.classList.toggle('has-live', show);
  if (!show) return;
  live.replaceChildren(icon('play'), h('span', { class: 'ellipsis' }, w.name), h('span', { class: 't' }, fmtDuration(Date.now() - w.startedAt)));
}
live.addEventListener('click', () => { location.hash = '#/workout'; });
live.setAttribute('role', 'button');
setInterval(() => { if (!live.hidden) updateLiveBar(); }, 1000);

async function boot() {
  try {
    await store.init();
  } catch (e) {
    document.getElementById('view').textContent = 'Не удалось открыть хранилище: ' + e.message;
    throw e;
  }
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
  store.on((kind) => { if (kind === 'settings' || kind === '*') { applyTheme(); updateLiveBar(); } });
  buildTabbar();
  window.addEventListener('hashchange', route);
  await route();

  const isDev = ['localhost', '127.0.0.1'].includes(location.hostname);
  if ('serviceWorker' in navigator && isDev) {
    // при разработке кэш мешает видеть правки
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    caches?.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
  } else if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));
  }
}

boot();
