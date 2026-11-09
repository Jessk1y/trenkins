// Экран «История»: календарь, список по неделям, детали и редактирование тренировки.
import { h, icon, toast, empty, topbar, sheet, actionMenu, confirmSheet, promptSheet, loadCss } from '../core/ui.js';
import { store } from '../core/store.js';
import { fmtDate, fmtDateLong, fmtTime, fmtDuration, fmtDurationWords, fmtTonnage, fmtNum, parseNum, plural, e1rm, startOfDay, startOfWeek, DAY } from '../core/util.js';
import { summarize, templateFromWorkout, startWorkout } from '../core/workout.js';
import { fmtSetShort } from './workout.js';
import { navigate } from '../router.js';

const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
let calMonth = null;   // { y, m }
let selDay = null;     // startOfDay выбранного дня

const typeOf = (id) => store.exercise(id)?.type || 'weight_reps';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** PR: workoutId → Map(setId → ['вес','1ПМ']). Сравнение со всеми более ранними тренировками. */
function computePRs() {
  const res = new Map();
  const best = new Map(); // exerciseId → { w, e }
  for (const w of [...store.history()].reverse()) {
    const m = new Map();
    for (const it of w.items) {
      const t = typeOf(it.exerciseId);
      if (t !== 'weight_reps' && t !== 'bw_reps') continue;
      const prev = best.get(it.exerciseId);
      const cur = prev ? { ...prev } : { w: 0, e: 0 };
      let bw = null, be = null;
      for (const s of it.sets) {
        if (!s.done || s.kind === 'warmup' || !s.weight || !s.reps) continue;
        if (!bw || s.weight > bw.weight) bw = s;
        const e = e1rm(s.weight, s.reps);
        if (e && (!be || e > be.e)) be = { s, e };
      }
      if (prev) {
        if (bw && bw.weight > prev.w + 1e-9) m.set(bw.id, [...(m.get(bw.id) || []), 'вес']);
        if (be && be.e > prev.e + 1e-9) m.set(be.s.id, [...(m.get(be.s.id) || []), '1ПМ']);
      }
      if (bw) cur.w = Math.max(cur.w, bw.weight);
      if (be) cur.e = Math.max(cur.e, be.e);
      best.set(it.exerciseId, cur);
    }
    if (m.size) res.set(w.id, m);
  }
  return res;
}

export function render(root, params = {}) {
  loadCss('css/views/history.css');
  const unsub = store.on((kind) => { if (kind === 'workouts' || kind === '*') draw(); });
  let editing = false;
  const show = (...n) => root.replaceChildren(...n.filter(Boolean));
  draw();
  return () => unsub();

  function draw() {
    const a = document.activeElement;
    if (a && root.contains(a) && a.tagName === 'INPUT') return; // не перерисовываем при вводе
    if (params.workoutId) drawDetail(); else drawList();
  }

  // ---------- Список ----------
  function drawList() {
    const all = store.history();
    if (!all.length) {
      root.replaceChildren(topbar({ title: 'История' }),
        empty('Тренировок пока нет', 'Завершённые тренировки появятся здесь — с календарём, тоннажем и рекордами.',
          h('a', { class: 'btn primary', href: '#/' }, 'К тренировке')));
      return;
    }
    const prs = computePRs();
    if (!calMonth) { const n = new Date(); calMonth = { y: n.getFullYear(), m: n.getMonth() }; }
    const list = selDay == null ? all : all.filter((w) => startOfDay(w.startedAt) === selDay);

    const groups = new Map();
    for (const w of list) {
      const k = startOfWeek(w.startedAt);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(w);
    }
    const nodes = [];
    for (const [ws, items] of groups) {
      const vol = items.reduce((a, w) => a + summarize(w).volume, 0);
      nodes.push(h('div', { class: 'hist-week' }, h('span', null, weekLabel(ws)), h('span', { style: { textTransform: 'none', letterSpacing: 0 } },
        `${items.length} ${plural(items.length, 'тренировка', 'тренировки', 'тренировок')} · ${fmtTonnage(vol)}`)));
      nodes.push(h('div', { class: 'list' }, items.map((w) => row(w, prs.get(w.id)))));
    }
    show(
      topbar({ title: 'История', sub: `${all.length} ${plural(all.length, 'тренировка', 'тренировки', 'тренировок')}` }),
      calendar(all),
      selDay != null ? h('div', { class: 'chips' }, h('button', { class: 'chip accent', onclick: () => { selDay = null; draw(); } }, fmtDate(selDay, { year: true }), icon('close'))) : null,
      ...nodes);
  }

  function weekLabel(ws) {
    const cur = startOfWeek(Date.now());
    if (ws === cur) return 'Эта неделя';
    if (ws === cur - 7 * DAY) return 'Прошлая неделя';
    return `${fmtDate(ws)} – ${fmtDate(ws + 6 * DAY)}`;
  }

  function row(w, prMap) {
    const s = summarize(w);
    const names = w.items.filter((it) => it.sets.some((x) => x.done)).map((it) => store.exerciseName(it.exerciseId));
    return h('a', { class: 'row hrow', href: `#/history/${w.id}` },
      h('div', { class: 'top' },
        h('div', { class: 'title ellipsis' }, w.name),
        prMap ? h('span', { class: 'pr', title: 'Новый рекорд' }, icon('trophy'), prMap.size > 1 ? String(prMap.size) : '') : null,
        icon('chev', 'chev')),
      h('div', { class: 'stats-line' }, [fmtDate(w.startedAt), fmtDurationWords(s.duration), `${s.sets} ${plural(s.sets, 'подход', 'подхода', 'подходов')}`, s.volume ? fmtTonnage(s.volume) : null].filter(Boolean).join(' · ')),
      names.length ? h('div', { class: 'exs' }, names.join(', ')) : null);
  }

  function calendar(all) {
    const { y, m } = calMonth;
    const counts = new Map();
    for (const w of all) { const k = startOfDay(w.startedAt); counts.set(k, (counts.get(k) || 0) + 1); }
    const lead = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const today = startOfDay(Date.now());
    const cells = [];
    for (const d of ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']) cells.push(h('div', { class: 'wd' }, d));
    for (let i = 0; i < lead; i++) cells.push(h('div', { class: 'd out' }));
    for (let d = 1; d <= days; d++) {
      const k = new Date(y, m, d).getTime();
      const n = counts.get(k);
      const cls = 'd' + (n ? ' on' : '') + (k === today ? ' today' : '') + (k === selDay ? ' sel' : '');
      cells.push(n
        ? h('button', { class: cls, 'aria-label': `${d} ${MONTHS[m]}: ${n} ${plural(n, 'тренировка', 'тренировки', 'тренировок')}`, 'aria-pressed': String(k === selDay), onclick: () => { selDay = selDay === k ? null : k; draw(); } }, String(d), n > 1 ? h('i') : null)
        : h('div', { class: cls }, String(d)));
    }
    const shift = (dm) => { const dt = new Date(y, m + dm, 1); calMonth = { y: dt.getFullYear(), m: dt.getMonth() }; draw(); };
    return h('div', { class: 'cal' },
      h('div', { class: 'cal-head' },
        h('button', { class: 'icon-btn', 'aria-label': 'Предыдущий месяц', onclick: () => shift(-1) }, icon('back')),
        h('b', null, `${MONTHS[m]} ${y}`),
        h('button', { class: 'icon-btn', 'aria-label': 'Следующий месяц', onclick: () => shift(1) }, icon('chev'))),
      h('div', { class: 'cal-grid' }, cells));
  }

  // ---------- Детали ----------
  function drawDetail() {
    const w = store.get('workouts', params.workoutId);
    if (!w || !w.finishedAt) {
      root.replaceChildren(topbar({ title: 'История', back: '#/history' }),
        empty('Тренировка не найдена', 'Возможно, она была удалена.', h('a', { class: 'btn', href: '#/history' }, 'К истории')));
      return;
    }
    const s = summarize(w);
    const prs = computePRs().get(w.id) || new Map();
    const persist = () => store.save('workouts', w);

    const exBlocks = w.items.map((it) => {
      const type = typeOf(it.exerciseId);
      const sets = it.sets.filter((x) => x.done || editing);
      let wn = 0;
      return h('section', { class: 'd-ex', 'aria-label': store.exerciseName(it.exerciseId) },
        h('h3', null, h('span', { class: 'ellipsis', style: { flex: 1 } }, store.exerciseName(it.exerciseId)),
          store.exercise(it.exerciseId) && !editing ? h('a', { class: 'icon-btn', style: { width: '32px', height: '32px' }, href: `#/exercise/${it.exerciseId}`, 'aria-label': 'Прогресс по упражнению' }, icon('progress')) : null),
        it.note ? h('div', { class: 'small muted', style: { marginBottom: '6px' } }, it.note) : null,
        sets.map((x) => {
          if (x.kind !== 'warmup') wn++;
          const n = x.kind === 'warmup' ? 'р' : String(wn);
          return editing ? editRow(it, x, type, n) : viewRow(x, type, n, prs.get(x.id));
        }));
    });

    function viewRow(x, type, n, pr) {
      const tag = x.kind === 'warmup' ? 'разминка' : x.kind === 'drop' ? 'дропсет' : '';
      return h('div', { class: 'd-set' + (x.kind === 'warmup' ? ' warm' : '') },
        h('span', { class: 'n' }, n),
        h('span', { class: 'v' }, fmtSetShort(x, type), tag ? h('small', null, tag) : null),
        pr ? h('span', { class: 'pr' }, icon('trophy'), 'PR ' + pr.join(' + ')) : null);
    }

    function editRow(it, x, type, n) {
      const mk = (key, label, scale = 1) => h('input', {
        class: 'cell', inputmode: 'decimal', 'aria-label': label, placeholder: label,
        value: x[key] == null ? '' : fmtNum(x[key] / scale).replace(',', '.'),
        onchange: async (e) => { const v = parseNum(e.target.value); x[key] = v == null ? null : v * scale; await persist(); },
      });
      const fields = type === 'time' ? [mk('timeSec', 'сек')]
        : type === 'cardio' ? [mk('timeSec', 'мин', 60), mk('distance', 'км')]
          : [mk('weight', 'кг'), h('span', { class: 'x' }, '×'), mk('reps', 'повт')];
      return h('div', { class: 'd-set' }, h('span', { class: 'n' }, n),
        h('span', { class: 'v', style: { display: 'flex', gap: '8px', alignItems: 'center' } }, fields),
        h('button', { class: 'icon-btn', 'aria-label': 'Удалить подход', onclick: async () => {
          it.sets = it.sets.filter((y) => y !== x);
          if (!it.sets.length) w.items = w.items.filter((i) => i !== it);
          await persist(); drawDetail();
        } }, icon('trash')));
    }

    const stat = (l, v) => h('div', { class: 'stat' }, h('div', { class: 'l' }, l), h('div', { class: 'v' }, v));

    show(
      topbar({
        title: w.name, back: '#/history', sub: cap(fmtDateLong(w.startedAt)) + ', ' + fmtTime(w.startedAt),
        right: h('button', { class: 'icon-btn', 'aria-label': 'Действия', onclick: menu }, icon('more')),
      }),
      h('div', { class: 'd-stats' }, stat('Время', fmtDuration(s.duration)), stat('Подходов', String(s.sets)), stat('Тоннаж', fmtTonnage(s.volume))),
      prs.size ? h('div', { class: 'chips' }, h('span', { class: 'chip warn' }, icon('trophy'), `${prs.size} ${plural(prs.size, 'рекорд', 'рекорда', 'рекордов')} в этой тренировке`)) : null,
      w.note ? h('div', { class: 'd-note' }, w.note) : null,
      ...exBlocks,
      !exBlocks.length ? empty('Нет подходов', 'В этой тренировке не осталось подходов.') : null,
      editing ? h('div', { class: 'd-actions' },
        h('div', { class: 'h2' }, 'Редактирование'),
        h('button', { class: 'btn block', onclick: editName }, icon('edit'), 'Название'),
        h('button', { class: 'btn block', onclick: editDate }, icon('today'), 'Дата и время'),
        h('button', { class: 'btn block', onclick: editNote }, icon('note'), 'Заметка'),
        h('button', { class: 'btn block primary', onclick: () => { editing = false; drawDetail(); } }, icon('check'), 'Готово'))
        : h('div', { class: 'd-actions' },
          h('button', { class: 'btn block primary lg', onclick: repeat }, icon('play'), 'Повторить тренировку'),
          h('button', { class: 'btn block', onclick: () => { editing = true; drawDetail(); } }, icon('edit'), 'Редактировать')));

    function menu() {
      actionMenu(w.name, [
        { label: 'Повторить тренировку', icon: 'play', onClick: repeat },
        { label: 'Редактировать', icon: 'edit', onClick: () => { editing = true; drawDetail(); } },
        { label: 'Сохранить как шаблон', icon: 'copy', onClick: saveTpl },
        { label: 'Удалить', icon: 'trash', danger: true, onClick: del },
      ]);
    }

    async function repeat() {
      if (store.activeWorkout()) { toast('Сначала заверши текущую тренировку'); return; }
      const tpl = templateFromWorkout(w);
      const real = w.templateId ? store.get('templates', w.templateId) : null;
      await startWorkout({ ...tpl, id: real ? real.id : null, programId: real ? real.programId : null });
      navigate('#/workout');
    }

    async function saveTpl() {
      const name = await promptSheet({ title: 'Название шаблона', value: w.name });
      if (name == null || !name.trim()) return;
      const tpl = templateFromWorkout(w);
      tpl.name = name.trim();
      tpl.programId = null;
      tpl.order = store.list('templates').length;
      await store.save('templates', tpl);
      toast('Шаблон сохранён', { action: 'Открыть', onAction: () => navigate(`#/template/${tpl.id}`) });
    }

    async function del() {
      const ok = await confirmSheet({ title: 'Удалить тренировку?', text: `«${w.name}» от ${fmtDate(w.startedAt, { year: true })} будет удалена из истории и статистики.`, ok: 'Удалить', danger: true });
      if (!ok) return;
      await store.remove('workouts', w.id);
      toast('Тренировка удалена');
      navigate('#/history', { replace: true });
    }

    async function editName() {
      const v = await promptSheet({ title: 'Название', value: w.name });
      if (v == null || !v.trim()) return;
      w.name = v.trim(); await persist(); drawDetail();
    }
    async function editNote() {
      const v = await promptSheet({ title: 'Заметка', value: w.note || '', multiline: true });
      if (v == null) return;
      w.note = v.trim(); await persist(); drawDetail();
    }
    function editDate() {
      const d = new Date(w.startedAt);
      const p = (n) => String(n).padStart(2, '0');
      const val = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
      const input = h('input', { class: 'input', type: 'datetime-local', value: val, 'aria-label': 'Дата и время начала' });
      sheet({ title: 'Дата и время', content: (close) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } }, input,
        h('button', { class: 'btn block primary', onclick: async () => {
          const t = new Date(input.value).getTime();
          if (!Number.isFinite(t)) { toast('Укажи дату'); return; }
          const dur = (w.finishedAt || t) - w.startedAt;
          w.startedAt = t; w.finishedAt = t + dur;
          close(); await persist(); drawDetail();
        } }, 'Сохранить')) });
    }
  }
}
