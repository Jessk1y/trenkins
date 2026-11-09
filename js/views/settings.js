// Экран «Настройки»: оформление, тренировка, профиль, оборудование, свои упражнения, бэкап.
import { h, icon, sheet, toast, confirmSheet, promptSheet, topbar, loadCss, downloadFile } from '../core/ui.js';
import { store } from '../core/store.js';
import { uid, fmtNum, parseNum, fmtDate, fmtTime } from '../core/util.js';
import { editExercise } from '../components/exercise-picker.js';

const APP_VERSION = '1.0';
const WEEK = 7 * 24 * 3600 * 1000;

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const sortPlates = (arr) => [...new Set(arr)].sort((a, b) => b - a);

export function render(root) {
  loadCss('css/views/settings.css');
  let alive = true;

  const draw = () => { if (alive) root.replaceChildren(...build().filter(Boolean)); };
  const save = (patch) => store.saveSettings(patch);

  // ---------- элементы ----------
  const section = (title, right) => h('div', { class: 'h2' }, title, right || null);

  const switchRow = (label, hint, key) => {
    const on = !!store.settings()[key];
    const sw = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(on), 'aria-label': label });
    const row = h('div', { class: 'row' },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, label), hint ? h('div', { class: 'meta' }, hint) : null), sw);
    const toggle = async () => {
      const next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(next));
      await save({ [key]: next });
    };
    row.addEventListener('click', toggle);
    return row;
  };

  /** Числовое поле в строке. onSave(n|null) → сохранение; ничего не пишет при невалидном вводе */
  const numRow = (label, value, unit, { min, max, digits = 1, onSave, placeholder }) => {
    const input = h('input', { class: 'input st-input', inputmode: 'decimal', placeholder: placeholder || '' });
    input.value = value == null ? '' : fmtNum(value, digits);
    input.addEventListener('change', async () => {
      const n = parseNum(input.value);
      if (n === null) { input.value = value == null ? '' : fmtNum(value, digits); return; }
      const v = clamp(n, min, max);
      input.value = fmtNum(v, digits);
      value = v;
      await onSave(v);
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
    return h('label', { class: 'row st-field' }, h('div', { class: 'grow title' }, label), input, h('span', { class: 'st-unit' }, unit));
  };

  // ---------- Оформление ----------
  function themeBlock() {
    const cur = store.settings().theme || 'dark';
    const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Тема' },
      [['dark', 'Тёмная'], ['light', 'Светлая'], ['system', 'Как в системе']].map(([k, l]) =>
        h('button', { class: k === cur ? 'on' : '', 'aria-pressed': String(k === cur), onclick: async () => {
          await save({ theme: k });
          seg.querySelectorAll('button').forEach((b, i) => {
            const on = ['dark', 'light', 'system'][i] === k;
            b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
          });
        } }, l)));
    return seg;
  }

  // ---------- Оборудование ----------
  function editBar(bar) {
    const isNew = !bar;
    const name = h('input', { class: 'input', value: bar?.name || '', placeholder: 'Например, Гриф для жима' });
    const weight = h('input', { class: 'input', inputmode: 'decimal', value: bar ? fmtNum(bar.weight, 2) : '', placeholder: '20' });
    const f = (l, c) => h('div', { class: 'field' }, h('label', null, l), c);
    sheet({
      title: isNew ? 'Новый гриф' : 'Гриф',
      content: (close) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h('div', { class: 'st-two' }, f('Название', name), f('Вес, кг', weight)),
        h('button', { class: 'btn primary block lg', onclick: async () => {
          const w = parseNum(weight.value);
          if (!name.value.trim()) { name.focus(); return; }
          if (w === null || w < 0 || w > 100) { weight.focus(); return; }
          const bars = store.settings().bars.map((b) => ({ ...b }));
          if (isNew) bars.push({ id: uid(), name: name.value.trim(), weight: w });
          else { const b = bars.find((x) => x.id === bar.id); if (b) { b.name = name.value.trim(); b.weight = w; } }
          await save({ bars }); close(); draw();
        } }, 'Сохранить'),
        isNew ? null : h('button', { class: 'btn danger block', onclick: async () => {
          close();
          const bars = store.settings().bars.filter((x) => x.id !== bar.id);
          await save({ bars }); draw();
          toast('Гриф удалён', { action: 'Вернуть', onAction: async () => { await save({ bars: [...store.settings().bars, bar] }); draw(); } });
        } }, 'Удалить гриф')),
    });
  }

  async function addPlate() {
    const v = await promptSheet({ title: 'Вес блина, кг', inputmode: 'decimal', placeholder: 'например 1,25', ok: 'Добавить' });
    const n = parseNum(v);
    if (n === null) return;
    if (n <= 0 || n > 100) { toast('Вес от 0 до 100 кг'); return; }
    await save({ plates: sortPlates([...store.settings().plates, n]) });
    draw();
  }
  async function removePlate(p) {
    await save({ plates: store.settings().plates.filter((x) => x !== p) });
    draw();
    toast(`Блин ${fmtNum(p, 2)} кг убран`, { action: 'Вернуть', onAction: async () => { await save({ plates: sortPlates([...store.settings().plates, p]) }); draw(); } });
  }

  // ---------- Свои упражнения ----------
  const myExercises = () => store.list('exercises').filter((e) => e.custom || (e.builtin && e.updatedAt))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  async function deleteExercise(ex) {
    const ok = await confirmSheet({
      title: ex.custom ? 'Удалить упражнение?' : 'Убрать упражнение из каталога?',
      text: `«${ex.name}» пропадёт из списка. В прошлых тренировках оно останется, но будет подписано как «Удалённое упражнение».`,
      ok: 'Удалить', danger: true,
    });
    if (!ok) return;
    await store.remove('exercises', ex.id);
    toast('Упражнение удалено');
    draw();
  }

  // ---------- Данные ----------
  const dateStr = (d) => { const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };

  async function backup() {
    const now = new Date();
    await save({ lastBackupAt: now.getTime() }); // до экспорта — чтобы дата попала и в сам файл
    downloadFile(`trenkins-${dateStr(now)}.json`, JSON.stringify(store.exportAll()));
    toast('Бэкап готов');
    draw();
  }

  function pickFile() {
    const input = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return;
      let json;
      try { json = JSON.parse(await file.text()); } catch { toast('Не удалось прочитать файл'); return; }
      if (!json || json.app !== 'trenkins' || !json.data) { toast('Это не файл бэкапа Тренькинса'); return; }
      chooseImport(json, file.name);
    });
    document.body.append(input);
    input.click();
  }

  function chooseImport(json, fileName) {
    const count = (k) => (json.data[k] || []).filter((o) => !o.deletedAt).length;
    const info = `${fileName}\nТренировок: ${count('workouts')} · программ: ${count('programs')} · шаблонов: ${count('templates')}`
      + (json.exportedAt ? `\nСоздан: ${fmtDate(json.exportedAt, { year: true })}, ${fmtTime(json.exportedAt)}` : '');
    sheet({
      title: 'Загрузить бэкап',
      content: (close) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('p', { class: 'muted small', style: { margin: 0, whiteSpace: 'pre-line' } }, info),
        h('button', { class: 'btn primary block lg', onclick: async () => {
          close(); await runImport(json, 'merge');
        } }, 'Объединить с текущими'),
        h('div', { class: 'small muted', style: { margin: '-4px 4px 0' } }, 'Остаётся более свежая версия каждой записи. Ничего не теряется.'),
        h('button', { class: 'btn danger block', onclick: async () => {
          close();
          const ok = await confirmSheet({ title: 'Заменить все данные?', text: 'Текущие тренировки, программы и настройки будут заменены содержимым файла. Это нельзя отменить.', ok: 'Заменить', danger: true });
          if (ok) await runImport(json, 'replace');
        } }, 'Заменить всё'),
        h('button', { class: 'btn block', onclick: close }, 'Отмена')),
    });
  }

  async function runImport(json, mode) {
    try { await store.importAll(json, mode); } catch (e) { toast(e.message || 'Не удалось загрузить'); return; }
    toast(mode === 'replace' ? 'Данные заменены' : 'Данные объединены');
    draw();
  }

  async function wipe() {
    const first = await confirmSheet({ title: 'Стереть все данные?', text: 'Будут удалены все тренировки, программы, упражнения и настройки на этом устройстве. Сначала сохрани бэкап.', ok: 'Продолжить', danger: true });
    if (!first) return;
    const second = await confirmSheet({ title: 'Точно стереть?', text: 'Последнее предупреждение: вернуть данные будет нельзя, если нет файла бэкапа.', ok: 'Стереть всё', danger: true });
    if (!second) return;
    try {
      const { db, STORES } = await import('../core/db.js');
      for (const s of STORES) await db.clear(s);
      indexedDB.deleteDatabase('trenkins'); // дожмётся, когда страница закроет соединение при перезагрузке
    } catch (e) { console.error(e); toast('Не удалось стереть данные'); return; }
    location.hash = '#/';
    location.reload();
  }

  // ---------- Сборка ----------
  function build() {
    const s = store.settings();
    const last = s.lastBackupAt;
    const hasData = store.list('workouts').length > 0 || store.list('programs').length > 0;
    const stale = last ? Date.now() - last > WEEK : hasData;
    const days = last ? Math.floor((Date.now() - last) / 86400000) : 0;

    const bars = s.bars || [];
    const plates = sortPlates(s.plates || []);
    const mine = myExercises();
    const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;

    return [
      topbar({ title: 'Настройки', back: '#/' }),

      section('Оформление'),
      themeBlock(),

      section('Тренировка'),
      h('div', { class: 'list' },
        numRow('Отдых по умолчанию', s.defaultRest, 'сек', { min: 10, max: 900, digits: 0, onSave: (v) => save({ defaultRest: Math.round(v) }) }),
        switchRow('Автозапуск таймера отдыха', 'После отметки подхода', 'autoRest'),
        switchRow('Не гасить экран', 'Во время тренировки', 'keepAwake'),
        switchRow('Подсказки прогрессии', 'Что взять на подходе по прошлым результатам', 'showProgressionHints')),

      section('Профиль'),
      h('div', { class: 'list' },
        numRow('Рост', s.profile?.height, 'см', { min: 100, max: 250, digits: 0, onSave: (v) => save({ profile: { ...store.settings().profile, height: Math.round(v) } }) }),
        numRow('Целевой вес', s.profile?.goalWeight, 'кг', { min: 30, max: 300, digits: 1, onSave: (v) => save({ profile: { ...store.settings().profile, goalWeight: v } }) })),

      section('Грифы', h('button', { onclick: () => editBar(null) }, '+ Добавить')),
      h('div', { class: 'list' },
        bars.length ? bars.map((b) => h('button', { class: 'row st-btn', onclick: () => editBar(b) },
          h('div', { class: 'grow' }, h('div', { class: 'title ellipsis' }, b.name)),
          h('span', { class: 'muted num' }, `${fmtNum(b.weight, 2)} кг`), icon('chev', 'chev')))
          : h('div', { class: 'row muted' }, 'Грифов нет — калькулятор блинов считает без них')),

      section('Блины', h('button', { onclick: addPlate }, '+ Добавить')),
      h('div', { class: 'list' }, plates.length
        ? h('div', { class: 'st-plates' }, plates.map((p) => h('button', { class: 'st-plate', 'aria-label': `Убрать блин ${fmtNum(p, 2)} кг`, onclick: () => removePlate(p) }, fmtNum(p, 2), icon('close'))))
        : h('div', { class: 'row muted' }, 'Блинов нет')),
      h('div', { class: 'st-note' }, 'Вес одного блина в кг. Калькулятор берёт пары блинов с каждой стороны грифа.'),

      section('Мои упражнения'),
      h('div', { class: 'list' }, mine.length
        ? mine.map((ex) => h('div', { class: 'row' },
          h('button', { class: 'grow', style: { textAlign: 'left' }, onclick: async () => { await editExercise(ex); draw(); } },
            h('div', { class: 'title ellipsis' }, ex.name),
            h('div', { class: 'meta' }, ex.custom ? 'Своё' : 'Изменено из каталога')),
          h('button', { class: 'icon-btn', 'aria-label': `Удалить ${ex.name}`, onclick: () => deleteExercise(ex) }, icon('trash'))))
        : h('div', { class: 'row muted' }, 'Пока нет. Свои упражнения добавляются из выбора упражнения в тренировке.')),

      section('Данные'),
      stale ? h('div', { class: 'st-banner' }, last
        ? `Последний бэкап был ${days} дн. назад. Сохрани новый — данные хранятся только в этом телефоне.`
        : 'Бэкапа ещё нет. Данные хранятся только в этом телефоне — сохрани файл.') : null,
      h('div', { class: 'list' },
        h('button', { class: 'row st-btn', onclick: backup }, icon('download'), h('div', { class: 'grow' }, 'Сохранить бэкап',
          h('div', { class: 'meta' }, last ? `Последний: ${fmtDate(last, { year: true })}, ${fmtTime(last)}` : 'Ещё не сохранялся'))),
        h('button', { class: 'row st-btn', onclick: pickFile }, icon('upload'), h('div', { class: 'grow' }, 'Загрузить бэкап', h('div', { class: 'meta' }, 'Файл .json из «Файлов»'))),
        h('button', { class: 'row st-btn danger', onclick: wipe }, icon('trash'), 'Стереть все данные')),
      h('div', { class: 'st-note' }, 'На iPhone после нажатия откроется меню «Поделиться» — выбери «Сохранить в Файлы». Если удалить иконку приложения с экрана «Домой», все данные пропадут, поэтому делай бэкап раз в неделю.'),

      section('О приложении'),
      h('div', { class: 'card' },
        h('div', { class: 'title', style: { fontWeight: '700' } }, standalone ? 'Приложение установлено' : 'Установка на iPhone'),
        h('div', { class: 'muted small', style: { marginTop: '4px' } }, standalone
          ? 'Открыто как приложение с экрана «Домой».'
          : 'Открой сайт в Safari → «Поделиться» → «На экран Домой». Так он работает как приложение и без интернета.')),
      h('div', { class: 'st-version' }, `Тренькинс · версия ${APP_VERSION}`),
    ];
  }

  draw();
  const off = store.on((kind) => { if (kind === '*') draw(); });
  return () => { alive = false; off(); };
}
