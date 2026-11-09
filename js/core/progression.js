// Подсказка прогрессии: двойная прогрессия + застой/откат/перерыв (research/progression.md, §3).
//
// suggest(exercise, targets, history) →
//   { weight: number|null, reps: number|null, text: string|null, kind: 'up'|'hold'|'first'|'deload'|null,
//     timeSec?: number }   // timeSec — только для упражнений на время
//   targets — подходы шаблона [{kind, repsMin, repsMax, timeSec?, rir?}] (берём kind==='normal')
//   history — store.exerciseHistory(id): [{ workout, item, sets }], новые сверху, sets — только выполненные
//
// Правило:
//  • верх диапазона во всех рабочих подходах (или везде RIR ≥ 4) → +1 шаг веса, цель — низ диапазона
//    (перебор верха на 3+ повтора → +2 шага);
//  • иначе тот же вес и +1 повтор к худшему подходу;
//  • провал (меньше низа в половине подходов): первый раз — повтор, два подряд — откат;
//  • 3 тренировки без прогресса на одном весе — откат на −10% (минимум на шаг);
//  • перерыв 14+ дней — старт с −10%;
//  • assisted (гравитрон): вес = помощь, «тяжелее» = помощи меньше, всё считается зеркально;
//  • time: все подходы не короче цели → +5 с (потолок 90 с).

import { fmtNum } from './util.js';

const STALL_SESSIONS = 3;
const FAIL_STREAK_RESET = 2;
const RESET_FACTOR = 0.1; // откат −10%
const LONG_BREAK_DAYS = 14;
const RIR_TOO_EASY = 4;
const BIG_JUMP_EXTRA = 3;
const TIME_STEP = 5;
const TIME_CAP = 90;
const EPS = 1e-9;

export function defaultStep(ex) {
  if (ex?.step) return ex.step;
  switch (ex?.equipment) {
    case 'barbell': case 'ez': case 'smith': return 2.5;
    case 'dumbbell': return 2;
    case 'machine': case 'cable': return 5;
    case 'kettlebell': return 4;
    default: return 2.5;
  }
}

const kg = (w) => `${fmtNum(w)} кг`;
const roundStep = (w, step) => Math.round(w / step - EPS) * step;
const clean = (w) => Math.round(w * 100) / 100;
const roundDown = (w, step) => clean(Math.floor(w / step + EPS) * step);
const roundUp = (w, step) => clean(Math.ceil(w / step - EPS) * step);
const nearest = (w, step) => clean(roundStep(w, step));

// Рабочие (нормальные) выполненные подходы тренировки.
const workSets = (h) => (h.sets || []).filter((s) => s.kind === 'normal' || s.kind == null).filter((s) => (s.reps || s.timeSec));

// «Сложность» веса: для assisted меньше помощи = тяжелее.
const mkLoad = (ex) => { const sign = ex?.type === 'assisted' ? -1 : 1; return (w) => sign * (w || 0); };

function evalSession(h, t, load, sign) {
  const w = workSets(h);
  const loads = w.map((s) => load(s.weight));
  const best = Math.max(...loads);
  const main = w.filter((s) => load(s.weight) === best);
  const reps = main.map((s) => s.reps || 0);
  const W = main[0].weight || 0;
  const rirs = main.map((s) => s.rir).filter((v) => v != null);
  const okCount = main.length >= t.N;
  return {
    W, best, reps, total: reps.reduce((a, b) => a + b, 0), n: main.length,
    hitTop: t.max != null && okCount && reps.every((r) => r >= t.max),
    bigOver: t.max != null && okCount && reps.every((r) => r >= t.max + BIG_JUMP_EXTRA),
    failed: t.min != null && reps.filter((r) => r < t.min).length >= Math.ceil(main.length / 2),
    tooEasy: t.min != null && okCount && rirs.length === main.length && rirs.every((v) => v >= RIR_TOO_EASY) && reps.every((r) => r >= t.min),
    allFailure: rirs.length === main.length && rirs.length > 0 && rirs.every((v) => v === 0),
  };
}

const progressed = (cur, prev) => cur.best > prev.best || (cur.best === prev.best && cur.total > prev.total);

function stallCount(evs) {
  let n = 0;
  for (let i = 0; i + 1 < evs.length; i++) {
    if (evs[i].best < evs[i + 1].best) break; // откат — новый отсчёт
    if (progressed(evs[i], evs[i + 1])) break;
    n++;
  }
  return n;
}

function failStreak(evs) {
  let n = 0;
  for (let i = 0; i < evs.length; i++) {
    if (evs[i].best !== evs[0].best || !evs[i].failed) break;
    n++;
  }
  return n;
}

const NONE = { weight: null, reps: null, text: null, kind: null };

function suggestTime(targets, hist) {
  const t0 = targets.find((t) => t.timeSec);
  const sets = hist.map(workSets).filter((s) => s.length);
  const N = targets.length || 1;
  if (!sets.length) {
    if (!t0) return { ...NONE, kind: 'first', text: 'Держи, сколько получится, с хорошей техникой.' };
    return { weight: null, reps: null, timeSec: t0.timeSec, kind: 'first', text: `Начни с ${t0.timeSec} с. Не выходит — сколько получится.` };
  }
  const ts = sets[0].map((s) => s.timeSec || 0);
  const minT = Math.min(...ts);
  const goal = t0?.timeSec ?? minT;
  const cap = Math.max(TIME_CAP, goal);
  if (minT >= cap) {
    return { weight: null, reps: null, timeSec: cap, kind: 'up', text: `${cap} с — уже много. Усложни вариант, а не время.` };
  }
  if (ts.length >= N && minT >= goal) {
    const next = Math.min(cap, Math.floor(minT / TIME_STEP) * TIME_STEP + TIME_STEP);
    return { weight: null, reps: null, timeSec: next, kind: 'up', text: `Прошлый раз отлично — сегодня ${next} с.` };
  }
  return { weight: null, reps: null, timeSec: goal, kind: 'hold', text: `Цель ${goal} с в каждом подходе.` };
}

export function suggest(ex, targets, history, now = Date.now()) {
  if (!ex || ex.type === 'cardio') return { ...NONE };
  const normal = (targets || []).filter((t) => t.kind === 'normal');
  const hist = (history || []).filter((h) => !h.workout?.deload && !h.item?.deload);

  if (ex.type === 'time') return suggestTime(normal, hist);

  const min = normal[0]?.repsMin ?? null;
  const max = normal[0]?.repsMax ?? min;
  const sessions = hist.filter((h) => workSets(h).length);
  const type = ex.type || 'weight_reps';
  const assisted = type === 'assisted';
  const bw = type === 'bw_reps';
  const step = defaultStep(ex);
  const sign = assisted ? -1 : 1;
  const load = mkLoad(ex);
  const minWeight = ex.bar && !bw && !assisted ? ex.bar : 0;

  // --- первый раз
  if (!sessions.length) {
    const range = min != null ? `${min}${max && max !== min ? '–' + max : ''}` : null;
    let text = null;
    if (range) {
      text = bw ? `Первый раз: сделай ${range} повторов с запасом 2–3.`
        : assisted ? `Первый раз: выбери помощь, с которой выходит ${range} повторов с запасом 2–3.`
        : `Первый раз: возьми вес, с которым ${range} повторов выходят с запасом 2–3. Лучше легче — дальше прибавим.`;
    }
    return { weight: null, reps: min, text, kind: 'first' };
  }

  const N = normal.length || evalSessionCount(sessions[0]);
  const t = { min, max, N };
  const evs = sessions.map((h) => evalSession(h, t, load, sign));
  const e = evs[0];
  const W = e.W;
  const hasRange = min != null && max != null;
  const wOut = (w) => (bw && !w ? null : w);

  // --- нет диапазона (пустой шаблон): повторяем прошлое
  if (!hasRange) {
    const r = Math.min(...e.reps);
    return { weight: wOut(W), reps: r || null, text: null, kind: 'hold' };
  }

  // --- долгий перерыв
  const last = sessions[0].workout;
  const lastTs = last?.finishedAt || last?.startedAt;
  const days = lastTs ? (now - lastTs) / 864e5 : 0;
  if (days >= LONG_BREAK_DAYS && (W > 0 || assisted)) {
    const w = assisted ? roundUp(W * (1 + RESET_FACTOR), step) : Math.max(minWeight, roundDown(W * (1 - RESET_FACTOR), step));
    if (w !== W) {
      return { weight: wOut(w), reps: min, kind: 'deload',
        text: `Перерыв ${Math.round(days)} дн. Начни полегче: ${kg(w)}, цель от ${min}. Быстро вернёшься к ${kg(W)}.` };
    }
  }

  // --- прибавка
  if (e.hitTop || e.tooEasy) {
    const n = e.bigOver ? 2 : 1;
    const why = e.tooEasy && !e.hitTop ? 'Было слишком легко' : `Все подходы по ${max}+`;
    if (assisted) {
      const w = Math.max(0, clean(W - step * n));
      if (W <= 0) {
        return { weight: 0, reps: max, kind: 'up', text: `${why} без помощи. Можно добавить отягощение или усложнить вариант.` };
      }
      return { weight: w, reps: min, kind: 'up', text: `${why} — меньше помощи: ${kg(w)}, цель от ${min}.` };
    }
    if (bw && !W) {
      return { weight: null, reps: max, kind: 'up', text: `${why}. Добавь отягощение или усложни вариант.` };
    }
    const w = clean(roundDown(W, step) + step * n); // к сетке шага, всегда выше W
    return { weight: w, reps: min, kind: 'up', text: `${why} — прибавь до ${kg(w)}, цель от ${min}.` };
  }

  // --- откат: провалы подряд или застой
  const fs = failStreak(evs), st = stallCount(evs);
  if (fs >= FAIL_STREAK_RESET || st >= STALL_SESSIONS) {
    const mid = Math.ceil((min + max) / 2);
    let w;
    if (assisted) w = roundUp(Math.max(W * (1 + RESET_FACTOR), W + step), step);
    else w = Math.max(minWeight, Math.min(roundDown(W * (1 - RESET_FACTOR), step), clean(W - step)));
    const why = fs >= FAIL_STREAK_RESET ? `Два раза подряд не вышло ${min} повторов` : `${st} тренировки без прогресса`;
    if (bw && !W) {
      return { weight: null, reps: mid, kind: 'deload', text: `${why}. Сделай ${mid} повторов, не до отказа, и разгонись заново.` };
    }
    if (w === W) {
      return { weight: wOut(W), reps: mid, kind: 'deload', text: `${why}. Сделай ${mid} повторов с запасом и разгонись заново.` };
    }
    return { weight: w, reps: mid, kind: 'deload', text: `${why} — шаг назад: ${kg(w)}, цель ${mid}. Для дефицита калорий это нормально.` };
  }

  // --- одна неудача: повторить
  if (e.failed) {
    return { weight: wOut(W), reps: min, kind: 'hold',
      text: `Прошлый раз было тяжело. Повтори${W ? ' ' + kg(W) : ''}, цель ${min}. Поспи и поешь заранее.` };
  }

  // --- обычный случай: +1 повтор к самому слабому подходу
  const goal = Math.min(max, Math.max(min, Math.min(...e.reps) + 1));
  let text = `${W ? kg(W) + ': д' : 'Д'}обавь повтор — цель ${goal} в каждом подходе. Когда везде будет ${max}, прибавим${assisted ? ' (уменьшим помощь)' : bw && !W ? ' нагрузку' : ' вес'}.`;
  if (st === STALL_SESSIONS - 1) text += ' Две тренировки без роста: если не выйдет и сегодня, сделаем шаг назад.';
  if (e.allFailure) text += ' Прошлый раз до отказа — оставь 1–2 повтора в запасе.';
  return { weight: wOut(W), reps: goal, text, kind: 'hold' };
}

function evalSessionCount(h) { return Math.max(1, workSets(h).length); }
