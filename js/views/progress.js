// Экран прогресса: #/progress (обзор), #/exercise/<id> (упражнение), #/body (вес и замеры).
import { h, icon, topbar, empty, sheet, toast, confirmSheet, loadCss } from '../core/ui.js';
import { store } from '../core/store.js';
import { e1rm, fmtNum, fmtDate, fmtSec, parseNum, startOfWeek, DAY, plural } from '../core/util.js';
import { MUSCLES, EQUIPMENT } from '../data/exercises.js';
import { lineChart } from '../components/chart.js';

export function render(root, params = {}) {
  loadCss('css/views/progress.css');
  const rerender = params.body ? () => renderBody(root)
    : params.exerciseId ? () => renderExercise(root, params.exerciseId)
    : () => renderOverview(root);
  // экран перерисовывается при изменении данных (но не пока открыта шторка — иначе сбросим ввод)
  const off = store.on((kind) => { if ((kind === 'body' || kind === 'workouts') && !document.querySelector('#sheet-root .sheet')) rerender(); });
  repaint = rerender;
  rerender();
  return () => { off(); repaint = null; };
}

let repaint = null;   // перерисовка текущего экрана (шторка закрывается уже после события store)

// ---------- общие помощники ----------
const WEEK_TARGETS = [ // прямые рабочие подходы в неделю (research/progression.md, п. 4.1; пресс — п. 5)
  ['abs', 9, 15, true], ['chest', 6, 12], ['back', 8, 14], ['quads', 6, 12], ['hamstrings', 6, 12], ['glutes', 6, 12],
  ['shoulders', 4, 10], ['biceps', 2, 8], ['triceps', 2, 8], ['calves', 4, 8], ['lower_back', 2, 6],
];
const signed = (n, d = 1) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmtNum(Math.abs(n), d);
const kgStr = (v) => fmtNum(v, 1) + ' кг';
const fmtT = (sec) => (sec < 90 ? `${Math.round(sec)} с` : fmtSec(Math.round(sec)));
const axisNum = (v) => fmtNum(v, Math.abs(v) >= 100 ? 0 : 1);
const work = (e) => { const w = e.sets.filter((s) => s.kind !== 'warmup'); return w.length ? w : e.sets; };
const sum = (arr, f) => arr.reduce((a, x) => a + (f(x) || 0), 0);
function maxBy(arr, f) {
  let b = null, bv = -Infinity;
  for (const x of arr) { const v = f(x); if (v != null && v > bv) { bv = v; b = x; } }
  return b ? { item: b, v: bv } : null;
}
const isoDay = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function seg(items, value, onChange, cls = '') {
  const el = h('div', { class: 'seg ' + cls }, items.map(([k, label]) =>
    h('button', { class: k === value ? 'on' : '', 'data-k': k, onclick: () => {
      el.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      onChange(k);
    } }, label)));
  return el;
}
function chips(items, value, onChange) {
  const el = h('div', { class: 'chips scroll' }, items.map(([k, label]) =>
    h('button', { class: 'chip' + (k === value ? ' on' : ''), 'data-k': k, onclick: () => {
      el.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
      onChange(k);
    } }, label)));
  return el;
}
function inPeriod(points, period, now = Date.now()) {
  if (period === 'all') return points;
  return points.filter((p) => p.t >= now - (period === '1m' ? 30 : 90) * DAY);
}
const PERIODS = [['1m', '1 мес'], ['3m', '3 мес'], ['all', 'Всё']];

// ---------- типы упражнений ----------
function fmtSet(s, type) {
  if (type === 'time') return fmtT(s.timeSec ?? 0);
  if (type === 'cardio') return `${fmtNum((s.timeSec || 0) / 60, 1)} мин${s.distance ? ' · ' + fmtNum(s.distance) + ' км' : ''}`;
  if (type === 'bw_reps') return s.weight ? `+${fmtNum(s.weight)}×${s.reps}` : `${s.reps}`;
  if (type === 'assisted') return s.weight ? `−${fmtNum(s.weight)}×${s.reps}` : `${s.reps}`;
  return `${fmtNum(s.weight)}×${s.reps ?? '—'}`;
}
/** Метрики для графика: pick(entry) → { v, detail } | null */
function modesFor(type, entries) {
  const reps = (e) => { const r = maxBy(work(e), (s) => s.reps); return r && { v: r.v, detail: fmtSet(r.item, type) }; };
  const totalReps = (e) => { const v = sum(work(e), (s) => s.reps); return v ? { v, detail: `${work(e).length} подх.` } : null; };
  const repsFmt = (v) => `${fmtNum(v, 0)} повт.`;
  if (type === 'bw_reps' || type === 'assisted') {
    const m = [{ key: 'reps', label: 'Повторы', fmt: repsFmt, axis: axisNum, pick: reps }];
    if (type === 'bw_reps') m.push({ key: 'load', label: 'Доп. вес', fmt: (v) => '+' + kgStr(v), axis: axisNum, pick: (e) => { const r = maxBy(work(e), (s) => (s.weight > 0 ? s.weight : null)); return r && { v: r.v, detail: fmtSet(r.item, type) }; } });
    else m.push({ key: 'assist', label: 'Помощь', fmt: kgStr, axis: axisNum, lowerBetter: true, pick: (e) => { const r = maxBy(work(e), (s) => (s.weight > 0 ? -s.weight : null)); return r && { v: -r.v, detail: fmtSet(r.item, type) }; } });
    m.push({ key: 'volume', label: 'Объём', fmt: repsFmt, axis: axisNum, pick: totalReps });
    return m.filter((x) => entries.some((e) => x.pick(e)));
  }
  if (type === 'time') return [
    { key: 'best', label: 'Лучшее время', fmt: fmtT, axis: fmtT, pick: (e) => { const r = maxBy(work(e), (s) => s.timeSec); return r && { v: r.v, detail: fmtT(r.v) }; } },
    { key: 'total', label: 'Суммарно', fmt: fmtT, axis: fmtT, pick: (e) => { const v = sum(work(e), (s) => s.timeSec); return v ? { v, detail: `${work(e).length} подх.` } : null; } },
  ];
  if (type === 'cardio') return [
    { key: 'time', label: 'Время', fmt: (v) => `${fmtNum(v, 0)} мин`, axis: axisNum, pick: (e) => { const v = sum(work(e), (s) => s.timeSec) / 60; return v ? { v, detail: '' } : null; } },
    { key: 'dist', label: 'Дистанция', fmt: (v) => `${fmtNum(v, 2)} км`, axis: axisNum, pick: (e) => { const v = sum(work(e), (s) => s.distance); return v ? { v, detail: '' } : null; } },
  ].filter((x) => entries.some((e) => x.pick(e)));
  return [
    { key: 'e1rm', label: '1ПМ', fmt: kgStr, axis: axisNum, pick: (e) => { const r = maxBy(work(e), (s) => e1rm(s.weight, s.reps)); return r && { v: r.v, detail: 'по ' + fmtSet(r.item, type) }; } },
    { key: 'weight', label: 'Макс. вес', fmt: kgStr, axis: axisNum, pick: (e) => { const r = maxBy(work(e), (s) => (s.weight > 0 ? s.weight + (s.reps || 0) / 1000 : null)); return r && { v: r.item.weight, detail: fmtSet(r.item, type) }; } },
    { key: 'volume', label: 'Объём', fmt: (v) => `${fmtNum(v, 0)} кг`, axis: axisNum, pick: (e) => { const v = sum(work(e), (s) => (s.weight || 0) * (s.reps || 0)); return v ? { v, detail: `${work(e).length} подх.` } : null; } },
  ];
}
/** Ключевая метрика для рекордов на обзоре */
function keyMode(type) {
  if (type === 'cardio') return null;
  const modes = modesFor(type, [{ sets: [{ weight: 1, reps: 1, timeSec: 1, distance: 1 }] }]);
  return type === 'bw_reps' || type === 'assisted' ? modes.find((x) => x.key === 'reps') : modes[0];
}

// ======================================================================
//  ОБЗОР
// ======================================================================
function weightSeries() {
  return store.list('body').filter((b) => b.weight).sort((a, b) => a.date - b.date);
}
function movingAvg(list, days = 7) {
  return list.map((b) => {
    const win = list.filter((x) => x.date <= b.date && x.date > b.date - days * DAY);
    return { t: b.date, y: win.reduce((a, x) => a + x.weight, 0) / win.length, raw: b.weight };
  });
}

function renderOverview(root) {
  const now = Date.now();
  const goal = store.settings().profile?.goalWeight;
  const hist = store.history();

  // --- вес тела
  const ws = weightSeries();
  let bodyCard;
  if (!ws.length) {
    bodyCard = h('div', { class: 'card', style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      h('div', { class: 'lbl muted' }, 'Вес тела'),
      h('div', { class: 'muted' }, 'Записей пока нет. Взвешивайся раз в день утром — тренд считается по скользящему среднему.'),
      h('button', { class: 'btn primary block', onclick: () => bodySheet() }, icon('plus'), 'Записать вес'));
  } else {
    const last = ws[ws.length - 1];
    let ref = [...ws].reverse().find((b) => b.date <= now - 28 * DAY);
    if (!ref && last.date - ws[0].date >= 7 * DAY) ref = ws[0];
    const diff = ref ? last.weight - ref.weight : null;
    const startW = ws[0].weight;
    let goalBlock = null;
    if (goal) {
      const total = startW - goal;
      const done = total > 0 ? Math.max(0, Math.min(1, (startW - last.weight) / total)) : 1;
      const left = last.weight - goal;
      goalBlock = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
        h('div', { class: 'meter', role: 'progressbar', 'aria-valuenow': Math.round(done * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 },
          h('i', { style: { width: Math.round(done * 100) + '%' } })),
        h('div', { class: 'meter-cap' },
          h('span', null, `старт ${fmtNum(startW, 1)}`),
          h('span', { class: left <= 0 ? 'good-t' : '' }, left <= 0 ? 'цель достигнута' : `осталось ${fmtNum(left, 1)} кг`),
          h('span', null, `цель ${fmtNum(goal, 1)}`)));
    }
    const pts = movingAvg(ws).filter((p) => p.t >= now - 90 * DAY);
    bodyCard = h('a', { class: 'card pg-hero', href: '#/body' },
      h('div', { class: 'top' },
        h('div', null, h('div', { class: 'lbl' }, 'Вес тела'),
          h('div', { class: 'big' }, fmtNum(last.weight, 1), h('small', null, 'кг'))),
        h('div', { class: 'delta' },
          diff == null ? h('span', { class: 'muted-t' }, fmtDate(last.date))
            : h('span', { class: diff < 0 ? 'good-t' : diff > 0 ? 'warn-t' : 'muted-t' }, `${signed(diff, 1)} кг`),
          h('div', { class: 'muted-t', style: { fontWeight: 600 } }, diff == null ? 'последняя запись' : 'за 4 недели'))),
      pts.length > 1 ? lineChart({
        mini: true, height: 64, ariaLabel: 'Вес тела за 3 месяца',
        series: [{ points: pts.map((p) => ({ t: p.t, y: p.raw })), line: true, dots: 'none', width: 1.5, opacity: 0.45, marker: false },
          { points: pts.map((p) => ({ t: p.t, y: p.y })), color: 'var(--accent)', area: true, dots: 'last' }],
      }) : null,
      goalBlock);
  }

  // --- подходы по группам за неделю
  const wk = startOfWeek(now);
  const counts = {};
  for (const w of hist) {
    if (w.startedAt < wk) continue;
    for (const it of w.items) {
      const m = store.exercise(it.exerciseId)?.muscle;
      if (!m) continue;
      counts[m] = (counts[m] || 0) + it.sets.filter((s) => s.done && s.kind !== 'warmup').length;
    }
  }
  const volRows = WEEK_TARGETS.map(([m, lo, hi, prio]) => {
    const c = counts[m] || 0;
    const scale = Math.max(hi * 1.3, c);
    const cls = c < lo ? '' : c <= hi ? 'ok' : 'hi';
    return h('div', { class: 'vol-row' },
      h('div', { class: 'n' + (prio ? ' prio' : ''), title: MUSCLES[m] }, MUSCLES[m]),
      h('div', { class: 'vol-bar', role: 'img', 'aria-label': `${MUSCLES[m]}: ${c} из ${lo}–${hi}` },
        h('div', { class: 'zone', style: { left: (lo / scale * 100) + '%', width: ((hi - lo) / scale * 100) + '%' } }),
        h('div', { class: 'fill ' + cls, style: { width: (c / scale * 100) + '%' } })),
      h('div', { class: 'v' }, `${c} / ${lo}–${hi}`));
  });

  // --- упражнения и рекорды
  const ids = new Set();
  for (const w of hist) for (const it of w.items) if (it.sets.some((s) => s.done)) ids.add(it.exerciseId);
  const exList = [...ids].map((id) => {
    const entries = store.exerciseHistory(id);
    const ex = store.exercise(id);
    return { id, ex, entries, name: store.exerciseName(id), type: ex?.type || 'weight_reps' };
  }).filter((x) => x.entries.length).sort((a, b) => b.entries[0].workout.startedAt - a.entries[0].workout.startedAt);

  const prs = [];
  for (const x of exList) {
    const m = keyMode(x.type);
    if (!m) continue;
    const chrono = [...x.entries].reverse();
    let best = null, ev = null;
    chrono.forEach((e, i) => {
      const r = m.pick(e);
      if (!r) return;
      if (best != null && r.v > best + 1e-9) ev = { x, m, t: e.workout.startedAt, v: r.v, prev: best };
      if (best == null || r.v > best) best = r.v;
      void i;
    });
    if (ev) prs.push(ev);
  }
  prs.sort((a, b) => b.t - a.t);

  const prBlock = prs.length
    ? h('div', { class: 'list' }, prs.slice(0, 5).map((p) => h('a', { class: 'row pr-row', href: `#/exercise/${p.x.id}` },
      h('div', { class: 'ico' }, icon('trophy')),
      h('div', { class: 'grow' }, h('div', { class: 'title ellipsis' }, p.x.name),
        h('div', { class: 'meta' }, `${p.m.key === 'e1rm' ? '1ПМ' : p.m.label} · ${fmtDate(p.t)}`)),
      h('div', { class: 'val' }, p.m.fmt(p.v), h('small', null, p.m.key === 'e1rm' || p.m.key === 'load' ? `${signed(p.v - p.prev, 1)} кг` : p.m.key === 'reps' ? `${signed(p.v - p.prev, 0)}` : `+${p.m.fmt(p.v - p.prev)}`)))))
    : h('div', { class: 'card muted', style: { fontSize: '14px' } }, 'Рекорды появятся, когда один и тот же результат будет побит — нужно хотя бы две тренировки с упражнением.');

  const listBox = h('div', { class: 'list ex-pick' });
  const q = h('input', { class: 'input', placeholder: 'Найти упражнение', type: 'search', 'aria-label': 'Поиск упражнения', oninput: paintList });
  function lastResult(x) {
    const best = maxBy(work(x.entries[0]), (s) => (s.weight || 0) * 1000 + (s.reps || 0) + (s.timeSec || 0) + (s.distance || 0));
    return best ? fmtSet(best.item, x.type) : '';
  }
  function paintList() {
    const t = q.value.trim().toLowerCase();
    const rows = exList.filter((x) => !t || x.name.toLowerCase().includes(t) || (x.ex?.aliases || []).some((a) => a.toLowerCase().includes(t)));
    listBox.replaceChildren(...(rows.length ? rows.map((x) => h('a', { class: 'row', href: `#/exercise/${x.id}` },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, x.name),
        h('div', { class: 'meta' }, `${x.ex ? MUSCLES[x.ex.muscle] : '—'} · ${x.entries.length} ${plural(x.entries.length, 'тренировка', 'тренировки', 'тренировок')}`)),
      h('div', { class: 'rt' }, h('div', { style: { color: 'var(--fg)', fontWeight: 700 } }, lastResult(x)), h('div', null, fmtDate(x.entries[0].workout.startedAt))),
      icon('chev', 'chev')))
      : [h('div', { class: 'row muted' }, 'Ничего не найдено')]));
  }
  paintList();

  put(root, 
    topbar({ title: 'Прогресс', sub: hist.length ? `${hist.length} ${plural(hist.length, 'тренировка', 'тренировки', 'тренировок')} всего` : 'Пока без тренировок' }),
    bodyCard,
    h('div', { class: 'h2' }, 'Подходы за неделю', h('span', { class: 'muted', style: { textTransform: 'none', letterSpacing: 0, fontWeight: 600 } }, 'с понедельника')),
    h('div', { class: 'card vol' }, volRows,
      h('div', { class: 'vol-note' }, 'Прямые рабочие подходы без разминки. Зелёная зона — целевой диапазон для набора мышц в дефиците калорий. Пресс — приоритет.')),
    h('div', { class: 'h2' }, 'Последние рекорды'),
    prBlock,
    h('div', { class: 'h2' }, 'Упражнения'),
    exList.length ? h('div', { class: 'search' }, icon('search'), q) : null,
    exList.length ? listBox : empty('Пока пусто', 'Здесь появятся упражнения, которые ты делал.'));
}

// ======================================================================
//  УПРАЖНЕНИЕ
// ======================================================================
function renderExercise(root, id) {
  const ex = store.exercise(id);
  const entries = store.exerciseHistory(id);     // новые сверху
  const name = ex?.name || store.exerciseName(id);
  const type = ex?.type || 'weight_reps';
  const bar = topbar({ title: name, back: '#/progress', sub: ex ? `${MUSCLES[ex.muscle] || ''} · ${EQUIPMENT[ex.equipment] || ''}` : '' });
  if (!entries.length) {
    put(root, bar, empty('Нет данных', 'Это упражнение ещё не выполнялось. Заверши тренировку с ним — здесь появятся график и рекорды.'));
    return;
  }
  const modes = modesFor(type, entries);
  let tab = 'chart', mode = modes[0]?.key, period = '3m', shown = 30;
  const body = h('div', { class: 'tabs-gap' });

  const tabs = seg([['chart', 'График'], ['records', 'Рекорды'], ['history', 'История']], tab, (k) => { tab = k; paint(); });
  put(root, bar, tabs, body);

  function paint() {
    body.replaceChildren();
    if (tab === 'chart') paintChart();
    else if (tab === 'records') paintRecords();
    else paintHistory();
  }

  function paintChart() {
    if (!modes.length) { add(body, empty('Нет данных для графика', 'В подходах нет значений нужной метрики.')); return; }
    const box = h('div', { class: 'card' });
    const kpi = h('div', { class: 'kpis' });
    const draw = () => {
      const m = modes.find((x) => x.key === mode) || modes[0];
      const allPts = [...entries].reverse().map((e) => { const r = m.pick(e); return r && { t: e.workout.startedAt, y: r.v, tip: [m.fmt(r.v), r.detail || null].filter(Boolean).concat([e.workout.name]) , detail: r.detail }; }).filter(Boolean);
      const pts = inPeriod(allPts, period);
      const better = (a, b) => (m.lowerBetter ? a < b : a > b);
      kpi.replaceChildren();
      box.replaceChildren();
      if (!pts.length) {
        add(box, empty('Нет тренировок за период', 'Выбери «3 мес» или «Всё».'));
        return;
      }
      const lastP = pts[pts.length - 1], firstP = pts[0];
      const bestV = allPts.reduce((b, p) => (b == null || better(p.y, b) ? p.y : b), null);
      const dv = lastP.y - firstP.y;
      const good = m.lowerBetter ? dv < 0 : dv > 0;
      add(kpi, 
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'Сейчас'), h('div', { class: 'v' }, m.fmt(lastP.y))),
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'Лучшее'), h('div', { class: 'v' }, m.fmt(bestV))),
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'За период'),
          pts.length > 1 ? h('div', { class: 'v ' + (dv === 0 ? '' : good ? 'good-t' : 'warn-t') }, (dv > 0 ? '+' : dv < 0 ? '−' : '') + m.fmt(Math.abs(dv)))
            : h('div', { class: 'v muted-t' }, '—')));
      add(box, lineChart({
        height: 230, ariaLabel: `${name}: ${m.label}`, fmtY: m.axis,
        series: [{ points: pts, color: 'var(--accent)', area: true, dots: pts.length > 24 ? 'last' : 'all', hit: true }],
      }));
    };
    add(body, 
      modes.length > 1 ? chips(modes.map((m) => [m.key, m.label]), mode, (k) => { mode = k; draw(); }) : null,
      seg(PERIODS, period, (k) => { period = k; draw(); }, 'sm'),
      kpi, box,
      type === 'weight_reps' && mode === 'e1rm' ? h('div', { class: 'cap-note' }, 'Расчётный 1ПМ по формуле Эпли, лучший подход тренировки. Подходы больше 12 повторов не считаются.') : null);
    draw();
  }

  function paintRecords() {
    const cards = recordCards(type, entries);
    add(body, h('div', { class: 'rec-grid' }, cards.map((c, i) => h('div', { class: 'rec' + (c.wide ? ' wide' : '') + (i === 0 ? ' best' : '') },
      h('div', { class: 'l' }, c.l), h('div', { class: 'v' }, c.v), h('div', { class: 's' }, c.s)))));
    if (type === 'weight_reps') {
      const sets = entries.flatMap((e) => work(e).map((s) => ({ s, e })));
      const rows = [1, 3, 5, 8, 10].map((n) => {
        const r = maxBy(sets.filter((x) => x.s.reps >= n && x.s.weight > 0), (x) => x.s.weight + x.s.reps / 1000);
        return h('div', { class: 'rm-row' },
          h('div', { class: 'k' }, `${n} повт.`),
          h('div', { class: 'grow' }, r ? `${kgStr(r.item.s.weight)} × ${r.item.s.reps}` : h('span', { class: 'muted' }, '—')),
          h('div', { class: 'd' }, r ? fmtDate(r.item.e.workout.startedAt) : ''));
      });
      add(body, h('div', { class: 'h2' }, 'Лучшее на N повторов'), h('div', { class: 'list' }, rows),
        h('div', { class: 'cap-note' }, 'Максимальный вес, с которым сделано не меньше N повторов.'));
    }
  }

  function paintHistory() {
    const list = entries.slice(0, shown);
    const best = type === 'weight_reps' ? maxBy(entries.flatMap((e) => work(e).map((s) => ({ s, e }))), (x) => e1rm(x.s.weight, x.s.reps)) : null;
    add(body, ...list.map((e) => h('a', { class: 'hist-card', href: `#/history/${e.workout.id}` },
      h('div', { class: 'hd' }, h('b', null, fmtDate(e.workout.startedAt, { year: true })), h('span', { class: 'ellipsis' }, e.workout.name)),
      h('div', { class: 'hist-sets' }, e.sets.map((s) => h('span', { class: 'chip' + (s.kind === 'warmup' ? ' wu' : '') + (best && best.item.s === s ? ' pr' : ''), title: s.kind === 'warmup' ? 'разминка' : '' }, fmtSet(s, type)))))));
    if (entries.length > shown) add(body, h('button', { class: 'btn block', onclick: () => { shown += 30; paint(); } }, 'Показать ещё'));
  }
  paint();
}

function recordCards(type, entries) {
  const date = (e) => fmtDate(e.workout.startedAt, { year: true });
  const sets = entries.flatMap((e) => work(e).map((s) => ({ s, e })));
  const out = [];
  const add = (l, r, fmtV, sub, wide) => { if (r) out.push({ l, v: fmtV(r), s: sub(r), wide }); };
  const setSub = (r) => `${fmtSet(r.item.s, type)} · ${date(r.item.e)}`;
  const totalSub = (r) => date(r.item);
  if (type === 'weight_reps') {
    add('Лучший 1ПМ', maxBy(sets, (x) => e1rm(x.s.weight, x.s.reps)), (r) => kgStr(r.v), setSub);
    add('Макс. вес', maxBy(sets, (x) => (x.s.weight > 0 ? x.s.weight + (x.s.reps || 0) / 1000 : null)), (r) => kgStr(r.item.s.weight), setSub);
    add('Макс. повторы', maxBy(sets, (x) => (x.s.reps ? x.s.reps + (x.s.weight || 0) / 10000 : null)), (r) => `${r.item.s.reps} повт.`, setSub);
    add('Объём за подход', maxBy(sets, (x) => (x.s.weight || 0) * (x.s.reps || 0) || null), (r) => `${fmtNum(r.v, 0)} кг`, setSub);
    add('Объём за тренировку', maxBy(entries, (e) => sum(work(e), (s) => (s.weight || 0) * (s.reps || 0)) || null), (r) => `${fmtNum(r.v, 0)} кг`, totalSub);
  } else if (type === 'bw_reps' || type === 'assisted') {
    add('Макс. повторы', maxBy(sets, (x) => (x.s.reps ? x.s.reps + (x.s.weight || 0) / 10000 : null)), (r) => `${r.item.s.reps} повт.`, setSub);
    if (type === 'bw_reps') add('Макс. доп. вес', maxBy(sets, (x) => (x.s.weight > 0 ? x.s.weight + (x.s.reps || 0) / 1000 : null)), (r) => '+' + kgStr(r.item.s.weight), setSub);
    else add('Меньше всего помощи', maxBy(sets, (x) => (x.s.weight > 0 ? -x.s.weight + (x.s.reps || 0) / 1000 : null)), (r) => kgStr(r.item.s.weight), setSub);
    add('Повторов за тренировку', maxBy(entries, (e) => sum(work(e), (s) => s.reps) || null), (r) => `${fmtNum(r.v, 0)}`, totalSub);
    add('Подходов за тренировку', maxBy(entries, (e) => work(e).length), (r) => `${r.v}`, totalSub);
  } else if (type === 'time') {
    add('Дольше всего', maxBy(sets, (x) => x.s.timeSec), (r) => fmtT(r.v), setSub);
    add('Суммарно за тренировку', maxBy(entries, (e) => sum(work(e), (s) => s.timeSec) || null), (r) => fmtT(r.v), totalSub);
  } else {
    add('Дольше всего', maxBy(sets, (x) => x.s.timeSec), (r) => `${fmtNum(r.v / 60, 1)} мин`, setSub);
    add('Дальше всего', maxBy(sets, (x) => x.s.distance), (r) => `${fmtNum(r.v, 2)} км`, setSub);
    add('Время за тренировку', maxBy(entries, (e) => sum(work(e), (s) => s.timeSec) || null), (r) => `${fmtNum(r.v / 60, 0)} мин`, totalSub);
  }
  if (out.length % 2 === 1) out[out.length - 1].wide = true;
  return out;
}

// ======================================================================
//  ВЕС И ЗАМЕРЫ
// ======================================================================
const BODY_FIELDS = [['weight', 'Вес', 'кг'], ['waist', 'Талия', 'см'], ['chest', 'Грудь', 'см'], ['hips', 'Бёдра', 'см'], ['arm', 'Рука', 'см'], ['thigh', 'Бедро', 'см']];

function renderBody(root) {
  const goal = store.settings().profile?.goalWeight;
  const all = store.list('body').sort((a, b) => a.date - b.date);
  let metric = 'weight', period = '3m';

  const addBtn = h('button', { class: 'icon-btn', 'aria-label': 'Добавить запись', onclick: () => bodySheet() }, icon('plus'));
  const bar = topbar({ title: 'Вес и замеры', back: '#/progress', right: addBtn });
  if (!all.length) {
    put(root, bar, empty('Записей пока нет', 'Добавь вес или замеры — график и тренд появятся здесь.',
      h('button', { class: 'btn primary', onclick: () => bodySheet() }, icon('plus'), 'Добавить запись')));
    return;
  }

  const kpi = h('div', { class: 'kpis' });
  const box = h('div', { class: 'card' });
  const latest = (k) => [...all].reverse().find((b) => b[k] != null);

  function draw() {
    const def = BODY_FIELDS.find((f) => f[0] === metric);
    const list = all.filter((b) => b[metric] != null);
    kpi.replaceChildren(); box.replaceChildren();
    if (!list.length) { add(box, empty('Нет записей', `Для «${def[1]}» пока нет измерений.`)); return; }
    const isW = metric === 'weight';
    const ma = isW ? movingAvg(list) : null;
    const inP = (arr) => inPeriod(arr, period);
    const raw = inP(list.map((b, i) => ({
      t: b.date, y: b[metric],
      tip: [`${fmtNum(b[metric], 1)} ${def[2]}`, isW ? `среднее 7 дн.: ${fmtNum(ma[i].y, 1)}` : null].filter(Boolean),
    })));
    const lastV = list[list.length - 1][metric];
    const prev = list.length > 1 ? list[list.length - 2][metric] : null;
    if (isW) {
      const left = goal ? lastV - goal : null;
      add(kpi, 
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'Сейчас'), h('div', { class: 'v' }, kgStr(lastV)), prev != null ? h('div', { class: 'd ' + (lastV < prev ? 'good-t' : lastV > prev ? 'warn-t' : 'muted-t') }, `${signed(lastV - prev, 1)} кг`) : null),
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'Среднее 7 дн.'), h('div', { class: 'v' }, kgStr(ma[ma.length - 1].y))),
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'До цели'), h('div', { class: 'v ' + (left != null && left <= 0 ? 'good-t' : '') }, left == null ? '—' : left <= 0 ? 'готово' : kgStr(left))));
    } else {
      const first = list[0][metric];
      add(kpi, 
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'Сейчас'), h('div', { class: 'v' }, `${fmtNum(lastV, 1)} см`)),
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'Изменение'), h('div', { class: 'v' }, list.length > 1 ? `${signed(lastV - first, 1)} см` : '—')),
        h('div', { class: 'kpi' }, h('div', { class: 'l' }, 'Записей'), h('div', { class: 'v' }, String(list.length))));
    }
    if (!raw.length) { add(box, empty('Нет записей за период', 'Выбери «3 мес» или «Всё».')); return; }
    const series = [];
    if (isW) {
      const maPts = inP(ma.map((p) => ({ t: p.t, y: p.y })));
      series.push({ points: raw, color: 'var(--faint)', line: false, dots: 'all', dotR: 2.5, hit: true, marker: false });
      series.push({ points: maPts, color: 'var(--accent)', width: 2.5, dots: 'last', area: true });
    } else {
      series.push({ points: raw, color: 'var(--accent)', dots: 'all', area: true, hit: true });
    }
    add(box, lineChart({
      height: 240, ariaLabel: `${def[1]}, ${def[2]}`, fmtY: (v) => fmtNum(v, 1), series,
      refLines: isW && goal ? [{ y: goal, label: `цель ${fmtNum(goal, 1)}`, color: 'var(--good)' }] : [],
    }));
    if (isW) add(box, h('div', { class: 'cap-note', style: { marginTop: '6px' } }, 'Серые точки — взвешивания, синяя линия — скользящее среднее за 7 дней.'));
  }

  const rows = [...all].reverse().map((b) => {
    const parts = BODY_FIELDS.filter((f) => b[f[0]] != null && f[0] !== 'weight').map((f) => `${f[1].toLowerCase()} ${fmtNum(b[f[0]], 1)}`);
    return h('div', { class: 'row body-row', role: 'button', tabindex: 0, onclick: () => bodySheet(b), onkeydown: (e) => { if (e.key === 'Enter') bodySheet(b); } },
      h('div', { class: 'grow' },
        h('div', { class: 't' }, b.weight != null ? kgStr(b.weight) : 'Замеры'),
        h('div', { class: 'm' }, [fmtDate(b.date, { year: true }), ...parts].join(' · '))),
      h('button', { class: 'icon-btn', 'aria-label': 'Удалить запись', onclick: (ev) => { ev.stopPropagation(); delBody(b); } }, icon('trash')));
  });

  const hasMeasures = BODY_FIELDS.slice(1).some((f) => latest(f[0]));
  put(root, bar,
    chips(BODY_FIELDS.filter((f) => f[0] === 'weight' || latest(f[0])).map((f) => [f[0], f[1]]), metric, (k) => { metric = k; draw(); }),
    seg(PERIODS, period, (k) => { period = k; draw(); }, 'sm'),
    kpi, box,
    !hasMeasures ? h('div', { class: 'cap-note' }, 'Талию замеряй на уровне пупка раз в 1–2 недели: если вес стоит, а талия уменьшается — всё идёт по плану.') : null,
    h('div', { class: 'h2' }, 'Записи', h('button', { onclick: () => bodySheet() }, '+ Добавить')),
    h('div', { class: 'list' }, rows));
  draw();
}

async function delBody(b) {
  const ok = await confirmSheet({ title: 'Удалить запись?', text: `${fmtDate(b.date, { year: true })}${b.weight != null ? ' · ' + kgStr(b.weight) : ''}. Отменить будет нельзя.`, ok: 'Удалить', danger: true });
  if (!ok) return;
  await store.remove('body', b.id);
  toast('Запись удалена');
}

/** Шторка добавления/правки записи веса и замеров */
function bodySheet(existing = null) {
  const lastW = weightSeries().slice(-1)[0];
  const today = isoDay(Date.now());
  const date = h('input', { class: 'input', type: 'date', value: existing ? isoDay(existing.date) : today, max: today, 'aria-label': 'Дата' });
  const inputs = {};
  const fields = BODY_FIELDS.map(([k, label, unit]) => {
    const prev = k === 'weight' ? lastW?.weight : [...store.list('body')].sort((a, b) => b.date - a.date).find((b) => b[k] != null)?.[k];
    inputs[k] = h('input', { class: 'input', inputmode: 'decimal', placeholder: prev != null ? fmtNum(prev, 1) : '—', value: existing?.[k] != null ? fmtNum(existing[k], 1) : '', id: 'bf-' + k, enterkeyhint: 'done' });
    return h('div', { class: 'field' + (k === 'weight' ? ' full' : '') }, h('label', { for: 'bf-' + k }, `${label}, ${unit}`), inputs[k]);
  });
  sheet({
    title: existing ? 'Править запись' : 'Вес и замеры',
    content: (close) => {
      const save = async () => {
        const vals = {};
        for (const [k] of BODY_FIELDS) {
          const raw = inputs[k].value;
          const n = parseNum(raw);
          if (raw.trim() !== '' && (n == null || n <= 0)) { toast('Проверь число в поле «' + BODY_FIELDS.find((f) => f[0] === k)[1] + '»'); inputs[k].focus(); return; }
          vals[k] = n;
        }
        if (BODY_FIELDS.every(([k]) => vals[k] == null)) { toast('Заполни хотя бы одно поле'); return; }
        const [y, m, d] = (date.value || today).split('-').map(Number);
        let ts;
        if (existing && isoDay(existing.date) === date.value) ts = existing.date;
        else if (date.value === today) ts = Date.now();
        else ts = new Date(y, m - 1, d, 12).getTime();
        const obj = existing ? { ...existing } : {};
        obj.date = ts;
        for (const [k] of BODY_FIELDS) { if (vals[k] == null) delete obj[k]; else obj[k] = vals[k]; }
        await store.save('body', obj);
        close();
        toast(existing ? 'Запись обновлена' : 'Записано');
        repaint?.();
      };
      setTimeout(() => inputs.weight.focus(), 80);
      return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h('div', { class: 'field' }, h('label', null, 'Дата'), date),
        h('div', { class: 'form-grid' }, fields),
        h('div', { class: 'cap-note' }, 'Все поля необязательны. Серым показано прошлое значение.'),
        h('button', { class: 'btn primary block lg', onclick: save }, 'Сохранить'));
    },
  });
}

/** replaceChildren без «null» в тексте: пропускаем пустые значения */
function put(el, ...nodes) { el.replaceChildren(...nodes.flat().filter((n) => n != null && n !== false)); }
function add(el, ...nodes) { el.append(...nodes.flat().filter((n) => n != null && n !== false)); }
