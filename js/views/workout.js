// Экран активной тренировки — главный экран приложения.
import { h, icon, toast, actionMenu, confirmSheet, promptSheet, sheet } from '../core/ui.js';
import { store } from '../core/store.js';
import { fmtNum, fmtDuration, fmtSec, parseNum, debounce, plural } from '../core/util.js';
import { buildItem, newSet, placeholders, finishWorkout, discardWorkout, summarize, templateFromWorkout } from '../core/workout.js';
import { pickExercise } from '../components/exercise-picker.js';
import { openPlateCalc } from '../components/plates.js';
import { defaultStep } from '../core/progression.js';
import { navigate } from '../router.js';

const weightInputs = new WeakMap(); // подход → поле веса (для протягивания веса на следующие подходы)
const KIND_LABEL ={ warmup: 'Разминка', normal: 'Рабочий', drop: 'Дроп-сет' };

export function render(root) {
  let w = store.activeWorkout();
  if (!w) { navigate('#/'); return; }
  document.body.classList.add('fullscreen');

  const save = debounce(() => store.save('workouts', w), 400);
  const saveNow = () => store.save('workouts', w);

  // ---------- Шапка ----------
  const clock = h('span', { class: 'num' });
  const setsCount = h('span');
  const nameInput = h('input', { class: 'name', value: w.name, 'aria-label': 'Название тренировки', oninput: (e) => { w.name = e.target.value; save(); } });
  const head = h('div', { class: 'wk-head' },
    h('a', { class: 'icon-btn', href: '#/', 'aria-label': 'Свернуть', style: { marginLeft: '-10px' } }, icon('down')),
    h('div', { class: 'title-block' }, nameInput, h('div', { class: 'sub' }, clock, ' · ', setsCount)),
    h('button', { class: 'icon-btn', 'aria-label': 'Ещё', onclick: workoutMenu }, icon('more')),
    h('button', { class: 'btn good sm', onclick: finish }, 'Завершить'));

  const list = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
  const addEx = h('button', { class: 'btn block lg', style: { color: 'var(--accent)' }, onclick: addExercises }, icon('plus'), 'Добавить упражнение');
  const restEl = h('div', { class: 'rest', hidden: true, role: 'timer' });

  root.replaceChildren(head, list, addEx, restEl);

  // ---------- Рендер ----------
  const cards = new Map();
  function renderAll() {
    cards.clear();
    if (!w.items.length) {
      list.replaceChildren(h('div', { class: 'empty' }, h('b', null, 'Пока пусто'), 'Добавь первое упражнение — подходы из прошлого раза подставятся сами.'));
    } else {
      list.replaceChildren(...w.items.map((it, i) => { const c = card(it, i); cards.set(it.id, c); return c; }));
    }
    updateCounters();
  }
  function rerenderCard(item) {
    const old = cards.get(item.id);
    const i = w.items.indexOf(item);
    const c = card(item, i);
    cards.set(item.id, c);
    old ? old.replaceWith(c) : renderAll();
    updateCounters();
  }
  function updateCounters() {
    const n = w.items.reduce((a, it) => a + it.sets.filter((s) => s.done).length, 0);
    setsCount.textContent = `${n} ${plural(n, 'подход', 'подхода', 'подходов')}`;
  }

  function card(item, index) {
    const ex = store.exercise(item.exerciseId) || { name: 'Удалённое упражнение', type: 'weight_reps' };
    const ph = placeholders(item, w.id);
    // вес сразу подставляем в поле (из прошлого раза / прогрессии / стартовый) — дальше −/+
    let filled = false;
    item.sets.forEach((s, si) => {
      const pw = ph.perSet[si]?.weight;
      if (!s.done && s.weight == null && pw != null) { s.weight = pw; s.autoW = true; filled = true; }
    });
    if (filled) save();
    const step = defaultStep(ex);
    const prevNext = w.items[index + 1];
    const inSuperset = item.superset && (prevNext?.superset === item.superset || w.items[index - 1]?.superset === item.superset);
    const type = ex.type || 'weight_reps';
    const cols = columnsFor(type);
    const lastStr = ph.last ? ph.last.sets.filter((s) => s.kind !== 'warmup').map((s) => fmtSetShort(s, type)).join(', ') : null;

    const table = h('table', { class: 'sets' },
      h('thead', null, h('tr', null, h('th', null, 'Сет'), h('th', null, 'Прошлый'), cols.map((c) => h('th', null, c.label)), h('th', null, ''))),
      h('tbody', null, item.sets.map((s, si) => setRow(item, s, si, ph.perSet[si], cols, type, step))));

    return h('section', { class: 'ex' + (inSuperset ? ' ss' : ''), 'aria-label': ex.name },
      h('div', { class: 'ex-top' },
        h('div', { class: 'grow' },
          inSuperset ? h('div', { class: 'ex-tag' }, `Суперсет ${item.superset}`) : null,
          h('button', { class: 'ex-name', onclick: () => exerciseMenu(item, ex) }, ex.name),
          h('div', { class: 'ex-sub' }, goalStr(item, type), lastStr ? `Прошлый раз: ${lastStr}` : 'Первый раз', ' · отдых ', fmtSec(item.rest))),
        h('button', { class: 'icon-btn', 'aria-label': 'Действия с упражнением', onclick: () => exerciseMenu(item, ex) }, icon('more'))),
      (item.note || ex.note) ? h('div', { class: 'ex-note' }, item.note || ex.note) : null,
      ph.hint && !item.sets.some((s) => s.done) ? h('div', { class: 'ex-hint' }, ph.hint) : null,
      table,
      h('div', { class: 'ex-actions' },
        h('button', { class: 'btn sm', onclick: () => addSet(item) }, icon('plus'), 'Подход'),
        (ex.equipment === 'barbell' || ex.equipment === 'ez' || ex.bar)
          ? h('button', { class: 'btn sm', onclick: () => openPlateCalc({ weight: currentWeight(item, ph), barId: ex.bar || (ex.equipment === 'ez' ? 'ez' : 'olympic') }) }, icon('plates'), 'Блины')
          : null));
  }

  function setRow(item, s, si, ph, cols, type, step) {
    const kindTxt = s.kind === 'warmup' ? 'Р' : s.kind === 'drop' ? 'Д' : String(item.sets.slice(0, si + 1).filter((x) => x.kind === 'normal').length);
    const tr = h('tr', { class: s.done ? 'done' : '' });
    const inputs = cols.map((c) => {
      const k = c.scale || 1;
      const isW = c.key === 'weight';
      const inp = h('input', {
        class: 'cell-in', inputmode: c.mode, enterkeyhint: 'next', 'aria-label': c.label,
        value: s[c.key] != null ? fmtNum(s[c.key] / k, isW ? 2 : 1) : '',
        placeholder: ph?.[c.key] != null ? fmtNum(ph[c.key] / k, 1) : (c.key === 'reps' && s.target?.repsMin ? targetStr(s.target) : '—'),
        oninput: (e) => {
          const n = parseNum(e.target.value); s[c.key] = n == null ? null : n * k;
          if (isW) setWeight(item, s, s.weight, false);
          save();
        },
        onfocus: (e) => e.target.select(),
      });
      if (!isW) return h('td', null, inp);
      weightInputs.set(s, inp);
      const bump = (dir) => {
        const base = s.weight ?? ph?.weight ?? 0;
        const next = Math.max(0, Math.round((base + dir * step) * 100) / 100);
        setWeight(item, s, next, true);
        saveNow();
      };
      return h('td', { class: 'w' }, h('div', { class: 'stepper' },
        h('button', { class: 'step-btn', 'aria-label': `Минус ${fmtNum(step)} кг`, onclick: () => bump(-1) }, '−'),
        inp,
        h('button', { class: 'step-btn', 'aria-label': `Плюс ${fmtNum(step)} кг`, onclick: () => bump(1) }, '+')));
    });
    tr.append(
      h('td', null, h('button', { class: 'set-kind' + (s.kind === 'warmup' ? ' w' : s.kind === 'drop' ? ' d' : ''), 'aria-label': 'Тип подхода', onclick: () => setMenu(item, s) }, kindTxt)),
      h('td', { class: 'prev' }, ph?.prev ? fmtSetShort(ph.prev, type) : '—'),
      ...inputs,
      h('td', { class: 'c' }, h('button', { class: 'check', 'aria-label': s.done ? 'Снять отметку' : 'Подход выполнен', 'aria-pressed': String(!!s.done), onclick: () => toggleDone(item, s, ph, cols, tr) }, icon('check'))));
    return tr;
  }

  /** Ручная правка веса: этот подход становится «своим», а следующие
   *  неотмеченные подходы того же типа с автоподставленным весом подтягиваются за ним. */
  function setWeight(item, s, value, updateSelf) {
    s.weight = value; s.autoW = false;
    if (updateSelf) { const el = weightInputs.get(s); if (el) el.value = fmtNum(value, 2); }
    for (const x of item.sets.slice(item.sets.indexOf(s) + 1)) {
      if (x.done || x.kind !== s.kind || !x.autoW) continue;
      x.weight = value;
      const el = weightInputs.get(x); if (el) el.value = value == null ? '' : fmtNum(value, 2);
    }
  }

  // ---------- Действия ----------
  function toggleDone(item, s, ph, cols, tr) {
    if (s.done) { s.done = false; saveNow(); rerenderCard(item); return; }
    // пустые поля берём из подсказки
    for (const c of cols) if (s[c.key] == null && ph?.[c.key] != null) s[c.key] = ph[c.key];
    const need = cols.find((c) => c.required && s[c.key] == null);
    if (need) {
      const idx = cols.indexOf(need);
      tr.querySelectorAll('.cell-in')[idx]?.focus();
      toast(`Заполни: ${need.label.toLowerCase()}`);
      return;
    }
    s.done = true;
    saveNow();
    rerenderCard(item);
    // таймер отдыха: в суперсете — только после последнего упражнения круга
    const idx = w.items.indexOf(item);
    const nextItem = w.items[idx + 1];
    const midSuperset = item.superset && nextItem?.superset === item.superset;
    if (store.settings().autoRest && !midSuperset && s.kind !== 'warmup') startRest(item.rest);
    else if (store.settings().autoRest && s.kind === 'warmup') startRest(Math.min(60, item.rest));
  }

  function addSet(item) {
    const last = item.sets[item.sets.length - 1];
    const ns = newSet(last?.kind === 'warmup' ? 'normal' : (last?.kind || 'normal'), last?.target || null, { weight: last?.kind === 'warmup' ? null : (last?.weight ?? null) });
    if (ns.weight != null) ns.autoW = true;
    item.sets.push(ns);
    saveNow(); rerenderCard(item);
  }

  function setMenu(item, s) {
    actionMenu('Подход', [
      ...Object.entries(KIND_LABEL).filter(([k]) => k !== s.kind).map(([k, v]) => ({ label: `Сделать: ${v.toLowerCase()}`, onClick: () => { s.kind = k; saveNow(); rerenderCard(item); } })),
      { label: 'RIR (сколько повторов было в запасе)', icon: 'note', onClick: async () => {
        const v = await promptSheet({ title: 'Повторов в запасе (RIR)', value: s.rir ?? '', inputmode: 'numeric', placeholder: '0 — до отказа, 2 — мог ещё 2' });
        if (v !== null) { s.rir = parseNum(v); saveNow(); }
      } },
      { label: 'Удалить подход', icon: 'trash', danger: true, onClick: () => { item.sets.splice(item.sets.indexOf(s), 1); saveNow(); rerenderCard(item); } },
    ]);
  }

  function exerciseMenu(item, ex) {
    const i = w.items.indexOf(item);
    const next = w.items[i + 1];
    actionMenu(ex.name, [
      { label: item.note ? 'Изменить заметку' : 'Заметка к упражнению', icon: 'note', onClick: async () => {
        const v = await promptSheet({ title: 'Заметка', value: item.note || ex.note || '', multiline: true, placeholder: 'Сиденье на 4, хват на кольцах…' });
        if (v !== null) { item.note = v.trim(); saveNow(); rerenderCard(item); }
      } },
      { label: `Отдых: ${fmtSec(item.rest)}`, icon: 'timer', onClick: () => restPicker(item) },
      next ? { label: item.superset && next.superset === item.superset ? 'Убрать суперсет со следующим' : 'Суперсет со следующим', icon: 'link', onClick: () => toggleSuperset(i) } : null,
      { label: 'Заменить упражнение', icon: 'swap', onClick: async () => {
        const [id] = await pickExercise({ multiple: false, title: 'Заменить на' });
        if (!id) return;
        const fresh = buildItem(id, { targets: item.sets.map((s) => ({ kind: s.kind, ...(s.target || {}) })), superset: item.superset }, w.id);
        w.items[i] = fresh; saveNow(); renderAll();
      } },
      i > 0 ? { label: 'Переместить выше', icon: 'up', onClick: () => move(i, -1) } : null,
      next ? { label: 'Переместить ниже', icon: 'down', onClick: () => move(i, 1) } : null,
      { label: 'История и график', icon: 'progress', onClick: () => navigate(`#/exercise/${item.exerciseId}`) },
      { label: 'Удалить из тренировки', icon: 'trash', danger: true, onClick: () => {
        const removed = w.items.splice(i, 1)[0]; saveNow(); renderAll();
        toast('Упражнение удалено', { action: 'Вернуть', onAction: () => { w.items.splice(i, 0, removed); saveNow(); renderAll(); } });
      } },
    ]);
  }

  function toggleSuperset(i) {
    const a = w.items[i], b = w.items[i + 1];
    if (a.superset && a.superset === b.superset) { b.superset = null; if (w.items[i - 1]?.superset !== a.superset) a.superset = null; }
    else {
      const used = new Set(w.items.map((x) => x.superset).filter(Boolean));
      const letter = a.superset || b.superset || 'ABCDEFGH'.split('').find((l) => !used.has(l));
      a.superset = letter; b.superset = letter;
    }
    saveNow(); renderAll();
  }
  function move(i, d) { const [x] = w.items.splice(i, 1); w.items.splice(i + d, 0, x); saveNow(); renderAll(); }

  function restPicker(item) {
    const opts = [30, 45, 60, 90, 120, 150, 180, 240, 300];
    sheet({
      title: 'Отдых между подходами',
      content: (close) => h('div', { class: 'chips', style: { gap: '8px' } }, opts.map((o) =>
        h('button', { class: 'chip' + (o === item.rest ? ' on' : ''), style: { fontSize: '15px', padding: '10px 14px' }, onclick: () => { item.rest = o; saveNow(); rerenderCard(item); close(); } }, fmtSec(o)))),
    });
  }

  async function addExercises() {
    const ids = await pickExercise();
    if (!ids.length) return;
    for (const id of ids) w.items.push(buildItem(id, {}, w.id));
    saveNow(); renderAll();
    setTimeout(() => cards.get(w.items[w.items.length - ids.length].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function workoutMenu() {
    actionMenu('Тренировка', [
      { label: 'Заметка к тренировке', icon: 'note', onClick: async () => { const v = await promptSheet({ title: 'Заметка', value: w.note, multiline: true }); if (v !== null) { w.note = v; saveNow(); } } },
      { label: 'Калькулятор блинов', icon: 'plates', onClick: () => openPlateCalc({}) },
      { label: 'Отменить тренировку', icon: 'trash', danger: true, onClick: async () => {
        const ok = await confirmSheet({ title: 'Отменить тренировку?', text: 'Все отмеченные подходы этой тренировки будут удалены.', ok: 'Удалить тренировку', danger: true });
        if (ok) { await discardWorkout(w); navigate('#/'); }
      } },
    ]);
  }

  async function finish() {
    const sm = summarize(w);
    const undone = w.items.reduce((a, it) => a + it.sets.filter((s) => !s.done).length, 0);
    if (!sm.sets) {
      const ok = await confirmSheet({ title: 'Нет выполненных подходов', text: 'Отметь хотя бы один подход галочкой или отмени тренировку.', ok: 'Отменить тренировку', danger: true, cancel: 'Продолжить' });
      if (ok) { await discardWorkout(w); navigate('#/'); }
      return;
    }
    const tpl = w.templateId ? store.get('templates', w.templateId) : null;
    const text = `${fmtDuration(sm.duration)} · ${sm.sets} ${plural(sm.sets, 'подход', 'подхода', 'подходов')}` + (undone ? `. ${undone} неотмеченных ${plural(undone, 'подход', 'подхода', 'подходов')} не сохранятся.` : '');
    const ok = await confirmSheet({ title: 'Завершить тренировку?', text, ok: 'Завершить' });
    if (!ok) return;
    const changed = tpl && structureChanged(tpl, w);
    await finishWorkout(w);
    if (changed) {
      const upd = await confirmSheet({ title: 'Обновить шаблон?', text: `Состав упражнений отличается от шаблона «${tpl.name}». Сохранить новый порядок и подходы в шаблон?`, ok: 'Обновить шаблон', cancel: 'Оставить как было' });
      if (upd) { const t = templateFromWorkout(w); await store.save('templates', { ...tpl, items: t.items }); }
    }
    toast('Тренировка сохранена 💪');
    navigate(`#/history/${w.id}`);
  }

  // ---------- Таймер отдыха ----------
  function startRest(sec) {
    w.restTotal = sec; w.restUntil = Date.now() + sec * 1000; saveNow(); tick();
  }
  function stopRest() { delete w.restUntil; delete w.restTotal; saveNow(); restEl.hidden = true; }
  function tick() {
    clock.textContent = fmtDuration(Date.now() - w.startedAt);
    if (!w.restUntil) { restEl.hidden = true; return; }
    const left = Math.round((w.restUntil - Date.now()) / 1000);
    if (left < -15) { stopRest(); return; }
    restEl.hidden = false;
    const over = left <= 0;
    restEl.classList.toggle('over', over);
    const frac = over ? 1 : 1 - left / (w.restTotal || 1);
    const C = 2 * Math.PI * 18;
    restEl.innerHTML = '';
    restEl.append(
      h('svg', null),
      h('div', null, h('div', { class: 'tm' }, over ? 'Пора!' : fmtSec(left)), h('div', { class: 's' }, over ? 'Отдых окончен' : `отдых из ${fmtSec(w.restTotal)}`)),
      h('div', { class: 'acts' },
        !over ? h('button', { onclick: () => { w.restUntil -= 15000; w.restTotal = Math.max(15, w.restTotal - 15); saveNow(); tick(); } }, '−15') : null,
        !over ? h('button', { onclick: () => { w.restUntil += 15000; w.restTotal += 15; saveNow(); tick(); } }, '+15') : null,
        h('button', { onclick: stopRest }, over ? 'ОК' : 'Пропуск')));
    restEl.firstChild.outerHTML = `<svg class="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="4"/><circle cx="22" cy="22" r="18" fill="none" stroke="${over ? '#fff' : '#5f8bff'}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 22 22)"/></svg>`;
  }
  const timer = setInterval(tick, 500);

  // ---------- Экран не гаснет ----------
  let lock = null;
  async function wake() {
    if (!store.settings().keepAwake || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    try { lock = await navigator.wakeLock.request('screen'); } catch { /* iOS может отказать */ }
  }
  const onVis = () => { if (document.visibilityState === 'visible') { wake(); tick(); } };
  document.addEventListener('visibilitychange', onVis);
  wake();

  renderAll(); tick();

  return () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVis);
    lock?.release?.().catch(() => {});
    document.body.classList.remove('fullscreen');
    store.save('workouts', w);
  };
}

// ---------- Помощники ----------
function columnsFor(type) {
  switch (type) {
    case 'time': return [{ key: 'timeSec', label: 'Сек', mode: 'numeric', required: true }];
    case 'cardio': return [{ key: 'timeSec', label: 'Мин', mode: 'decimal', required: true, scale: 60 }, { key: 'distance', label: 'Км', mode: 'decimal' }];
    case 'bw_reps': return [{ key: 'weight', label: '+кг', mode: 'decimal' }, { key: 'reps', label: 'Повт', mode: 'numeric', required: true }];
    case 'assisted': return [{ key: 'weight', label: '−кг', mode: 'decimal' }, { key: 'reps', label: 'Повт', mode: 'numeric', required: true }];
    default: return [{ key: 'weight', label: 'кг', mode: 'decimal', required: true }, { key: 'reps', label: 'Повт', mode: 'numeric', required: true }];
  }
}
export function fmtSetShort(s, type = 'weight_reps') {
  if (type === 'time') return `${s.timeSec ?? '—'} с`;
  if (type === 'cardio') return `${fmtNum((s.timeSec || 0) / 60, 1)} мин${s.distance ? ' · ' + fmtNum(s.distance) + ' км' : ''}`;
  if (type === 'bw_reps') return s.weight ? `+${fmtNum(s.weight)}×${s.reps}` : `${s.reps}`;
  if (type === 'assisted') return s.weight ? `−${fmtNum(s.weight)}×${s.reps}` : `${s.reps}`;
  return `${fmtNum(s.weight)}×${s.reps ?? '—'}`;
}
function goalStr(item, type) {
  const work = item.sets.filter((s) => s.kind === 'normal' && s.target);
  const t = work[0]?.target;
  if (!t) return '';
  if (type === 'time' && t.timeSec) return `Цель ${work.length}×${t.timeSec} с · `;
  if (type === 'cardio' && t.timeSec) return `Цель ${Math.round(t.timeSec / 60)} мин · `;
  if (t.repsMin) return `Цель ${work.length}×${targetStr(t)} · `;
  return '';
}
function targetStr(t) { return t.repsMax && t.repsMax !== t.repsMin ? `${t.repsMin}–${t.repsMax}` : String(t.repsMin); }
function currentWeight(item, ph) {
  const s = item.sets.find((x) => !x.done && x.kind === 'normal') || item.sets[item.sets.length - 1];
  const i = item.sets.indexOf(s);
  return s?.weight ?? ph.perSet[i]?.weight ?? null;
}
/** Спрашиваем про шаблон, только если что-то добавили: новое упражнение или больше подходов.
 *  Пропущенные упражнения и подходы шаблон не меняют. Вызывать ДО finishWorkout (пока есть все подходы). */
function structureChanged(tpl, w) {
  const tplSets = new Map(tpl.items.map((i) => [i.exerciseId, i.sets.length]));
  return w.items.some((i) => !tplSets.has(i.exerciseId) || i.sets.length > tplSets.get(i.exerciseId));
}
