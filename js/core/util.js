// Общие утилиты: id, даты, числа, расчёты.

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

/** "82,5" | "82.5" | "" → number | null */
export function parseNum(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** 82.5 → "82,5"; 80 → "80" */
export function fmtNum(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const r = Math.round(n * 10 ** digits) / 10 ** digits;
  return String(r).replace('.', ',');
}

export function fmtKg(n) {
  return n === null || n === undefined ? '—' : fmtNum(n) + ' кг';
}

/** большие числа: 21400 → "21,4 т" */
export function fmtTonnage(kg) {
  if (!kg) return '0';
  if (kg >= 1000) return fmtNum(kg / 1000, 1) + ' т';
  return fmtNum(kg, 0) + ' кг';
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_FULL = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WD = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WD_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

export function fmtDate(ts, { year = false } = {}) {
  const d = new Date(ts);
  const now = new Date();
  let s = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  if (year || d.getFullYear() !== now.getFullYear()) s += ` ${d.getFullYear()}`;
  return s;
}
export function fmtDateLong(ts) {
  const d = new Date(ts);
  return `${WD_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS_FULL[d.getMonth()]}`;
}
export function fmtTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export const weekdayShort = (d) => WD[d.getDay()];

/** ms → "1:05:12" / "38:12" */
export function fmtDuration(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0'), ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
/** секунды → "2:30" */
export const fmtSec = (sec) => fmtDuration(sec * 1000);

/** ms → "1 ч 5 мин" */
export function fmtDurationWords(ms) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} мин`;
  return `${Math.floor(m / 60)} ч ${m % 60} мин`;
}

export function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
/** понедельник недели */
export function startOfWeek(ts) {
  const d = new Date(startOfDay(ts));
  const wd = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - wd);
  return d.getTime();
}
export const DAY = 86400000;

/** Склонение: plural(3, 'подход', 'подхода', 'подходов') */
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

/** Расчётный 1ПМ (Эпли). Для >12 повторов оценка ненадёжна — возвращаем null. */
export function e1rm(weight, reps) {
  if (!weight || !reps || reps < 1) return null;
  if (reps === 1) return weight;
  if (reps > 12) return null;
  return weight * (1 + reps / 30);
}

/** Раскладка блинов на одну сторону, жадно. */
export function platesFor(total, barWeight, available) {
  let side = (total - barWeight) / 2;
  if (side < 0) return { plates: [], rest: side * 2, ok: false };
  const out = [];
  const list = [...available].sort((a, b) => b - a);
  for (const p of list) {
    while (side >= p - 1e-9) { out.push(p); side -= p; }
  }
  side = Math.round(side * 1000) / 1000;
  return { plates: out, rest: side * 2, ok: side === 0 };
}

export function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

export const clone = (o) => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
