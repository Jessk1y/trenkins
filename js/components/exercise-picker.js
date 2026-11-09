// Выбор упражнения: поиск, фильтр по мышцам, создание своего упражнения.
// pickExercise({ multiple }) → Promise<string[]> (массив id; пусто — отмена)

import { h, icon, sheet, toast } from '../core/ui.js';
import { store } from '../core/store.js';
import { MUSCLES, EQUIPMENT, TYPES } from '../data/exercises.js';

const norm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е');

export function pickExercise({ multiple = true, title = 'Добавить упражнение' } = {}) {
  return new Promise((resolve) => {
    const chosen = [];
    let muscle = null;
    let q = '';
    let done = false;

    const listEl = h('div', { class: 'list' });
    const addBtn = h('button', { class: 'btn primary block lg', hidden: true });

    const recentIds = (() => {
      const seen = new Set();
      for (const w of store.history().slice(0, 20)) for (const it of w.items) seen.add(it.exerciseId);
      return seen;
    })();

    function render() {
      const all = store.exercises();
      let items = all.filter((e) => (!muscle || e.muscle === muscle || e.secondary?.includes(muscle)));
      if (q) {
        const nq = norm(q);
        const byName = items.filter((e) => norm(e.name).includes(nq) || (e.aliases || []).some((a) => norm(a).includes(nq)));
        // «пресс», «спина» и т.п. — ищем и по названию мышцы
        const byMuscle = items.filter((e) => !byName.includes(e) && norm(MUSCLES[e.muscle]).startsWith(nq));
        items = [...byName, ...byMuscle];
      } else if (!muscle) {
        // сначала недавние
        items = [...items.filter((e) => recentIds.has(e.id)), ...items.filter((e) => !recentIds.has(e.id))];
      }
      listEl.replaceChildren(...items.slice(0, 200).map((e) => {
        const on = chosen.includes(e.id);
        return h('button', {
          class: 'row', style: { width: '100%', textAlign: 'left', background: on ? 'var(--accent-soft)' : '' },
          onclick: () => {
            if (!multiple) { finish([e.id]); return; }
            const i = chosen.indexOf(e.id);
            if (i >= 0) chosen.splice(i, 1); else chosen.push(e.id);
            render();
          },
        },
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, e.name),
          h('div', { class: 'meta' }, [MUSCLES[e.muscle], EQUIPMENT[e.equipment]].filter(Boolean).join(' · '), recentIds.has(e.id) && !q ? ' · недавно' : '')),
        on ? h('span', { class: 'chip accent' }, String(chosen.indexOf(e.id) + 1)) : null);
      }));
      if (!items.length) {
        listEl.replaceChildren(h('div', { class: 'empty' }, h('b', null, 'Ничего не нашлось'),
          h('button', { class: 'btn primary', onclick: () => createCustom(q) }, `Создать «${q || 'новое'}»`)));
      }
      addBtn.hidden = !chosen.length;
      addBtn.textContent = `Добавить ${chosen.length}`;
    }

    const search = h('input', {
      class: 'input', type: 'search', placeholder: 'Поиск: жим, присед, пресс…', enterkeyhint: 'search',
      oninput: (e) => { q = e.target.value.trim(); render(); },
    });
    const chips = h('div', { class: 'chips scroll' },
      h('button', { class: 'chip on', onclick: (e) => setMuscle(null, e.currentTarget) }, 'Все'),
      Object.entries(MUSCLES).map(([k, v]) => h('button', { class: 'chip', onclick: (e) => setMuscle(k, e.currentTarget) }, v)));
    function setMuscle(k, btn) {
      muscle = k;
      chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === btn));
      render();
    }

    const s = sheet({
      title, tall: true,
      onClose: () => { if (!done) resolve([]); },
      headerRight: h('button', { class: 'btn ghost sm', onclick: () => createCustom('') }, 'Своё'),
      content: () => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 } },
        h('div', { class: 'search' }, icon('search'), search), chips, listEl),
    });
    s.el.append(addBtn);
    addBtn.addEventListener('click', () => finish([...chosen]));

    function finish(ids) { done = true; s.close(); resolve(ids); }

    function createCustom(name) {
      editExercise({ name }).then((ex) => {
        if (!ex) return;
        toast('Упражнение создано');
        if (!multiple) finish([ex.id]);
        else { chosen.push(ex.id); render(); }
      });
    }

    render();
  });
}

/** Создание/правка упражнения. Promise<exercise|null> */
export function editExercise(initial = {}) {
  return new Promise((resolve) => {
    const ex = { muscle: 'chest', equipment: 'barbell', type: 'weight_reps', secondary: [], aliases: [], rest: null, ...initial };
    let saved = false;
    const name = h('input', { class: 'input', value: ex.name || '', placeholder: 'Например, Жим в хаммере' });
    const sel = (opts, val) => h('select', { class: 'select' }, Object.entries(opts).map(([k, v]) => h('option', { value: k, selected: k === val }, v)));
    const muscle = sel(MUSCLES, ex.muscle);
    const equip = sel(EQUIPMENT, ex.equipment);
    const type = sel(TYPES, ex.type);
    const rest = h('input', { class: 'input', inputmode: 'numeric', value: ex.rest ?? '', placeholder: 'по умолчанию' });
    const note = h('textarea', { class: 'textarea', placeholder: 'Настройки тренажёра, техника…', value: ex.note || '' });
    const f = (l, c) => h('div', { class: 'field' }, h('label', null, l), c);
    sheet({
      title: ex.id ? 'Упражнение' : 'Новое упражнение', tall: true,
      onClose: () => { if (!saved) resolve(null); },
      content: (close) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        f('Название', name), f('Основная мышца', muscle), f('Оборудование', equip), f('Как записывать', type),
        f('Отдых, сек', rest), f('Заметка', note),
        h('button', {
          class: 'btn primary block lg',
          onclick: async () => {
            if (!name.value.trim()) { name.focus(); return; }
            const obj = {
              ...(ex.builtin ? { id: ex.id } : ex),
              name: name.value.trim(), muscle: muscle.value, equipment: equip.value, type: type.value,
              rest: rest.value ? Number(rest.value) : null, note: note.value.trim(),
            };
            if (!ex.builtin && !ex.id) obj.custom = true;
            if (ex.builtin) Object.assign(obj, { createdAt: ex.createdAt });
            const savedObj = await store.save('exercises', obj);
            saved = true; close(); resolve(store.exercise(savedObj.id));
          },
        }, 'Сохранить')),
    });
  });
}
