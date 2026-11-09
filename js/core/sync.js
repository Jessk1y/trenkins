// Синхронизация с сервером и push «отдых окончен».
// Приложение по-прежнему local-first: всё пишется в IndexedDB, а сюда попадают «грязные» записи,
// которые отправляются на сервер пачкой. С сервера приходят чужие изменения (с другого устройства).
import { store } from './store.js';
import { api, auth, ls, ApiError, API_BASE } from './api.js';
import { rerender } from '../router.js';

const LS_SYNC = 'trenkins.sync';   // { cursor, lastSync, lastUserId, dirty: ['store/id', …] }
const LS_PUSH = 'trenkins.push';   // true, если на этом устройстве включены уведомления

const st = { cursor: 0, lastSync: null, lastUserId: null, dirty: [], ...(ls.get(LS_SYNC) || {}) };
const dirty = new Set(st.dirty);
const persist = () => ls.set(LS_SYNC, { cursor: st.cursor, lastSync: st.lastSync, lastUserId: st.lastUserId, dirty: [...dirty] });

const CHUNK = 7000; // байт на запрос и на ответ
let running = null;
let again = false;
let timer = null;
let lastError = null;
let lastRestAt = null;
const subs = new Set();
const notify = () => subs.forEach((fn) => { try { fn(status()); } catch (e) { console.error(e); } });

export function status() {
  const a = auth.get();
  return { user: a?.user || null, pending: dirty.size, lastSync: st.lastSync, error: lastError, busy: !!running, pushOn: !!ls.get(LS_PUSH) };
}
export function onStatus(fn) { subs.add(fn); return () => subs.delete(fn); }

function markAllDirty() { for (const r of store.allRaw()) dirty.add(`${r.store}/${r.id}`); persist(); }

/** Подписка на локальные изменения — помечаем записи для отправки и планируем синк. */
export function initSync() {
  store.on((kind, obj, meta) => {
    if (meta?.remote) return;
    if (kind === '*') markAllDirty();
    else if (obj?.id) { dirty.add(`${kind}/${obj.id}`); persist(); }
    if (kind === 'workouts' && obj) watchRest(obj);
    schedule(2000);
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') schedule(0); });
  window.addEventListener('online', () => schedule(0));
  setInterval(() => { if (document.visibilityState === 'visible') schedule(0); }, 30000);
  schedule(0);
}

function schedule(ms) {
  if (!auth.get()) return;
  clearTimeout(timer);
  timer = setTimeout(() => syncNow().catch(() => {}), ms);
}

/** Один проход синхронизации: отправить грязное, забрать новое (пока есть). */
export function syncNow() {
  if (!auth.get()) return Promise.resolve();
  if (running) { again = true; return running; }
  running = (async () => {
    notify();
    try {
      let more = true;
      let changed = 0;
      while (more) {
        // мелкие порции: из России соединения с Cloudflare без VPN рвутся после ~16 КБ
        const changes = [];
        const sent = new Map();
        let size = 0;
        for (const k of [...dirty]) {
          const [s, ...rest] = k.split('/');
          const id = rest.join('/');
          const rec = store.raw(s, id);
          if (!rec) { dirty.delete(k); continue; }
          const len = JSON.stringify(rec).length;
          if (changes.length && size + len > CHUNK) break;
          changes.push({ store: s, id, data: rec }); sent.set(k, rec.updatedAt); size += len;
        }
        const res = await withRetry(() => api('POST', '/api/sync', { cursor: st.cursor, changes, maxBytes: CHUNK }));
        // отправленное и не изменившееся за время запроса — больше не грязное
        for (const [k, upd] of sent) {
          const [s, ...rest] = k.split('/');
          if (store.raw(s, rest.join('/'))?.updatedAt === upd) dirty.delete(k);
        }
        changed += await store.applyRemote(res.changes || []);
        st.cursor = res.cursor;
        more = res.more || [...dirty].some((k) => !sent.has(k));
      }
      st.lastSync = Date.now();
      lastError = null;
      persist();
      if (changed) softRerender();
    } catch (e) {
      lastError = e.message;
      if (e instanceof ApiError && e.status === 401) { auth.clear(); lastError = 'Сессия истекла — войди заново'; }
    } finally {
      running = null;
      notify();
      if (again) { again = false; schedule(500); }
    }
  })();
  return running;
}

/** Повтор при обрыве связи: новое соединение обычно проходит */
async function withRetry(fn, tries = 4) {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 0 || i >= tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
}

/** Перерисовать экран после чужих изменений — но не мешать вводу и не трогать идущую тренировку. */
function softRerender() {
  if (location.hash.startsWith('#/workout')) return;
  if (document.querySelector('#sheet-root .sheet')) return;
  const a = document.activeElement;
  if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
  rerender();
}

// ---------- Вход / выход ----------
async function afterAuth(res, { keepLocal }) {
  auth.set({ token: res.token, user: res.user });
  if (keepLocal) markAllDirty();
  else { await store.wipeLocal(); dirty.clear(); }
  st.lastUserId = res.user.id;
  st.cursor = 0;
  persist();
  notify();
  await syncNow();
  if (lastError) throw new Error(lastError);
}

/** есть ли на устройстве что-то кроме настроек */
export function hasLocalData() {
  return ['workouts', 'templates', 'programs', 'body', 'exercises'].some((s) => store.list(s).length);
}

export async function register(login, password, invite) {
  const res = await api('POST', '/api/register', { login, password, invite });
  await afterAuth(res, { keepLocal: true });
}

/** keepLocal: true — добавить данные устройства в аккаунт; false — стереть их и взять из аккаунта */
export async function login(loginName, password, { keepLocal }) {
  const res = await api('POST', '/api/login', { login: loginName, password });
  await afterAuth(res, { keepLocal });
}

export async function logout({ wipe }) {
  try { await syncNow(); } catch { /* выходим всё равно */ }
  try { await disablePush(); } catch { /* ок */ }
  try { await api('POST', '/api/logout'); } catch { /* токен мог уже истечь */ }
  auth.clear();
  if (wipe) { await store.wipeLocal(); dirty.clear(); st.lastUserId = null; }
  st.cursor = 0;
  persist();
  notify();
}

// ---------- Push «отдых окончен» ----------
export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

export async function enablePush() {
  if (!pushSupported()) throw new Error(navigator.standalone === false || !matchMedia('(display-mode: standalone)').matches
    ? 'Уведомления работают только в установленном приложении: Safari → Поделиться → На экран «Домой»'
    : 'Этот браузер не поддерживает уведомления');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Уведомления запрещены — разреши их в настройках iPhone для Тренькинса');
  const reg = await navigator.serviceWorker.ready;
  const { key } = await api('GET', '/api/push/key');
  if (!key) throw new Error('На сервере не настроены ключи уведомлений');
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uToBytes(key) });
  await api('POST', '/api/push/subscribe', { subscription: sub.toJSON() });
  ls.set(LS_PUSH, true);
  notify();
}

export async function disablePush() {
  ls.set(LS_PUSH, null);
  notify();
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    try { await api('POST', '/api/push/unsubscribe', { endpoint: sub.endpoint }); } catch { /* ок */ }
    await sub.unsubscribe();
  }
}

export const testPush = () => api('POST', '/api/push/test');

/** Следим за таймером отдыха в активной тренировке и ставим/снимаем push на сервере. */
function watchRest(w) {
  if (!auth.get() || !ls.get(LS_PUSH)) return;
  if (w.id !== store.settings().activeWorkoutId && !(w.finishedAt && lastRestAt)) return;
  const at = !w.finishedAt && w.restUntil && w.restUntil > Date.now() + 3000 ? w.restUntil : null;
  if (at === lastRestAt) return;
  lastRestAt = at;
  withRetry(() => (at ? api('POST', '/api/rest', { at, title: 'Отдых окончен', body: `${w.name}: пора на следующий подход` }) : api('DELETE', '/api/rest')))
    .catch((e) => console.warn('rest push', e.message));
}

function b64uToBytes(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export { API_BASE };
