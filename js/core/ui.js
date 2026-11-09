// Мини-набор UI: h() для DOM, иконки, нижние шторки (sheet), тосты, подтверждения, меню.

/**
 * h('div', { class: 'x', onclick: fn, style: {...}, dataset: {...} }, child, [children], 'text')
 * Атрибуты со значением false/null/undefined пропускаются. html: '...' — innerHTML (только доверенные строки!).
 */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    children.unshift(attrs); attrs = null;
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k in el && k !== 'list' && k !== 'form' && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}
function append(el, children) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// ---------- Иконки (stroke, 24×24) ----------
const P = {
  today: '<path d="M4 7h16M4 7v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2M8 2v4M16 2v4"/><path d="M8 13l3 3 5-6"/>',
  programs: '<path d="M6.5 6.5h11M6.5 17.5h11"/><rect x="2" y="4" width="4" height="16" rx="1"/><rect x="18" y="4" width="4" height="16" rx="1"/><path d="M12 6.5v11"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  progress: '<path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  note: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  swap: '<path d="M7 4L3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  plates: '<rect x="3" y="6" width="3" height="12" rx="1"/><rect x="7" y="8" width="2" height="8" rx="1"/><path d="M9 12h6"/><rect x="15" y="8" width="2" height="8" rx="1"/><rect x="18" y="6" width="3" height="12" rx="1"/>',
  play: '<path d="M7 5l12 7-12 7V5z"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  scale: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9a5 5 0 0 1 8 0l-3 3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
};
export function icon(name, cls = '') {
  const span = document.createElement('span');
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${P[name] || ''}</svg>`;
  return span.firstChild;
}

// ---------- Тосты ----------
export function toast(text, { action, onAction, ms = 2600 } = {}) {
  const root = document.getElementById('toast-root');
  const el = h('div', { class: 'toast', role: 'status' }, text,
    action && h('button', { onclick: () => { onAction?.(); el.remove(); } }, action));
  root.append(el);
  setTimeout(() => el.remove(), ms);
}

// ---------- Шторки ----------
const openSheets = [];
/**
 * sheet({ title, content: Node | (close)=>Node, tall, onClose, actions: Node }) → { close, el }
 */
export function sheet({ title, content, tall = false, onClose, headerRight } = {}) {
  const root = document.getElementById('sheet-root');
  const scrim = h('div', { class: 'sheet-scrim' });
  const panel = h('div', { class: 'sheet' + (tall ? ' tall' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title || '' });
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    scrim.remove(); panel.remove();
    openSheets.splice(openSheets.indexOf(close), 1);
    onClose?.();
  };
  scrim.addEventListener('click', close);
  const body = h('div', { class: 'sheet-body' });
  panel.append(
    h('div', { class: 'grab' }),
    (title || headerRight) ? h('div', { class: 'sheet-head' }, h('h3', null, title || ''), headerRight || null,
      h('button', { class: 'icon-btn', 'aria-label': 'Закрыть', onclick: close }, icon('close'))) : null,
    body,
  );
  const c = typeof content === 'function' ? content(close, body) : content;
  if (c) body.append(c);
  root.append(scrim, panel);
  openSheets.push(close);
  return { close, el: panel, body };
}
export function closeAllSheets() { [...openSheets].forEach((c) => c()); }

/** Меню действий: items = [{ label, icon, danger, onClick }] */
export function actionMenu(title, items) {
  const s = sheet({
    title,
    content: (close) => h('div', { class: 'menu' }, items.filter(Boolean).map((it) =>
      h('button', { class: it.danger ? 'danger' : '', onclick: () => { close(); it.onClick(); } },
        it.icon ? icon(it.icon) : null, it.label))),
  });
  return s;
}

/** Подтверждение внутри приложения (confirm() в PWA выглядит чужеродно). Возвращает Promise<boolean>. */
export function confirmSheet({ title, text, ok = 'Подтвердить', danger = false, cancel = 'Отмена' }) {
  return new Promise((resolve) => {
    let answered = false;
    sheet({
      title,
      onClose: () => { if (!answered) resolve(false); },
      content: (close) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        text ? h('p', { class: 'muted', style: { margin: '0 0 4px' } }, text) : null,
        h('button', { class: 'btn block lg ' + (danger ? 'danger' : 'primary'), onclick: () => { answered = true; close(); resolve(true); } }, ok),
        h('button', { class: 'btn block', onclick: () => { answered = true; close(); resolve(false); } }, cancel)),
    });
  });
}

/** Простой ввод текста/числа в шторке. Promise<string|null> */
export function promptSheet({ title, value = '', placeholder = '', ok = 'Сохранить', inputmode, multiline = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const input = multiline
      ? h('textarea', { class: 'textarea', placeholder, value })
      : h('input', { class: 'input', placeholder, value, inputmode: inputmode || false, enterkeyhint: 'done' });
    sheet({
      title,
      onClose: () => { if (!answered) resolve(null); },
      content: (close) => {
        const done = () => { answered = true; close(); resolve(input.value); };
        if (!multiline) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(); });
        setTimeout(() => input.focus(), 60);
        return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          input, h('button', { class: 'btn block primary', onclick: done }, ok));
      },
    });
  });
}

/** Заголовок экрана с кнопкой «назад» */
export function topbar({ title, sub, back, right }) {
  return h('div', { class: 'topbar' },
    back ? h('a', { class: 'icon-btn', href: back, 'aria-label': 'Назад', style: { marginLeft: '-10px' } }, icon('back')) : null,
    h('div', { class: 'title-block' },
      h('h1', { class: 'ellipsis', style: back ? { fontSize: '22px' } : null }, title),
      sub ? h('div', { class: 'sub' }, sub) : null),
    right || null);
}

export function empty(title, text, action) {
  return h('div', { class: 'empty' }, h('b', null, title), text ? h('div', null, text) : null, action || null);
}

/** Подключить стили экрана один раз: loadCss('css/views/history.css') */
export function loadCss(href) {
  if (document.querySelector(`link[data-view-css="${href}"]`)) return;
  document.head.append(h('link', { rel: 'stylesheet', href, 'data-view-css': href }));
}

/** Скачать файл (на iOS откроется «Поделиться/Сохранить в Файлы») */
export function downloadFile(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
