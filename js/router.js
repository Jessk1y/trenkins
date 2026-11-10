// Хеш-роутер. Маршруты: #/ (сегодня), #/workout, #/programs, #/program/<id>, #/template/<id>,
// #/history, #/history/<id>, #/progress, #/exercise/<id>, #/body, #/settings.
// Каждый view — модуль с export function render(root, params) → (необязательно) функция очистки.

import { closeAllSheets } from './core/ui.js';

const routes = [
  { re: /^\/?$/, view: () => import('./views/today.js'), tab: 'today' },
  { re: /^\/workout$/, view: () => import('./views/workout.js'), tab: null },
  { re: /^\/programs$/, view: () => import('./views/templates.js'), tab: 'programs' },
  { re: /^\/program\/([\w-]+)$/, view: () => import('./views/templates.js'), tab: 'programs', params: ['programId'] },
  { re: /^\/template\/([\w-]+)$/, view: () => import('./views/templates.js'), tab: 'programs', params: ['templateId'] },
  { re: /^\/day\/([\w-]+)$/, view: () => import('./views/library.js'), tab: 'programs', params: ['dayId'] },
  { re: /^\/library$/, view: () => import('./views/library.js'), tab: 'programs' },
  { re: /^\/library\/group\/([\w-]+)$/, view: () => import('./views/library.js'), tab: 'programs', params: ['group'] },
  { re: /^\/library\/([\w-]+)$/, view: () => import('./views/library.js'), tab: 'programs', params: ['templateId'] },
  { re: /^\/history$/, view: () => import('./views/history.js'), tab: 'history' },
  { re: /^\/history\/([\w-]+)$/, view: () => import('./views/history.js'), tab: 'history', params: ['workoutId'] },
  { re: /^\/progress$/, view: () => import('./views/progress.js'), tab: 'progress' },
  { re: /^\/exercise\/([\w-]+)$/, view: () => import('./views/progress.js'), tab: 'progress', params: ['exerciseId'] },
  { re: /^\/body$/, view: () => import('./views/progress.js'), tab: 'progress', params: [], extra: { body: true } },
  { re: /^\/settings$/, view: () => import('./views/settings.js'), tab: 'today' },
];

let cleanup = null;
let onTab = () => {};
export function onRouteTab(fn) { onTab = fn; }

export function navigate(hash, { replace = false } = {}) {
  if (replace) history.replaceState(null, '', hash);
  else if (location.hash !== hash) { location.hash = hash; return; }
  route();
}

export async function route() {
  const path = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  const r = routes.find((x) => x.re.test(path)) || routes[0];
  const m = path.match(r.re) || [];
  const params = { ...(r.extra || {}) };
  (r.params || []).forEach((p, i) => { params[p] = m[i + 1]; });
  closeAllSheets();
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } }
  cleanup = null;
  const root = document.getElementById('view');
  const mod = await r.view();
  root.replaceChildren();
  window.scrollTo(0, 0);
  onTab(r.tab);
  cleanup = mod.render(root, params) || null;
  if (cleanup instanceof Promise) cleanup = await cleanup;
}

export function rerender() { route(); }
