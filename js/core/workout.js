// Логика тренировки: старт из шаблона/пустой, добавление упражнений и подходов, завершение.
import { store } from './store.js';
import { uid } from './util.js';
import { suggest, defaultStep } from './progression.js';

export function newSet(kind = 'normal', target = null, prefill = {}) {
  return { id: uid(), kind, weight: prefill.weight ?? null, reps: prefill.reps ?? null, timeSec: prefill.timeSec ?? null, distance: null, rir: null, done: false, target };
}

/** Строит пункт тренировки для упражнения. targets — подходы из шаблона (или null → по прошлому разу). */
export function buildItem(exerciseId, { targets = null, rest = null, superset = null, note = '' } = {}, excludeId = null) {
  const ex = store.exercise(exerciseId);
  const hist = store.exerciseHistory(exerciseId, { excludeId });
  const last = hist[0];
  let tgts = targets;
  if (!tgts || !tgts.length) {
    tgts = last
      ? last.sets.map((s) => ({ kind: s.kind, repsMin: s.reps, repsMax: s.reps, timeSec: s.timeSec }))
      : [{ kind: 'normal', repsMin: null, repsMax: null }, { kind: 'normal', repsMin: null, repsMax: null }, { kind: 'normal', repsMin: null, repsMax: null }];
  }
  return {
    id: uid(),
    exerciseId,
    rest: rest ?? ex?.rest ?? store.settings().defaultRest,
    superset,
    note: note || '',
    sets: tgts.map((t) => newSet(t.kind || 'normal', { repsMin: t.repsMin ?? null, repsMax: t.repsMax ?? null, timeSec: t.timeSec ?? null })),
  };
}

/**
 * Подсказки для пустых полей (placeholder): прошлый результат того же по счёту подхода,
 * а для рабочих подходов — рекомендация прогрессии. Возвращает { perSet: [{weight, reps, timeSec, prev}], hint }
 */
export function placeholders(item, workoutId) {
  const ex = store.exercise(item.exerciseId);
  const hist = store.exerciseHistory(item.exerciseId, { excludeId: workoutId });
  const last = hist[0];
  const targets = item.sets.map((s) => ({ kind: s.kind, ...(s.target || {}) }));
  // после перерыва мышечная память возвращает силу быстрее — первые 12 тренировок шаг прибавки двойной
  const st = store.settings();
  const fast = ex && st.experience === 'returning' && store.history().length < 12;
  const exP = fast ? { ...ex, step: defaultStep(ex) * 2 } : ex;
  const sg = st.showProgressionHints ? suggest(exP, targets, hist) : { weight: null, reps: null, text: null };
  const lastByKind = { warmup: [], normal: [], drop: [] };
  for (const s of last?.sets || []) (lastByKind[s.kind] || lastByKind.normal).push(s);
  const counters = { warmup: 0, normal: 0, drop: 0 };
  const running = { warmup: null, normal: null, drop: null }; // вес, уже введённый в этой тренировке
  const perSet = item.sets.map((s) => {
    const k = s.kind in counters ? s.kind : 'normal';
    const prev = lastByKind[k][counters[k]++] || null;
    let weight = prev?.weight ?? null;
    let reps = prev?.reps ?? s.target?.repsMin ?? null;
    if (k === 'normal' && sg.weight != null) weight = sg.weight;
    if (weight == null && !prev) weight = defaultWeight(ex);
    if (k === 'normal' && sg.reps != null) reps = sg.reps;
    // если в этой тренировке уже ввёл вес в предыдущем подходе — предлагаем его же
    if (running[k] != null) weight = running[k];
    if (s.weight != null) running[k] = s.weight;
    return { weight, reps, timeSec: prev?.timeSec ?? s.target?.timeSec ?? null, prev };
  });
  return { perSet, hint: sg.text, kind: sg.kind, last };
}

/**
 * Стартовый вес для упражнения, которое ещё ни разу не делал: заведомо лёгкий,
 * дальше подгоняешь кнопками −/+. Можно задать в каталоге полем startWeight.
 */
export function defaultWeight(ex) {
  if (!ex) return null;
  if (ex.startWeight != null) return ex.startWeight;
  const st = store.settings();
  const iso = (ex.rest ?? 120) <= 90; // изоляция — легче
  const step = defaultStep(ex);
  const barW = (id) => (st.bars || []).find((b) => b.id === id)?.weight;
  const minW = ex.equipment === 'barbell' ? (barW(ex.bar || 'olympic') ?? 20) : ex.equipment === 'ez' ? (barW(ex.bar || 'ez') ?? 10) : 0;
  // Есть максимум в жиме — считаем от него: 1ПМ упражнения ≈ жим × коэффициент,
  // после перерыва ×0,8, рабочий вес первой тренировки ≈ 65% 1ПМ (подходы по 8–12 с запасом).
  const detrain = st.experience === 'returning' ? 0.8 : 1;
  const work = st.benchMax && st.experience !== 'novice' ? st.benchMax * detrain * 0.65 : null;
  if (work && STRENGTH_RATIO[ex.id] != null) {
    return Math.max(minW, Math.floor(work * STRENGTH_RATIO[ex.id] / step + 1e-9) * step);
  }
  const scale = work ? Math.min(2, Math.max(0.8, work / 30)) : 1; // базовые значения ниже рассчитаны на рабочий жим ~30 кг
  let w = null;
  switch (ex.type === 'assisted' ? 'assisted' : ex.equipment) {
    case 'assisted': w = 30; break;
    case 'barbell': w = (barW(ex.bar || 'olympic') ?? 20) + ((ex.rest ?? 0) >= 180 ? 20 : 10); break;
    case 'ez': w = (barW(ex.bar || 'ez') ?? 10) + 5; break;
    case 'smith': w = 20; break;
    case 'dumbbell': w = iso ? 5 : 10; break;
    case 'kettlebell': w = 12; break;
    case 'machine': w = iso ? 15 : 30; break;
    case 'cable': w = iso ? 10 : 25; break;
    default: return null;
  }
  if (ex.type !== 'weight_reps' && ex.type !== 'assisted') return null;
  if (ex.type !== 'assisted') w *= scale;
  return Math.max(minW, Math.round(w / step) * step);
}

/** 1ПМ упражнения относительно 1ПМ жима лёжа (гантели — на одну руку). Ориентиры по типичным соотношениям силы. */
const STRENGTH_RATIO = {
  'bench-press': 1, 'incline-bench-press': 0.85, 'close-grip-bench': 0.85, 'smith-bench-press': 1, 'machine-chest-press': 0.9,
  'db-bench-press': 0.38, 'incline-db-press': 0.33, 'db-fly': 0.15, 'cable-crossover': 0.2, 'pec-deck': 0.6,
  'barbell-squat': 1.2, 'hack-squat': 1.3, 'leg-press': 2.2, 'goblet-squat': 0.3, 'walking-lunge': 0.15,
  'deadlift': 1.5, 'romanian-deadlift': 1.0, 'hip-thrust': 1.3, 'leg-extension': 0.6, 'leg-curl': 0.5, 'seated-leg-curl': 0.5,
  'overhead-press': 0.6, 'db-shoulder-press': 0.25, 'lateral-raise': 0.11, 'cable-lateral-raise': 0.08, 'rear-delt-fly': 0.1,
  'face-pull': 0.35, 'reverse-pec-deck': 0.4, 'upright-row': 0.45,
  'barbell-row': 0.75, 'db-row': 0.4, 'lat-pulldown': 0.8, 'wide-grip-pulldown': 0.75, 'close-grip-pulldown': 0.8,
  'seated-cable-row': 0.8, 'machine-row': 0.8,
  'barbell-curl': 0.45, 'ez-curl': 0.42, 'db-curl': 0.17, 'hammer-curl': 0.19, 'preacher-curl': 0.38, 'cable-curl': 0.4,
  'triceps-pushdown': 0.45, 'overhead-triceps-extension': 0.25, 'db-kickback': 0.1, 'cable-crunch': 0.6,
};

export async function startWorkout(template = null) {
  const cur = store.activeWorkout();
  if (cur) return cur;
  const w = {
    name: template?.name || 'Тренировка',
    templateId: template?.id || null,
    programId: template?.programId || null,
    startedAt: Date.now(),
    finishedAt: null,
    note: '',
    items: [],
  };
  w.id = uid();
  if (template) {
    w.items = template.items.map((it) => buildItem(it.exerciseId, { targets: it.sets, rest: it.rest, superset: it.superset, note: it.note }, w.id));
  }
  await store.save('workouts', w);
  await store.saveSettings({ activeWorkoutId: w.id });
  return w;
}

/** Сохраняем тренировку, вычищая незаполненные подходы и пустые упражнения. */
export async function finishWorkout(w) {
  for (const it of w.items) it.sets = it.sets.filter((s) => s.done);
  w.items = w.items.filter((it) => it.sets.length);
  w.finishedAt = Date.now();
  delete w.restUntil; delete w.restTotal;
  await store.save('workouts', w);
  await store.saveSettings({ activeWorkoutId: null });
  return w;
}

export async function discardWorkout(w) {
  await store.remove('workouts', w.id);
  await store.saveSettings({ activeWorkoutId: null });
}

/** Сводка по тренировке */
export function summarize(w) {
  let sets = 0, volume = 0;
  for (const it of w.items) for (const s of it.sets) {
    if (!s.done) continue;
    sets++;
    if (s.kind !== 'warmup' && s.weight && s.reps) volume += s.weight * s.reps;
  }
  return { sets, volume, exercises: w.items.filter((it) => it.sets.some((s) => s.done)).length, duration: (w.finishedAt || Date.now()) - w.startedAt };
}

/** Обновить шаблон по фактической тренировке (порядок упражнений и число подходов) */
export function templateFromWorkout(w) {
  return {
    name: w.name,
    note: '',
    items: w.items.map((it) => ({
      id: uid(), exerciseId: it.exerciseId, rest: it.rest, superset: it.superset || null, note: it.note || '',
      sets: it.sets.map((s) => ({ kind: s.kind, repsMin: s.target?.repsMin ?? s.reps ?? null, repsMax: s.target?.repsMax ?? s.reps ?? null, timeSec: s.target?.timeSec ?? s.timeSec ?? null })),
    })),
  };
}
