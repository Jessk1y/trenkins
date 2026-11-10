// База тренировок: #/library (все группы), #/library/group/<kind>, #/library/<templateId> (тренировка целиком).
import { h, icon, toast, topbar, empty, loadCss } from '../core/ui.js';
import { store } from '../core/store.js';
import { plural, fmtSec } from '../core/util.js';
import { MUSCLES, EQUIPMENT } from '../data/exercises.js';
import { LIBRARY } from '../data/library.js';
import { loadMedia, exercisePics, openExerciseInfo } from '../components/exercise-info.js';
import { startLibraryWorkout, addLibraryTemplate, addLibraryGroup } from '../components/library.js';

const KIND_ICON = { fullbody: 'Ф', chest: 'Г', back: 'С', legs: 'Н', shoulders: 'П', arms: 'Р', core: 'К' };

export async function render(root, params = {}) {
  loadCss('css/views/library.css');
  if (params.templateId) return renderWorkout(root, params.templateId);
  return renderList(root, params.group || null);
}

// ---------- помощники ----------
const findTpl = (id) => {
  for (const g of LIBRARY) for (const t of g.templates) if (t.id === id) return { g, t };
  return null;
};
const work = (it) => it.sets.filter((s) => (s.kind || 'normal') !== 'warmup');
const warm = (it) => it.sets.filter((s) => s.kind === 'warmup');
const reps = (s) => (s.timeSec && !s.repsMin ? `${s.timeSec} с` : s.repsMax && s.repsMax !== s.repsMin ? `${s.repsMin}–${s.repsMax}` : `${s.repsMin ?? '?'}`);

/** «3 × 8–12» или «8, 6, 4» если подходы разные */
function workStr(it) {
  const w = work(it);
  if (!w.length) return '';
  const all = w.map(reps);
  return all.every((r) => r === all[0]) ? `${w.length} × ${all[0]}` : all.join(', ');
}
function estMinutes(t) {
  let sec = 0;
  for (const it of t.items) for (const s of it.sets) sec += (s.timeSec || 40) + (s.kind === 'warmup' ? 60 : (it.rest || 90));
  return Math.round(sec / 60 / 5) * 5;
}
const workSets = (t) => t.items.reduce((a, it) => a + work(it).length, 0);
const authorShort = (t) => t.source.author.split(/[,/]/)[0].trim();

// ---------- список ----------
function renderList(root, group) {
  const total = LIBRARY.reduce((a, g) => a + g.templates.length, 0);
  const chips = h('div', { class: 'chips scroll lb-chips' },
    h('a', { class: 'chip' + (!group ? ' on' : ''), href: '#/library' }, 'Все'),
    LIBRARY.map((g) => h('a', { class: 'chip' + (group === g.kind ? ' on' : ''), href: `#/library/group/${g.kind}` }, g.name.replace(/\s*\(.*\)/, ''))));
  const groups = group ? LIBRARY.filter((g) => g.kind === group) : LIBRARY;

  root.replaceChildren(
    topbar({ title: 'База тренировок', back: '#/programs' }),
    h('div', { class: 'muted small lb-intro' }, `${total} ${plural(total, 'тренировка', 'тренировки', 'тренировок')} из опубликованных программ и исследований. Открой любую — внутри все упражнения с картинками, подходы и повторы.`),
    chips,
    ...groups.flatMap((g) => [
      h('div', { class: 'h2 lb-group' }, h('span', { class: 'lib-ico' }, KIND_ICON[g.kind] || '•'), g.name),
      g.note && group ? h('div', { class: 'muted small lb-intro' }, g.note) : null,
      h('div', { class: 'list' }, g.templates.map((t) => h('a', { class: 'row lb-row', href: `#/library/${t.id}` },
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, t.name),
          h('div', { class: 'meta' }, `${t.items.length} ${plural(t.items.length, 'упражнение', 'упражнения', 'упражнений')} · ${workSets(t)} подх. · ~${estMinutes(t)} мин`),
          h('div', { class: 'meta ellipsis' }, authorShort(t))),
        icon('chev', 'chev')))),
      group ? h('button', { class: 'btn block', onclick: () => addLibraryGroup(g) }, icon('plus'), `Добавить все ${g.templates.length} как программу`) : null,
    ]).filter(Boolean),
  );
  root.querySelector('.lb-chips .on')?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
}

// ---------- тренировка целиком ----------
async function renderWorkout(root, id) {
  const found = findTpl(id);
  if (!found) {
    root.replaceChildren(topbar({ title: 'Тренировка', back: '#/library' }), empty('Тренировка не найдена', null, h('a', { class: 'btn primary', href: '#/library' }, 'К базе')));
    return;
  }
  const { g, t } = found;
  const media = await loadMedia();

  const card = (it, i) => {
    const ex = store.exercise(it.exerciseId) || { name: it.exerciseId };
    const m = media[it.exerciseId];
    const ss = it.superset ? h('span', { class: 'chip lb-ss' }, `суперсет ${it.superset}`) : null;
    const w = warm(it);
    return h('section', { class: 'lb-ex' + (it.superset ? ' ss' : '') },
      exercisePics(m, { onClick: () => openExerciseInfo(it.exerciseId) }),
      h('div', { class: 'lb-ex-body' },
        h('div', { class: 'lb-ex-head' },
          h('div', { class: 'num-badge' }, String(i + 1)),
          h('div', { class: 'grow' },
            h('div', { class: 'lb-ex-name' }, ex.name),
            h('div', { class: 'meta' }, [MUSCLES[ex.muscle], EQUIPMENT[ex.equipment]].filter(Boolean).join(' · '))),
          ss),
        h('div', { class: 'lb-sets' },
          h('div', null, h('span', { class: 'lb-k' }, 'Рабочие'), h('b', null, workStr(it))),
          w.length ? h('div', null, h('span', { class: 'lb-k' }, 'Разминка'), h('span', null, w.map(reps).join(', '))) : null,
          it.rest ? h('div', null, h('span', { class: 'lb-k' }, 'Отдых'), h('span', null, fmtSec(it.rest))) : null),
        it.note ? h('div', { class: 'lb-note' }, it.note) : null,
        h('button', { class: 'btn sm lb-how', onclick: () => openExerciseInfo(it.exerciseId) }, 'Как выполнять', icon('chev'))));
  };

  root.replaceChildren(
    topbar({ title: cap(t.name.replace(/^[^—]+—\s*/, '')), sub: g.name, back: `#/library/group/${g.kind}` }),
    h('div', { class: 'lb-stats' },
      h('div', null, h('b', null, String(t.items.length)), h('span', null, plural(t.items.length, 'упражнение', 'упражнения', 'упражнений'))),
      h('div', null, h('b', null, String(workSets(t))), h('span', null, 'рабочих подходов')),
      h('div', null, h('b', null, `~${estMinutes(t)}`), h('span', null, 'минут'))),
    t.note ? h('div', { class: 'lb-desc' }, t.note) : null,
    ...t.items.map(card),
    h('div', { class: 'card lb-source' },
      h('div', { class: 'lb-k' }, 'Источник'),
      h('a', { href: t.source.url, target: '_blank', rel: 'noopener' }, `${t.source.author} — ${t.source.title}`),
      t.source.adapted ? h('div', { class: 'muted small' }, 'Адаптация: ', t.source.adapted) : null),
    h('div', { class: 'lb-bar' },
      h('button', { class: 'btn', onclick: async () => { await addLibraryTemplate(t); toast('Добавлено в «Шаблоны без программы»'); } }, icon('plus'), 'В шаблоны'),
      h('button', { class: 'btn primary', onclick: () => startLibraryWorkout(t) }, icon('play'), 'Начать')),
  );
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
