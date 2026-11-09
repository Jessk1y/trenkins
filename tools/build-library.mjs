// Собирает js/data/library.js из research/workouts.json (библиотека готовых тренировок).
// Запуск: node tools/build-library.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { EXERCISES } from '../js/data/exercises.js';

const src = JSON.parse(readFileSync(new URL('../research/workouts.json', import.meta.url), 'utf8'));
const ids = new Set(EXERCISES.map((e) => e.id));

const programs = src.programs.map((p) => ({
  id: p.id, name: p.name, kind: p.kind, note: p.note || '',
  templates: p.templates.map((t) => ({
    id: t.id, name: t.name, note: t.note || '',
    source: { author: t.source.author, title: t.source.title, url: t.source.url, adapted: t.source.adapted || '' },
    items: t.items.map((it) => {
      if (!ids.has(it.exerciseId)) throw new Error(`${t.id}: нет упражнения ${it.exerciseId} в каталоге`);
      return { exerciseId: it.exerciseId, rest: it.rest ?? null, superset: it.superset || null, note: it.note || '', sets: it.sets };
    }),
  })),
}));

const out = `// Сгенерировано tools/build-library.mjs из research/workouts.json — руками не править.
// Библиотека готовых тренировок из проверенных источников (обоснование — research/workouts.md).
export const LIBRARY = ${JSON.stringify(programs)};
`;
writeFileSync(new URL('../js/data/library.js', import.meta.url), out);
console.log(`library.js: ${programs.length} групп, ${programs.reduce((a, p) => a + p.templates.length, 0)} тренировок, ${out.length} байт`);
