// Библиотека готовых тренировок (js/data/library.js): секция на экране «Программы» со ссылками
// в «Базу тренировок» (js/views/library.js) и действия — начать, добавить в шаблоны, добавить группу программой.
import { h, icon, toast } from '../core/ui.js';
import { store } from '../core/store.js';
import { plural } from '../core/util.js';
import { startWorkout } from '../core/workout.js';
import { installProgram } from '../core/seed.js';
import { LIBRARY } from '../data/library.js';
import { navigate } from '../router.js';

const KIND_ICON = { fullbody: 'Ф', chest: 'Г', back: 'С', legs: 'Н', shoulders: 'П', arms: 'Р', core: 'К' };

/** Секция «База тренировок» для экрана программ */
export function librarySection() {
  const total = LIBRARY.reduce((a, g) => a + g.templates.length, 0);
  return [
    h('div', { class: 'h2' }, 'База тренировок', h('a', { href: '#/library' }, 'Все')),
    h('div', { class: 'muted small', style: { margin: '-6px 4px 0' } }, `${total} проверенных тренировок с картинками упражнений — у каждой указан источник.`),
    h('div', { class: 'list' }, LIBRARY.map((g) => h('a', { class: 'row', href: `#/library/group/${g.kind}`, style: { color: 'inherit', textDecoration: 'none' } },
      h('div', { class: 'lib-ico' }, KIND_ICON[g.kind] || '•'),
      h('div', { class: 'grow' },
        h('div', { class: 'title' }, g.name),
        h('div', { class: 'meta ellipsis' }, g.templates.map((t) => t.source.author.split(/[,/]/)[0].trim()).filter((v, i, a) => a.indexOf(v) === i).join(' · '))),
      icon('chev', 'chev')))),
  ];
}

function toTemplateSrc(t) {
  const src = `Источник: ${t.source.author} — ${t.source.title}. ${t.source.url}`;
  const { id, source, ...rest } = t;
  return { ...rest, note: [t.note, src].filter(Boolean).join('\n\n') };
}

export async function startLibraryWorkout(t) {
  if (store.activeWorkout()) { toast('Сначала заверши текущую тренировку'); return; }
  await startWorkout({ ...toTemplateSrc(t), id: null });
  navigate('#/workout');
}

/** Одиночный шаблон — без обёртки-программы */
export async function addLibraryTemplate(t) {
  const p = await installProgram({ program: { name: t.name }, templates: [toTemplateSrc(t)] }, { makeActive: false });
  const tpl = store.get('templates', p.templateIds[0]);
  await store.save('templates', { ...tpl, programId: null });
  await store.remove('programs', p.id);
}

export async function addLibraryGroup(g) {
  await installProgram({ program: { name: g.name, note: g.note }, templates: g.templates.map(toTemplateSrc) }, { makeActive: false });
  toast(`Программа «${g.name}» добавлена — ${g.templates.length} ${plural(g.templates.length, 'день', 'дня', 'дней')}`);
  navigate('#/programs');
}
