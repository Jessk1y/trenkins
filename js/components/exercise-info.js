// Картинки и техника упражнений (js/data/exercise-media.js — free-exercise-db, public domain).
// Модуль с картинками грузится лениво: если его нет или он не загрузился — всё работает без картинок.
import { h, sheet } from '../core/ui.js';
import { store } from '../core/store.js';
import { MUSCLES, EQUIPMENT } from '../data/exercises.js';

let mediaP = null;
export function loadMedia() {
  if (!mediaP) mediaP = import('../data/exercise-media.js').then((m) => m.EXERCISE_MEDIA || {}).catch(() => ({}));
  return mediaP;
}

/** Ряд из 1–2 картинок (старт / финиш). media — объект из EXERCISE_MEDIA или undefined. */
export function exercisePics(media, { onClick, cls = '' } = {}) {
  const imgs = media?.images || [];
  if (!imgs.length) return null;
  return h('div', { class: `ex-pics ${cls}`, onclick: onClick || null },
    imgs.slice(0, 2).map((src, i) => h('figure', null,
      h('img', { src, alt: i === 0 ? 'Начало движения' : 'Конец движения', loading: 'lazy', decoding: 'async', width: 480, height: 360 }),
      imgs.length > 1 ? h('figcaption', null, i === 0 ? 'старт' : 'финиш') : null)));
}

/** Шторка «Как выполнять»: картинки, мышцы, шаги техники. */
export async function openExerciseInfo(exerciseId) {
  const ex = store.exercise(exerciseId);
  if (!ex) return;
  const media = (await loadMedia())[exerciseId];
  const muscles = [MUSCLES[ex.muscle], ...(ex.secondary || []).map((m) => MUSCLES[m])].filter(Boolean);
  sheet({
    title: ex.name, tall: true,
    content: () => h('div', { class: 'exi' },
      exercisePics(media, { cls: 'big' }),
      h('div', { class: 'exi-tags' },
        muscles.map((m, i) => h('span', { class: 'chip' + (i === 0 ? ' accent' : '') }, m)),
        EQUIPMENT[ex.equipment] ? h('span', { class: 'chip' }, EQUIPMENT[ex.equipment]) : null),
      media?.steps?.length
        ? [h('div', { class: 'h2', style: { margin: '4px 0 0' } }, 'Как выполнять'),
          h('ol', { class: 'exi-steps' }, media.steps.map((s) => h('li', null, s)))]
        : h('div', { class: 'muted small' }, 'Описания техники для этого упражнения пока нет.'),
      ex.note ? h('div', { class: 'ex-note' }, ex.note) : null,
      media ? h('div', { class: 'exi-src' }, media.approx ? 'Картинка показывает близкий вариант упражнения. ' : '', 'Иллюстрации и техника: free-exercise-db (общественное достояние).') : null),
  });
}
