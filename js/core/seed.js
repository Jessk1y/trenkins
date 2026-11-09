// Установка готовой программы в хранилище.
import { store } from './store.js';
import { uid } from './util.js';
import { RECOMMENDED_PROGRAM } from '../data/program.js';

/** Создаёт программу и её шаблоны из объекта формата research/program.json. Возвращает программу. */
export async function installProgram(src = RECOMMENDED_PROGRAM, { makeActive = true } = {}) {
  if (makeActive) for (const p of store.list('programs')) if (p.active) await store.save('programs', { ...p, active: false });
  const programId = uid();
  const templateIds = [];
  let order = store.list('templates').length;
  for (const t of src.templates) {
    const tpl = await store.save('templates', {
      name: t.name, note: t.note || '', programId, order: order++,
      items: t.items.map((it) => ({
        id: uid(), exerciseId: it.exerciseId, rest: it.rest ?? null, superset: it.superset || null, note: it.note || '',
        sets: it.sets.map((s) => ({ kind: s.kind || 'normal', repsMin: s.repsMin ?? null, repsMax: s.repsMax ?? null, timeSec: s.timeSec ?? null, rir: s.rir ?? null })),
      })),
    });
    templateIds.push(tpl.id);
  }
  return store.save('programs', { id: programId, name: src.program.name, note: src.program.note || '', templateIds, active: makeActive });
}
