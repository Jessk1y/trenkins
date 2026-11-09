// Экран программ и шаблонов: #/programs, #/program/<id>, #/template/<id>
import { h, icon, toast, topbar, empty, actionMenu, confirmSheet, loadCss } from '../core/ui.js';
import { store } from '../core/store.js';
import { uid, parseNum, plural, clone } from '../core/util.js';
import { startWorkout } from '../core/workout.js';
import { installProgram } from '../core/seed.js';
import { pickExercise } from '../components/exercise-picker.js';
import { navigate } from '../router.js';

export function render(root, params = {}) {
  loadCss('css/views/templates.css');
  if (params.templateId) return renderTemplate(root, params.templateId);
  if (params.programId) return renderProgram(root, params.programId);
  return renderList(root);
}

// ---------- Общее ----------
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
const start = async (tpl) => { await startWorkout(tpl); navigate('#/workout'); };
const countText = (n, forms) => `${n} ${plural(n, ...forms)}`;
const EX_FORMS = ['упражнение', 'упражнения', 'упражнений'];
const DAY_FORMS = ['день', 'дня', 'дней'];

function tplSummary(t) {
  if (!t.items.length) return 'Пустой шаблон';
  return t.items.map((it) => store.exerciseName(it.exerciseId)).join(', ');
}

function debouncedSaver(save, ms = 400) {
  let timer = null;
  const flush = () => { if (timer) { clearTimeout(timer); timer = null; return save(); } };
  const schedule = () => { clearTimeout(timer); timer = setTimeout(flush, ms); };
  const cancel = () => { clearTimeout(timer); timer = null; };
  return { schedule, flush, cancel };
}

async function createTemplate(programId) {
  const all = store.list('templates');
  const siblings = programId ? store.templatesOf(programId) : [];
  const tpl = await store.save('templates', {
    name: programId ? `День ${siblings.length + 1}` : 'Новый шаблон',
    note: '', programId: programId || null,
    order: Math.max(0, ...all.map((t) => t.order ?? 0)) + 1, items: [],
  });
  if (programId) {
    const p = store.get('programs', programId);
    await store.save('programs', { ...p, templateIds: [...p.templateIds, tpl.id] });
  }
  navigate(`#/template/${tpl.id}`);
}

async function deleteProgram(p) {
  const n = store.templatesOf(p.id).length;
  const ok = await confirmSheet({
    title: `Удалить программу «${p.name}»?`,
    text: `Вместе с ней удалятся шаблоны (${n}). История тренировок останется. Отменить нельзя.`,
    ok: 'Удалить', danger: true,
  });
  if (!ok) return false;
  for (const id of p.templateIds) await store.remove('templates', id);
  await store.remove('programs', p.id);
  toast('Программа удалена');
  return true;
}

async function deleteTemplate(tpl) {
  const ok = await confirmSheet({
    title: `Удалить «${tpl.name}»?`, text: 'История тренировок останется. Отменить нельзя.', ok: 'Удалить', danger: true,
  });
  if (!ok) return false;
  const p = tpl.programId ? store.get('programs', tpl.programId) : null;
  if (p) await store.save('programs', { ...p, templateIds: p.templateIds.filter((id) => id !== tpl.id) });
  await store.remove('templates', tpl.id);
  toast('Шаблон удалён');
  return true;
}

async function setActive(p) {
  for (const o of store.list('programs')) if (o.active && o.id !== p.id) await store.save('programs', { ...o, active: false });
  await store.save('programs', { ...p, active: true });
}

/** Ряд-день: ссылка на шаблон + кнопка «Начать» */
function dayRow(t, i, extra) {
  return h('div', { class: 'row' },
    i !== undefined ? h('div', { class: 'num-badge' }, String(i + 1)) : null,
    h('a', { class: 'grow link', href: `#/template/${t.id}` },
      h('div', { class: 'title ellipsis' }, t.name),
      h('div', { class: 'meta ellipsis' }, tplSummary(t))),
    extra || null,
    h('button', { class: 'btn sm primary go', onclick: () => start(t), 'aria-label': `Начать ${t.name}` }, icon('play'), 'Начать'));
}

// ---------- Список программ ----------
function renderList(root) {
  const programs = store.list('programs').sort((a, b) => (b.active - a.active) || (a.createdAt - b.createdAt));
  const active = programs.find((p) => p.active);
  const others = programs.filter((p) => p !== active);
  const progIds = new Set(programs.map((p) => p.id));
  const loose = store.list('templates').filter((t) => !t.programId || !progIds.has(t.programId)).sort(byOrder);

  const addMenu = () => actionMenu('Создать', [
    { label: 'Новая программа', icon: 'programs', onClick: newProgram },
    { label: 'Новый шаблон (без программы)', icon: 'plus', onClick: () => createTemplate(null) },
  ]);

  async function newProgram() {
    const p = await store.save('programs', { name: 'Новая программа', note: '', templateIds: [], active: !active });
    navigate(`#/program/${p.id}`);
  }

  const out = [topbar({ title: 'Программы', right: h('button', { class: 'icon-btn', 'aria-label': 'Создать', onclick: addMenu }, icon('plus')) })];

  if (!programs.length && !loose.length) {
    out.push(empty('Программ пока нет', 'Поставь готовую программу — фулбади 3 раза в неделю — или собери свою.',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '360px' } },
        h('button', { class: 'btn primary lg block', onclick: async () => { await installProgram(); toast('Программа добавлена'); navigate('#/programs', { replace: true }); } }, 'Поставить рекомендованную программу'),
        h('button', { class: 'btn block', onclick: newProgram }, 'Создать свою'))));
  }

  if (active) {
    const tpls = store.templatesOf(active.id);
    out.push(
      h('div', { class: 'h2' }, 'Активная программа', h('a', { href: `#/program/${active.id}` }, 'Открыть')),
      h('a', { class: 'card', href: `#/program/${active.id}`, style: { color: 'inherit', textDecoration: 'none', display: 'block' } },
        h('div', { style: { fontWeight: 800, fontSize: '18px' } }, active.name),
        h('div', { class: 'muted small' }, countText(tpls.length, DAY_FORMS))),
      tpls.length
        ? h('div', { class: 'list tp-days' }, tpls.map((t, i) => dayRow(t, i)))
        : empty('В программе нет дней', null, h('a', { class: 'btn primary', href: `#/program/${active.id}` }, 'Добавить день')));
  }

  if (others.length) {
    out.push(h('div', { class: 'h2' }, active ? 'Другие программы' : 'Программы'),
      h('div', { class: 'list' }, others.map((p) => h('a', { class: 'row', href: `#/program/${p.id}` },
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, p.name),
          h('div', { class: 'meta' }, countText(store.templatesOf(p.id).length, DAY_FORMS))),
        icon('chev', 'chev')))));
  }

  if (loose.length) {
    out.push(h('div', { class: 'h2' }, 'Шаблоны без программы'),
      h('div', { class: 'list tp-days' }, loose.map((t) => dayRow(t))));
  }

  if (!programs.length && loose.length === 0) { /* пустое состояние выше */ }
  else out.push(h('div', { class: 'tp-actions' },
    h('button', { class: 'btn', onclick: newProgram }, icon('plus'), 'Новая программа'),
    h('button', { class: 'btn', onclick: () => createTemplate(null) }, icon('plus'), 'Новый шаблон')));

  if (!programs.length && loose.length) {
    out.push(h('button', { class: 'btn block', onclick: async () => { await installProgram(); navigate('#/programs', { replace: true }); } }, 'Поставить рекомендованную программу'));
  }

  root.replaceChildren(...out);
}

// ---------- Программа ----------
function renderProgram(root, programId) {
  let p = store.get('programs', programId);
  if (!p) {
    root.replaceChildren(topbar({ title: 'Программа', back: '#/programs' }), empty('Программа не найдена', null, h('a', { class: 'btn primary', href: '#/programs' }, 'К программам')));
    return;
  }
  const saver = debouncedSaver(() => store.save('programs', p));

  const nameIn = h('input', { class: 'input', value: p.name, placeholder: 'Название программы', enterkeyhint: 'done',
    oninput: () => { p.name = nameIn.value; saver.schedule(); } });
  const noteIn = h('textarea', { class: 'textarea', placeholder: 'Заметка: как чередовать дни, принципы…', value: p.note || '',
    oninput: () => { p.note = noteIn.value; saver.schedule(); } });

  const daysEl = h('div');
  const activeBtn = h('button', { class: 'btn block' });

  function drawActive() {
    activeBtn.className = 'btn block ' + (p.active ? 'good' : 'primary');
    activeBtn.replaceChildren(icon('check'), p.active ? 'Активная программа' : 'Сделать активной');
  }
  activeBtn.onclick = async () => {
    if (p.active) { toast('Это уже активная программа'); return; }
    await saver.flush();
    await setActive(p); p = store.get('programs', programId); drawActive(); toast('Программа активна');
  };

  async function move(i, d) {
    const ids = p.templateIds, j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const a = store.get('templates', ids[i]), b = store.get('templates', ids[j]);
    if (a && b && a.order !== b.order) { const o = a.order; await store.save('templates', { ...a, order: b.order }); await store.save('templates', { ...b, order: o }); }
    await store.save('programs', p);
    drawDays();
  }

  function drawDays() {
    const tpls = p.templateIds.map((id) => store.get('templates', id));
    const visible = tpls.filter(Boolean);
    if (!visible.length) {
      daysEl.replaceChildren(empty('Дней пока нет', 'Добавь первый день — например, «День А».'));
      return;
    }
    daysEl.replaceChildren(h('div', { class: 'list tp-days' }, visible.map((t, i) => dayRow(t, i, h('div', { class: 'mv' },
      h('button', { class: 'icon-btn', disabled: i === 0, 'aria-label': 'Выше', onclick: () => move(i, -1) }, icon('up')),
      h('button', { class: 'icon-btn', disabled: i === visible.length - 1, 'aria-label': 'Ниже', onclick: () => move(i, 1) }, icon('down')))))));
  }

  const out = [
    topbar({ title: 'Программа', back: '#/programs',
      right: h('button', { class: 'icon-btn', 'aria-label': 'Ещё', onclick: () => actionMenu(p.name, [
        { label: 'Удалить программу', icon: 'trash', danger: true, onClick: async () => { if (await deleteProgram(p)) { saver.cancel(); navigate('#/programs'); } } },
      ]) }, icon('more')) }),
    h('div', { class: 'card tp-card' },
      h('div', { class: 'field' }, h('label', null, 'Название'), nameIn),
      h('div', { class: 'field' }, h('label', null, 'Заметка'), noteIn),
      activeBtn),
    h('div', { class: 'h2' }, 'Дни по порядку'),
    daysEl,
    h('button', { class: 'btn block', onclick: async () => { await saver.flush(); createTemplate(p.id); } }, icon('plus'), 'Добавить день'),
  ];
  drawActive(); drawDays();
  root.replaceChildren(...out);
  return () => { saver.flush(); };
}

// ---------- Редактор шаблона ----------
const KIND_NEXT = { warmup: 'normal', normal: 'drop', drop: 'warmup' };
const KIND_NAME = { warmup: 'Разминочный', normal: 'Рабочий', drop: 'Дропсет' };

function exType(item) { return store.exercise(item.exerciseId)?.type || 'weight_reps'; }
const isRepsType = (t) => t !== 'time' && t !== 'cardio';

function defaultSet(type, like) {
  if (type === 'time') return { kind: like?.kind || 'normal', repsMin: null, repsMax: null, timeSec: like?.timeSec || 30, rir: null };
  if (type === 'cardio') return { kind: 'normal', repsMin: null, repsMax: null, timeSec: like?.timeSec || 1200, rir: null };
  return { kind: like?.kind || 'normal', repsMin: like?.repsMin ?? 8, repsMax: like?.repsMax ?? 12, timeSec: null, rir: like?.rir ?? null };
}
/** привести подходы к типу упражнения (после замены) */
function fitSets(item) {
  const t = exType(item);
  item.sets = item.sets.map((s) => {
    if (isRepsType(t)) return s.repsMin != null ? s : { ...defaultSet(t, s), kind: s.kind };
    return s.timeSec ? s : { ...defaultSet(t, s), kind: s.kind };
  });
}

function renderTemplate(root, templateId) {
  const tpl = store.get('templates', templateId);
  if (!tpl) {
    root.replaceChildren(topbar({ title: 'Шаблон', back: '#/programs' }), empty('Шаблон не найден', null, h('a', { class: 'btn primary', href: '#/programs' }, 'К программам')));
    return;
  }
  const saver = debouncedSaver(() => store.save('templates', tpl));
  const dirty = () => saver.schedule();
  const program = tpl.programId ? store.get('programs', tpl.programId) : null;

  const nameIn = h('input', { class: 'input', value: tpl.name, placeholder: 'Название дня', enterkeyhint: 'done',
    oninput: () => { tpl.name = nameIn.value; dirty(); } });
  const noteIn = h('textarea', { class: 'textarea', placeholder: 'Заметка к тренировке', value: tpl.note || '', style: { minHeight: '60px' },
    oninput: () => { tpl.note = noteIn.value; dirty(); } });

  const listEl = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });

  function cleanSupersets() {
    tpl.items.forEach((it, i) => {
      if (!it.superset) return;
      const joined = tpl.items[i - 1]?.superset === it.superset || tpl.items[i + 1]?.superset === it.superset;
      if (!joined) it.superset = null;
    });
  }
  function toggleSuperset(i) {
    const a = tpl.items[i], b = tpl.items[i + 1];
    if (!b) return;
    if (a.superset && a.superset === b.superset) {
      b.superset = null;
    } else {
      const used = new Set(tpl.items.map((x) => x.superset).filter(Boolean));
      const letter = a.superset || b.superset || 'ABCDEFGH'.split('').find((l) => !used.has(l));
      a.superset = letter; b.superset = letter;
    }
    cleanSupersets(); dirty(); drawList();
  }
  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= tpl.items.length) return;
    [tpl.items[i], tpl.items[j]] = [tpl.items[j], tpl.items[i]];
    cleanSupersets(); dirty(); drawList();
  }
  async function replace(item) {
    const [id] = await pickExercise({ multiple: false, title: 'Заменить упражнение' });
    if (!id) return;
    item.exerciseId = id; fitSets(item); dirty(); drawList();
  }
  async function removeItem(i) {
    const it = tpl.items[i];
    const ok = await confirmSheet({ title: `Убрать «${store.exerciseName(it.exerciseId)}»?`, ok: 'Убрать', danger: true });
    if (!ok) return;
    tpl.items.splice(i, 1); cleanSupersets(); dirty(); drawList();
  }

  function setRow(item, s, si) {
    const type = exType(item);
    const normalIdx = item.sets.slice(0, si + 1).filter((x) => x.kind === 'normal').length;
    const label = s.kind === 'warmup' ? 'Р' : s.kind === 'drop' ? 'D' : String(normalIdx);
    const kindBtn = h('button', { class: 'set-kind ' + (s.kind === 'warmup' ? 'w' : s.kind === 'drop' ? 'd' : ''),
      title: KIND_NAME[s.kind], 'aria-label': `${KIND_NAME[s.kind]} подход, нажми чтобы сменить тип`,
      onclick: () => { s.kind = KIND_NEXT[s.kind]; dirty(); drawCard(item); } }, label);

    let vals;
    const num = (v, cb, ph) => h('input', { class: 'cell-in', inputmode: 'numeric', value: v ?? '', placeholder: ph, 'aria-label': ph,
      onfocus: (e) => e.target.select(), onchange: (e) => { cb(e.target); dirty(); } });
    if (isRepsType(type)) {
      const minIn = num(s.repsMin, (el) => {
        const n = parseNum(el.value); s.repsMin = n == null ? null : Math.max(0, Math.round(n));
        if (s.repsMin != null && (s.repsMax == null || s.repsMax < s.repsMin)) { s.repsMax = s.repsMin; maxIn.value = s.repsMax; }
        el.value = s.repsMin ?? '';
      }, 'от');
      const maxIn = num(s.repsMax, (el) => {
        const n = parseNum(el.value); s.repsMax = n == null ? null : Math.max(0, Math.round(n));
        if (s.repsMax != null && (s.repsMin == null || s.repsMin > s.repsMax)) { s.repsMin = s.repsMax; minIn.value = s.repsMin; }
        el.value = s.repsMax ?? '';
      }, 'до');
      vals = h('div', { class: 'vals' }, minIn, h('span', { class: 'sep' }, '–'), maxIn, h('span', { class: 'unit' }, 'повт.'));
    } else if (type === 'time') {
      vals = h('div', { class: 'vals' }, num(s.timeSec, (el) => { const n = parseNum(el.value); s.timeSec = n == null ? null : Math.max(0, Math.round(n)); el.value = s.timeSec ?? ''; }, 'сек'), h('span', { class: 'unit' }, 'сек'));
    } else {
      vals = h('div', { class: 'vals' }, num(s.timeSec != null ? Math.round(s.timeSec / 60 * 10) / 10 : '', (el) => { const n = parseNum(el.value); s.timeSec = n == null ? null : Math.max(0, Math.round(n * 60)); }, 'мин'), h('span', { class: 'unit' }, 'мин'));
    }
    return h('div', { class: 'tp-set' }, kindBtn, vals,
      h('button', { class: 'del', 'aria-label': 'Удалить подход', onclick: () => { item.sets.splice(si, 1); dirty(); drawCard(item); } }, icon('close')));
  }

  function card(item, i) {
    const ex = store.exercise(item.exerciseId);
    const inSS = !!item.superset;
    const next = tpl.items[i + 1];
    const ssWithNext = item.superset && next?.superset === item.superset;
    const type = exType(item);
    const restPh = String(ex?.rest ?? store.settings().defaultRest);
    const sets = item.sets;
    const el = h('div', { class: 'tp-ex' + (inSS ? ' ss' : ''), dataset: { id: item.id } },
      h('div', { class: 'tp-ex-top' },
        h('div', { class: 'grow' },
          inSS ? h('div', { class: 'ex-tag' }, `Суперсет ${item.superset}`) : null,
          h('div', { class: 'ex-name' }, store.exerciseName(item.exerciseId)),
          h('div', { class: 'ex-sub' }, sets.length ? countText(sets.filter((s) => s.kind !== 'warmup').length, ['рабочий подход', 'рабочих подхода', 'рабочих подходов']) + (sets.some((s) => s.kind === 'warmup') ? ` + ${sets.filter((s) => s.kind === 'warmup').length} разм.` : '') : 'Нет подходов')),
        h('button', { class: 'icon-btn', 'aria-label': 'Выше', disabled: i === 0, onclick: () => move(i, -1) }, icon('up')),
        h('button', { class: 'icon-btn', 'aria-label': 'Ниже', disabled: i === tpl.items.length - 1, onclick: () => move(i, 1) }, icon('down')),
        h('button', { class: 'icon-btn', 'aria-label': 'Ещё', onclick: () => actionMenu(store.exerciseName(item.exerciseId), [
          { label: 'Заменить упражнение', icon: 'swap', onClick: () => replace(item) },
          next ? { label: ssWithNext ? 'Убрать суперсет со следующим' : 'Суперсет со следующим', icon: 'link', onClick: () => toggleSuperset(i) } : null,
          { label: 'Убрать из шаблона', icon: 'trash', danger: true, onClick: () => removeItem(i) },
        ]) }, icon('more'))),
      h('div', { class: 'tp-sets' }, sets.map((s, si) => setRow(item, s, si))),
      h('div', { class: 'tp-ex-foot' },
        h('button', { class: 'btn sm', onclick: () => {
          const like = [...sets].reverse().find((s) => s.kind === 'normal') || sets[sets.length - 1];
          sets.push(defaultSet(type, like ? { ...like, kind: 'normal' } : null)); dirty(); drawCard(item);
        } }, icon('plus'), 'Подход'),
        sets.length && sets[0].kind !== 'warmup' && isRepsType(type)
          ? h('button', { class: 'btn sm', onclick: () => { sets.unshift({ ...defaultSet(type, sets[0]), kind: 'warmup', repsMin: 8, repsMax: 8 }); dirty(); drawCard(item); } }, icon('plus'), 'Разминка')
          : null),
      h('div', { class: 'tp-ex-extra' },
        h('input', { class: 'input', inputmode: 'numeric', value: item.rest ?? '', placeholder: `отдых ${restPh} с`, 'aria-label': 'Отдых, секунд',
          onchange: (e) => { const n = parseNum(e.target.value); item.rest = n == null ? null : Math.max(0, Math.round(n)); e.target.value = item.rest ?? ''; dirty(); } }),
        h('input', { class: 'input', value: item.note || '', placeholder: 'Заметка к упражнению', 'aria-label': 'Заметка',
          oninput: (e) => { item.note = e.target.value; dirty(); } })));
    return el;
  }
  function drawCard(item) {
    const i = tpl.items.indexOf(item);
    const old = listEl.querySelector(`[data-id="${item.id}"]`);
    if (old) old.replaceWith(card(item, i)); else drawList();
  }
  function drawList() {
    if (!tpl.items.length) { listEl.replaceChildren(empty('Упражнений пока нет', 'Добавь первое упражнение в этот день.')); return; }
    listEl.replaceChildren(...tpl.items.map(card));
  }

  async function addExercises() {
    const ids = await pickExercise({ multiple: true });
    if (!ids?.length) return;
    for (const id of ids) {
      const item = { id: uid(), exerciseId: id, rest: null, superset: null, note: '', sets: [] };
      const t = exType(item);
      item.sets = t === 'cardio' ? [defaultSet(t)] : [defaultSet(t), defaultSet(t), defaultSet(t)];
      tpl.items.push(item);
    }
    dirty(); drawList();
  }

  async function duplicate() {
    await saver.flush();
    const copy = clone(tpl);
    delete copy.id; delete copy.createdAt; delete copy.updatedAt; delete copy.deletedAt;
    copy.name = tpl.name + ' (копия)';
    copy.order = Math.max(0, ...store.list('templates').map((t) => t.order ?? 0)) + 1;
    copy.items.forEach((it) => { it.id = uid(); });
    const saved = await store.save('templates', copy);
    if (program) {
      const ids = [...program.templateIds]; ids.splice(ids.indexOf(tpl.id) + 1, 0, saved.id);
      await store.save('programs', { ...program, templateIds: ids });
    }
    toast('Шаблон продублирован');
    navigate(`#/template/${saved.id}`);
  }

  const back = program ? `#/program/${program.id}` : '#/programs';
  root.replaceChildren(
    topbar({ title: 'Шаблон', sub: program ? program.name : 'Без программы', back,
      right: h('button', { class: 'icon-btn', 'aria-label': 'Ещё', onclick: () => actionMenu(tpl.name, [
        { label: 'Дублировать шаблон', icon: 'copy', onClick: duplicate },
        { label: 'Удалить шаблон', icon: 'trash', danger: true, onClick: async () => { if (await deleteTemplate(tpl)) { saver.cancel(); navigate(back); } } },
      ]) }, icon('more')) }),
    h('div', { class: 'card tp-card' },
      h('div', { class: 'field' }, h('label', null, 'Название'), nameIn),
      h('div', { class: 'field' }, h('label', null, 'Заметка'), noteIn)),
    h('div', { class: 'h2' }, 'Упражнения'),
    listEl,
    h('button', { class: 'btn block', onclick: addExercises }, icon('plus'), 'Добавить упражнения'),
    h('div', { class: 'tp-actions' },
      h('button', { class: 'btn primary lg', disabled: false, onclick: async () => {
        if (!tpl.items.length) { toast('Сначала добавь упражнения'); return; }
        await saver.flush(); await start(tpl);
      } }, icon('play'), 'Начать тренировку'),
      h('button', { class: 'btn lg', onclick: duplicate }, icon('copy'), 'Дублировать')));
  drawList();
  return () => { saver.flush(); };
}
