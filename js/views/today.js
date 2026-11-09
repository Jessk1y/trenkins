// Экран «Сегодня»: следующая тренировка программы, неделя, быстрые действия.
import { h, icon, toast, promptSheet, empty } from '../core/ui.js';
import { store } from '../core/store.js';
import { fmtDateLong, startOfWeek, startOfDay, DAY, fmtNum, parseNum, fmtDate, plural, fmtTonnage } from '../core/util.js';
import { startWorkout, summarize } from '../core/workout.js';
import { navigate } from '../router.js';

export function render(root) {
  const active = store.activeWorkout();
  const next = store.nextTemplate();
  const program = store.activeProgram();
  const history = store.history();
  const now = Date.now();

  const start = async (tpl) => { await startWorkout(tpl); navigate('#/workout'); };

  // Неделя
  const ws = startOfWeek(now);
  const doneDays = new Set(history.filter((w) => w.startedAt >= ws).map((w) => startOfDay(w.startedAt)));
  const week = h('div', { class: 'week' }, Array.from({ length: 7 }, (_, i) => {
    const d = ws + i * DAY;
    const date = new Date(d);
    return h('div', null, ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i],
      h('i', { class: (doneDays.has(d) ? 'on' : '') + (startOfDay(now) === d ? ' today' : '') }, String(date.getDate())));
  }));

  // Статистика
  const weekWorkouts = history.filter((w) => w.startedAt >= ws);
  const weekVolume = weekWorkouts.reduce((a, w) => a + summarize(w).volume, 0);
  const body = store.list('body').filter((b) => b.weight).sort((a, b) => b.date - a.date);
  const lastWeight = body[0]?.weight;
  const monthAgo = body.find((b) => b.date <= now - 28 * DAY);
  const goal = store.settings().profile?.goalWeight;

  const stats = h('div', { class: 'stats' },
    h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Неделя'), h('div', { class: 'v' }, `${weekWorkouts.length}`), h('div', { class: 'd', style: { color: 'var(--muted)' } }, plural(weekWorkouts.length, 'тренировка', 'тренировки', 'тренировок'))),
    h('div', { class: 'stat' }, h('div', { class: 'l' }, 'Тоннаж'), h('div', { class: 'v' }, fmtTonnage(weekVolume)), h('div', { class: 'd', style: { color: 'var(--muted)' } }, 'за неделю')),
    h('button', { class: 'stat', style: { textAlign: 'left' }, onclick: addWeight },
      h('div', { class: 'l' }, 'Вес'),
      h('div', { class: 'v' }, lastWeight ? fmtNum(lastWeight, 1) : '+'),
      h('div', { class: 'd', style: { color: monthAgo && lastWeight < monthAgo.weight ? 'var(--good)' : 'var(--muted)' } },
        lastWeight ? (monthAgo ? `${fmtNum(lastWeight - monthAgo.weight, 1)} за мес` : goal ? `цель ${goal}` : fmtDate(body[0].date)) : 'записать')));

  async function addWeight() {
    const v = await promptSheet({ title: 'Вес тела, кг', inputmode: 'decimal', value: lastWeight ? fmtNum(lastWeight, 1) : '', placeholder: 'например 77,4' });
    const n = parseNum(v);
    if (!n) return;
    await store.save('body', { date: Date.now(), weight: n });
    toast('Вес записан');
    navigate('#/', { replace: true });
  }

  // Главная карточка
  let hero;
  if (active) {
    hero = h('div', { class: 'hero' },
      h('div', { class: 's' }, 'Тренировка идёт'),
      h('div', { class: 'n' }, active.name),
      h('a', { class: 'btn block lg', href: '#/workout' }, 'Продолжить'));
  } else if (next) {
    hero = h('div', { class: 'hero' },
      h('div', { class: 's' }, program ? `Программа «${program.name}»` : 'Следующая'),
      h('div', { class: 'n' }, next.name),
      h('div', { class: 'ex-list' }, next.items.map((it) => store.exerciseName(it.exerciseId)).join(' · ')),
      h('button', { class: 'btn block lg', onclick: () => start(next) }, 'Начать тренировку'));
  } else {
    hero = h('div', { class: 'hero' },
      h('div', { class: 's' }, 'Программы пока нет'),
      h('div', { class: 'n' }, 'Начни с пустой тренировки'),
      h('div', { class: 'ex-list' }, 'Или поставь готовую программу: фулбади 3 раза в неделю, пресс в каждой тренировке.'),
      h('button', { class: 'btn block lg', onclick: async () => {
        const { installProgram } = await import('../core/seed.js');
        await installProgram(); toast('Программа добавлена'); navigate('#/', { replace: true });
      } }, 'Поставить программу'),
      h('button', { class: 'btn block', style: { background: 'rgba(255,255,255,.18)', color: '#fff', marginTop: '6px' }, onclick: () => start(null) }, 'Пустая тренировка'));
  }

  // Шаблоны для быстрого старта
  const tpls = store.list('templates').sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 6);
  const quick = tpls.length && !active ? [
    h('div', { class: 'h2' }, 'Быстрый старт', h('a', { href: '#/programs' }, 'Все')),
    h('div', { class: 'list' }, tpls.map((t) => h('button', { class: 'row', style: { width: '100%', textAlign: 'left' }, onclick: () => start(t) },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, t.name), h('div', { class: 'meta ellipsis' }, t.items.map((it) => store.exerciseName(it.exerciseId)).join(', ') || 'пустой шаблон')),
      icon('play', 'chev')))),
    next ? h('button', { class: 'btn block', onclick: () => start(null) }, icon('plus'), 'Пустая тренировка') : null,
  ] : [];

  // Последняя тренировка
  const last = history[0];
  const lastBlock = last ? [
    h('div', { class: 'h2' }, 'Последняя тренировка'),
    h('div', { class: 'list' }, h('a', { class: 'row', href: `#/history/${last.id}` },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, last.name), h('div', { class: 'meta' }, `${fmtDate(last.startedAt)} · ${summarize(last).sets} подходов`)),
      icon('chev', 'chev'))),
  ] : [];

  root.replaceChildren(
    h('div', { class: 'topbar' },
      h('div', { class: 'title-block' }, h('div', { class: 'sub' }, cap(fmtDateLong(now))), h('h1', null, 'Сегодня')),
      h('a', { class: 'icon-btn', href: '#/settings', 'aria-label': 'Настройки' }, icon('settings'))),
    hero, week, stats, ...quick, ...lastBlock,
    ...(!history.length && !tpls.length ? [empty('Добро пожаловать в Тренькинс', 'Записывай подходы, а прогресс и рекорды посчитаются сами.')] : []),
  );
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
