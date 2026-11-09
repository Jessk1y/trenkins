// Запуск: node --test tests/progression.test.mjs
// package.json в проекте нет, а progression.js — ES-модуль с расширением .js, поэтому
// копируем модуль (и util.js) во временную папку как .mjs и импортируем оттуда.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const core = path.join(here, '..', 'js', 'core');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prog-'));
fs.copyFileSync(path.join(core, 'util.js'), path.join(tmp, 'util.mjs'));
fs.writeFileSync(path.join(tmp, 'progression.mjs'),
  fs.readFileSync(path.join(core, 'progression.js'), 'utf8').replace("'./util.js'", "'./util.mjs'"));
const { suggest, defaultStep } = await import(pathToFileURL(path.join(tmp, 'progression.mjs')).href);

const DAY = 864e5;
const NOW = Date.UTC(2026, 10, 9);
const bench = { id: 'bench', type: 'weight_reps', equipment: 'barbell' };
const db = { id: 'db', type: 'weight_reps', equipment: 'dumbbell' };
const targets = (n = 3, min = 8, max = 12) => Array.from({ length: n }, () => ({ kind: 'normal', repsMin: min, repsMax: max }));
// сессия: s('60x12,60x12,60x12', daysAgo) ; можно '60x10@2' (RIR)
const s = (str, daysAgo = 3, extra = {}) => ({
  workout: { id: 'w' + Math.random(), startedAt: NOW - daysAgo * DAY, finishedAt: NOW - daysAgo * DAY, ...extra },
  item: {},
  sets: str.split(',').map((p) => {
    const [wr, rir] = p.split('@');
    const [w, r] = wr.split('x');
    return { kind: 'normal', weight: +w, reps: +r, rir: rir == null ? null : +rir, done: true };
  }),
});
const sg = (ex, t, h) => suggest(ex, t, h, NOW);

test('defaultStep: по оборудованию и явный step', () => {
  assert.equal(defaultStep({ equipment: 'barbell' }), 2.5);
  assert.equal(defaultStep({ equipment: 'dumbbell' }), 2);
  assert.equal(defaultStep({ equipment: 'machine' }), 5);
  assert.equal(defaultStep({ equipment: 'cable', step: 2.5 }), 2.5);
  assert.equal(defaultStep(null), 2.5);
});

test('первый раз', () => {
  const r = sg(bench, targets(), []);
  assert.equal(r.kind, 'first'); assert.equal(r.weight, null); assert.equal(r.reps, 8);
  assert.match(r.text, /8–12/);
});

test('кардио — пусто, нет exercise — пусто', () => {
  assert.deepEqual(sg({ type: 'cardio' }, [], []), { weight: null, reps: null, text: null, kind: null });
  assert.equal(sg(null, [], []).kind, null);
});

test('верх диапазона во всех подходах → +шаг, цель — низ', () => {
  const r = sg(bench, targets(), [s('60x12,60x12,60x12')]);
  assert.equal(r.kind, 'up'); assert.equal(r.weight, 62.5); assert.equal(r.reps, 8);
});

test('верх только в части подходов → тот же вес, +1 к худшему', () => {
  const r = sg(bench, targets(), [s('60x12,60x10,60x9')]);
  assert.equal(r.kind, 'hold'); assert.equal(r.weight, 60); assert.equal(r.reps, 10);
});

test('меньше подходов, чем в шаблоне — верх не засчитывается', () => {
  const r = sg(bench, targets(3), [s('60x12,60x12')]);
  assert.equal(r.kind, 'hold'); assert.equal(r.weight, 60);
});

test('перебор верха на 3+ → два шага', () => {
  const r = sg(bench, targets(), [s('60x15,60x15,60x15')]);
  assert.equal(r.weight, 65);
});

test('гантели: шаг 2 кг, округление к сетке', () => {
  const r = sg(db, targets(), [s('20x12,20x12,20x12')]);
  assert.equal(r.weight, 22);
  const odd = sg(db, targets(), [s('21x12,21x12,21x12')]);
  assert.equal(odd.weight, 22);
});

test('шаг упражнения ex.step важнее оборудования', () => {
  const r = sg({ ...db, step: 1 }, targets(), [s('10x12,10x12,10x12')]);
  assert.equal(r.weight, 11);
});

test('разные веса в подходах: рабочий — максимальный', () => {
  const r = sg(bench, targets(), [s('60x12,60x12,57.5x12')]);
  assert.equal(r.kind, 'hold'); assert.equal(r.weight, 60); // top-подходов 2 < 3
});

test('разминка и дропы не влияют', () => {
  const h = s('60x12,60x12,60x12');
  h.sets.unshift({ kind: 'warmup', weight: 20, reps: 15 });
  h.sets.push({ kind: 'drop', weight: 40, reps: 20 });
  assert.equal(sg(bench, targets(), [h]).weight, 62.5);
});

test('RIR ≥ 4 во всех подходах и повторы в диапазоне → прибавка', () => {
  const r = sg(bench, targets(), [s('60x9@4,60x9@4,60x8@5')]);
  assert.equal(r.kind, 'up'); assert.equal(r.weight, 62.5);
  assert.match(r.text, /легко/);
});

test('RIR не у всех подходов — не считается', () => {
  const r = sg(bench, targets(), [s('60x9@4,60x9,60x8@5')]);
  assert.equal(r.kind, 'hold');
});

test('все подходы до отказа (RIR 0) — совет оставить запас', () => {
  const r = sg(bench, targets(), [s('60x9@0,60x9@0,60x8@0')]);
  assert.match(r.text, /запас/);
});

test('одна неудача → повтор веса', () => {
  const r = sg(bench, targets(), [s('60x7,60x6,60x6'), s('60x10,60x9,60x9', 6)]);
  assert.equal(r.kind, 'hold'); assert.equal(r.weight, 60); assert.equal(r.reps, 8);
});

test('две неудачи подряд на одном весе → откат', () => {
  const r = sg(bench, targets(), [s('60x7,60x6,60x6'), s('60x7,60x6,60x5', 4)]);
  assert.equal(r.kind, 'deload'); assert.ok(r.weight < 60);
  assert.equal(r.weight, 52.5); // 54 → 52.5 (к шагу вниз)
});

test('застой: 3 тренировки без прогресса → откат на −10%', () => {
  const h = [s('60x9,60x9,60x9', 1), s('60x9,60x9,60x9', 4), s('60x9,60x9,60x9', 7), s('60x9,60x9,60x9', 10)];
  const r = sg(bench, targets(), h);
  assert.equal(r.kind, 'deload'); assert.equal(r.weight, 52.5);
  assert.match(r.text, /без прогресса/);
});

test('две тренировки без прогресса — предупреждение, но вес прежний', () => {
  const h = [s('60x9,60x9,60x9', 1), s('60x9,60x9,60x9', 4), s('60x9,60x9,60x9', 7)];
  const r = sg(bench, targets(), h);
  assert.equal(r.kind, 'hold'); assert.equal(r.weight, 60); assert.match(r.text, /назад/);
});

test('рост повторов — не застой', () => {
  const h = [s('60x10,60x9,60x9', 1), s('60x9,60x9,60x9', 4), s('60x9,60x9,60x8', 7)];
  assert.equal(sg(bench, targets(), h).kind, 'hold');
  assert.equal(sg(bench, targets(), h).weight, 60);
});

test('откат на минимум на шаг ниже даже для малых весов', () => {
  const m = { type: 'weight_reps', equipment: 'machine' };
  const h = [s('10x9,10x9,10x9', 1), s('10x9,10x9,10x9', 4), s('10x9,10x9,10x9', 7), s('10x9,10x9,10x9', 10)];
  assert.equal(sg(m, targets(), h).weight, 5);
});

test('перерыв 14+ дней → −10%', () => {
  const r = sg(bench, targets(), [s('60x10,60x10,60x10', 20)]);
  assert.equal(r.kind, 'deload'); assert.equal(r.weight, 52.5); assert.match(r.text, /20 дн/);
});

test('делоад-тренировки (workout.deload) не учитываются', () => {
  const h = [s('30x8,30x8', 1, { deload: true }), s('60x12,60x12,60x12', 4)];
  assert.equal(sg(bench, targets(), h).weight, 62.5);
});

test('bw_reps без веса: верх диапазона → усложнить, weight=null', () => {
  const pull = { type: 'bw_reps', equipment: 'bodyweight' };
  const r = sg(pull, targets(3, 6, 10), [s('0x10,0x10,0x10')]);
  assert.equal(r.kind, 'up'); assert.equal(r.weight, null); assert.match(r.text, /отягощение/);
  const h = sg(pull, targets(3, 6, 10), [s('0x8,0x7,0x6')]);
  assert.equal(h.weight, null); assert.equal(h.reps, 7);
});

test('bw_reps с отягощением: прибавляет вес', () => {
  const dip = { type: 'bw_reps', equipment: 'bodyweight' };
  assert.equal(sg(dip, targets(3, 6, 10), [s('5x10,5x10,5x10')]).weight, 7.5);
});

test('assisted: прогресс = меньше помощи', () => {
  const g = { type: 'assisted', equipment: 'machine' };
  const r = sg(g, targets(3, 6, 10), [s('40x10,40x10,40x10')]);
  assert.equal(r.kind, 'up'); assert.equal(r.weight, 35); assert.equal(r.reps, 6);
});

test('assisted: «рабочий» вес — с наименьшей помощью; откат = больше помощи', () => {
  const g = { type: 'assisted', equipment: 'machine' };
  const h = [s('30x7,30x6,30x6', 1), s('30x7,30x6,30x5', 4)];
  const r = sg(g, targets(3, 8, 12), h);
  assert.equal(r.kind, 'deload'); assert.equal(r.weight, 35);
});

test('assisted: помощь 0 и верх — не уходим в минус', () => {
  const g = { type: 'assisted', equipment: 'machine' };
  const r = sg(g, targets(3, 6, 10), [s('0x10,0x10,0x10')]);
  assert.equal(r.weight, 0); assert.equal(r.kind, 'up');
});

test('время: все подходы выполнены → +5 с', () => {
  const plank = { type: 'time' };
  const t = [{ kind: 'normal', timeSec: 30 }, { kind: 'normal', timeSec: 30 }];
  const h = [{ workout: { startedAt: NOW - DAY }, item: {}, sets: [{ kind: 'normal', timeSec: 32 }, { kind: 'normal', timeSec: 30 }] }];
  const r = sg(plank, t, h);
  assert.equal(r.kind, 'up'); assert.equal(r.timeSec, 35); assert.equal(r.weight, null);
  const hold = sg(plank, t, [{ ...h[0], sets: [{ kind: 'normal', timeSec: 25 }, { kind: 'normal', timeSec: 30 }] }]);
  assert.equal(hold.kind, 'hold'); assert.equal(hold.timeSec, 30);
  assert.equal(sg(plank, t, []).kind, 'first');
});

test('время: потолок 90 с', () => {
  const t = [{ kind: 'normal', timeSec: 60 }];
  const h = [{ workout: { startedAt: NOW - DAY }, item: {}, sets: [{ kind: 'normal', timeSec: 90 }] }];
  const r = sg({ type: 'time' }, t, h);
  assert.equal(r.timeSec, 90); assert.match(r.text, /Усложни/);
});

test('шаблон без диапазона: повторяем прошлый результат, без текста', () => {
  const r = sg(bench, [{ kind: 'normal', repsMin: null, repsMax: null }], [s('60x8,60x7')]);
  assert.equal(r.kind, 'hold'); assert.equal(r.weight, 60); assert.equal(r.reps, 7); assert.equal(r.text, null);
});

test('контракт: всегда есть поля weight, reps, text, kind', () => {
  for (const h of [[], [s('60x12,60x12,60x12')], [s('60x7,60x6,60x6')]]) {
    const r = sg(bench, targets(), h);
    for (const k of ['weight', 'reps', 'text', 'kind']) assert.ok(k in r, k);
  }
});
