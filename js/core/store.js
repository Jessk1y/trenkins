// Хранилище приложения: всё держим в памяти (данных мало), пишем в IndexedDB.
// Любой модуль читает через store.*, пишет через store.save/remove и подписывается через store.on.
//
// Модели (все с id, createdAt, updatedAt, deletedAt?):
//  exercise  { id, name, aliases[], muscle, secondary[], equipment, type, bar?, step?, rest?, note?, custom? }
//            встроенные упражнения берутся из js/data/exercises.js; в БД лежат только свои и правки встроенных
//  program   { id, name, note, templateIds[], active }
//  template  { id, name, note, programId|null, order, items: TemplateItem[] }
//            TemplateItem { id, exerciseId, rest, superset|null, note, sets: [{ kind:'warmup'|'normal'|'drop', repsMin, repsMax, timeSec?, rir? }] }
//  workout   { id, name, templateId|null, programId|null, startedAt, finishedAt|null, note, restUntil?, restTotal?,
//              items: [{ id, exerciseId, rest, superset|null, note, sets: [WorkoutSet] }] }
//            WorkoutSet { id, kind, weight|null, reps|null, timeSec|null, distance|null, rir|null, done, target?: {repsMin,repsMax,timeSec,weight} }
//  body      { id, date, weight?, waist?, chest?, hips?, arm?, thigh?, note? }
//  settings  { id:'main', ...DEFAULT_SETTINGS }

import { db, STORES, requestPersist } from './db.js';
import { uid, clone } from './util.js';
import { EXERCISES as CATALOG } from '../data/exercises.js';

export const DEFAULT_SETTINGS = {
  id: 'main',
  theme: 'dark',                 // 'dark' | 'light' | 'system'
  defaultRest: 120,              // сек
  autoRest: true,                // запускать таймер после отметки подхода
  keepAwake: true,               // не гасить экран во время тренировки
  showProgressionHints: true,
  bars: [
    { id: 'olympic', name: 'Олимпийский гриф', weight: 20 },
    { id: 'women', name: 'Женский гриф', weight: 15 },
    { id: 'ez', name: 'EZ-гриф (кривой)', weight: 10 },
    { id: 'short', name: 'Короткий гриф', weight: 7 },
  ],
  plates: [25, 20, 15, 10, 5, 2.5, 1.25],
  profile: { height: 173, goalWeight: 68 },
  experience: 'returning',       // 'novice' | 'returning' (после перерыва) | 'trained'
  benchMax: 70,                  // лучший жим лёжа на 1 раз (кг) — от него считаются стартовые веса
  activeWorkoutId: null,
};

const state = Object.fromEntries(STORES.map((s) => [s, new Map()]));
const catalog = new Map(CATALOG.map((e) => [e.id, { ...e, builtin: true }]));
const listeners = new Set();
let settingsCache = clone(DEFAULT_SETTINGS);

function emit(kind, obj, meta = {}) { for (const fn of listeners) { try { fn(kind, obj, meta); } catch (e) { console.error(e); } } }

export const store = {
  async init() {
    for (const s of STORES) {
      const all = await db.getAll(s);
      for (const o of all) state[s].set(o.id, o);
    }
    const saved = state.settings.get('main');
    settingsCache = { ...clone(DEFAULT_SETTINGS), ...(saved || {}) };
    requestPersist();
  },

  /** подписка на изменения: fn(kind, obj). Возвращает отписку. */
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  get(kind, id) {
    if (kind === 'exercises') return store.exercise(id);
    const o = state[kind].get(id);
    return o && !o.deletedAt ? o : null;
  },

  list(kind) {
    if (kind === 'exercises') return store.exercises();
    return [...state[kind].values()].filter((o) => !o.deletedAt);
  },

  async save(kind, obj) {
    const now = Date.now();
    if (!obj.id) obj.id = uid();
    if (!obj.createdAt) obj.createdAt = now;
    obj.updatedAt = now;
    state[kind].set(obj.id, obj);
    await db.put(kind, clone(obj));
    emit(kind, obj);
    return obj;
  },

  async remove(kind, id) {
    const o = state[kind].get(id) || (kind === 'exercises' ? catalog.get(id) : null);
    if (!o) return;
    const dead = { ...o, deletedAt: Date.now(), updatedAt: Date.now() };
    state[kind].set(id, dead);
    await db.put(kind, clone(dead));
    emit(kind, dead);
  },

  // ---------- Упражнения ----------
  exercise(id) {
    const own = state.exercises.get(id);
    const base = catalog.get(id);
    if (own?.deletedAt) return null;
    if (own && base) return { ...base, ...own, builtin: true };
    return own || base || null;
  },
  exercises() {
    const ids = new Set([...catalog.keys(), ...state.exercises.keys()]);
    return [...ids].map((id) => store.exercise(id)).filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  },
  exerciseName(id) { return store.exercise(id)?.name || 'Удалённое упражнение'; },

  // ---------- Настройки ----------
  settings() { return settingsCache; },
  async saveSettings(patch) {
    settingsCache = { ...settingsCache, ...patch, id: 'main' };
    await store.save('settings', settingsCache);
    return settingsCache;
  },

  // ---------- Тренировки ----------
  activeWorkout() {
    const id = settingsCache.activeWorkoutId;
    const w = id ? store.get('workouts', id) : null;
    return w && !w.finishedAt ? w : null;
  },
  /** завершённые тренировки, новые сверху */
  history() {
    return store.list('workouts').filter((w) => w.finishedAt).sort((a, b) => b.startedAt - a.startedAt);
  },
  /** все выполнения упражнения: [{ workout, item, sets(done) }], новые сверху */
  exerciseHistory(exerciseId, { excludeId = null } = {}) {
    const out = [];
    for (const w of store.history()) {
      if (w.id === excludeId) continue;
      for (const item of w.items) {
        if (item.exerciseId !== exerciseId) continue;
        const sets = item.sets.filter((s) => s.done);
        if (sets.length) out.push({ workout: w, item, sets });
      }
    }
    return out;
  },
  lastPerformance(exerciseId, opts) { return store.exerciseHistory(exerciseId, opts)[0] || null; },

  // ---------- Программы ----------
  templatesOf(programId) {
    const p = store.get('programs', programId);
    if (!p) return [];
    return p.templateIds.map((id) => store.get('templates', id)).filter(Boolean);
  },
  activeProgram() { return store.list('programs').find((p) => p.active) || null; },
  /** следующая тренировка активной программы: день после последнего сделанного */
  nextTemplate() {
    const p = store.activeProgram();
    if (!p) return null;
    const tpls = store.templatesOf(p.id);
    if (!tpls.length) return null;
    const last = store.history().find((w) => w.programId === p.id && w.templateId);
    if (!last) return tpls[0];
    const i = tpls.findIndex((t) => t.id === last.templateId);
    return tpls[(i + 1) % tpls.length];
  },

  // ---------- Синхронизация ----------
  /** запись как есть, включая удалённые (для отправки на сервер) */
  raw(kind, id) { return state[kind]?.get(id) || null; },
  /** все записи всех хранилищ, включая удалённые: [{store, id, data}] */
  allRaw() { return STORES.flatMap((s) => [...state[s].values()].map((o) => ({ store: s, id: o.id, data: o }))); },
  /** Применить записи с сервера: побеждает более свежий updatedAt. Возвращает число изменённых. */
  async applyRemote(changes) {
    const byStore = new Map();
    for (const c of changes) {
      if (!state[c.store] || !c.data) continue;
      const cur = state[c.store].get(c.id);
      if (cur && (cur.updatedAt || 0) >= (c.data.updatedAt || 0)) continue;
      state[c.store].set(c.id, c.data);
      if (!byStore.has(c.store)) byStore.set(c.store, []);
      byStore.get(c.store).push(c.data);
    }
    for (const [s, list] of byStore) await db.putMany(s, list);
    const n = [...byStore.values()].reduce((a, l) => a + l.length, 0);
    if (n) {
      const saved = state.settings.get('main');
      settingsCache = { ...clone(DEFAULT_SETTINGS), ...(saved || {}) };
      emit('*', null, { remote: true });
    }
    return n;
  },
  /** стереть все локальные данные (при входе в другой аккаунт) */
  async wipeLocal() {
    for (const s of STORES) { await db.clear(s); state[s].clear(); }
    settingsCache = clone(DEFAULT_SETTINGS);
    emit('*', null, { remote: true });
  },

  // ---------- Экспорт / импорт ----------
  exportAll() {
    const data = {};
    for (const s of STORES) data[s] = [...state[s].values()];
    return { app: 'trenkins', version: 1, exportedAt: Date.now(), data };
  },
  /** mode: 'merge' — побеждает более свежий updatedAt; 'replace' — стереть и залить */
  async importAll(json, mode = 'merge') {
    if (!json || json.app !== 'trenkins' || !json.data) throw new Error('Это не файл бэкапа Тренькинса');
    for (const s of STORES) {
      const incoming = json.data[s] || [];
      if (mode === 'replace') { await db.clear(s); state[s].clear(); }
      const toWrite = [];
      for (const o of incoming) {
        const cur = state[s].get(o.id);
        if (!cur || (o.updatedAt || 0) >= (cur.updatedAt || 0)) { state[s].set(o.id, o); toWrite.push(o); }
      }
      if (toWrite.length) await db.putMany(s, toWrite);
    }
    const saved = state.settings.get('main');
    settingsCache = { ...clone(DEFAULT_SETTINGS), ...(saved || {}) };
    emit('*', null);
  },
};
