// Библиотека готовых тренировок (js/data/library.js): список групп на экране «Программы»
// и шторка группы — тренировки с источником, «Начать», «В мои шаблоны», «Добавить все как программу».
import { h, icon, sheet, toast } from '../core/ui.js';
import { store } from '../core/store.js';
import { plural } from '../core/util.js';
import { startWorkout } from '../core/workout.js';
import { installProgram } from '../core/seed.js';
import { LIBRARY } from '../data/library.js';
import { navigate } from '../router.js';

const KIND_ICON = { fullbody: 'Ф', chest: 'Г', back: 'С', legs: 'Н', shoulders: 'П', arms: 'Р', core: 'К' };

function setsSummary(it, ex) {
  const work = it.sets.filter((s) => (s.kind || 'normal') !== 'warmup');
  const s = work[0];
  if (!s) return '';
  if (ex?.type === 'time' || (s.timeSec && !s.repsMin)) return `${work.length}×${s.timeSec} с`;
  const r = s.repsMax && s.repsMax !== s.repsMin ? `${s.repsMin}–${s.repsMax}` : `${s.repsMin ?? '?'}`;
  return `${work.length}×${r}`;
}

/** Секция «Библиотека» для экрана программ */
export function librarySection() {
  return [
    h('div', { class: 'h2' }, 'Библиотека тренировок'),
    h('div', { class: 'muted small', style: { margin: '-6px 4px 0' } }, 'Проверенные тренировки из опубликованных программ и исследований — у каждой указан источник.'),
    h('div', { class: 'list' }, LIBRARY.map((g) => h('button', { class: 'row', style: { width: '100%', textAlign: 'left' }, onclick: () => openGroup(g) },
      h('div', { class: 'lib-ico' }, KIND_ICON[g.kind] || '•'),
      h('div', { class: 'grow' },
        h('div', { class: 'title' }, g.name),
        h('div', { class: 'meta ellipsis' }, g.templates.map((t) => t.source.author.split(/[,/]/)[0].trim()).filter((v, i, a) => a.indexOf(v) === i).join(' · '))),
      icon('chev', 'chev')))),
  ];
}

function toTemplateSrc(t) {
  const src = `Источник: ${t.source.author} — ${t.source.title}. ${t.source.url}`;
  return { ...t, note: [t.note, src].filter(Boolean).join('\n\n') };
}

function openGroup(g) {
  sheet({
    title: g.name, tall: true,
    content: (close) => h('div', { class: 'lib' },
      g.note ? h('p', { class: 'muted small', style: { margin: 0 } }, g.note) : null,
      g.templates.map((t) => h('div', { class: 'lib-tpl' },
        h('div', { class: 'lib-name' }, t.name),
        h('ol', { class: 'lib-ex' }, t.items.map((it) => {
          const ex = store.exercise(it.exerciseId);
          return h('li', null, h('span', null, ex?.name || it.exerciseId), h('span', { class: 'lib-sets' }, setsSummary(it, ex)));
        })),
        t.note ? h('div', { class: 'small muted' }, t.note) : null,
        h('a', { class: 'lib-src', href: t.source.url, target: '_blank', rel: 'noopener' }, icon('note'), h('span', null, `${t.source.author} — ${t.source.title}`)),
        t.source.adapted ? h('div', { class: 'lib-adapt' }, 'Адаптация: ', t.source.adapted) : null,
        h('div', { class: 'lib-btns' },
          h('button', { class: 'btn sm', onclick: async () => {
            const { id, ...rest } = toTemplateSrc(t);
            await installProgram({ program: { name: t.name }, templates: [rest] }, { makeActive: false }).then(async (p) => {
              // одиночный шаблон — без обёртки-программы
              const tpl = store.get('templates', p.templateIds[0]);
              await store.save('templates', { ...tpl, programId: null });
              await store.remove('programs', p.id);
            });
            toast('Добавлено в «Шаблоны без программы»');
          } }, icon('plus'), 'В шаблоны'),
          h('button', { class: 'btn sm primary', onclick: async () => {
            if (store.activeWorkout()) { toast('Сначала заверши текущую тренировку'); return; }
            const { id, ...rest } = toTemplateSrc(t);
            await startWorkout({ ...rest, id: null });
            close(); navigate('#/workout');
          } }, icon('play'), 'Начать')))),
      h('button', { class: 'btn primary block lg', onclick: async () => {
        await installProgram({ program: { name: g.name, note: g.note }, templates: g.templates.map(toTemplateSrc) }, { makeActive: false });
        close(); toast(`Программа «${g.name}» добавлена — ${g.templates.length} ${plural(g.templates.length, 'день', 'дня', 'дней')}`);
        navigate('#/programs', { replace: true });
      } }, `Добавить все ${g.templates.length} как программу`)),
  });
}
