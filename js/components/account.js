// Блок «Аккаунт» в настройках: вход/регистрация, статус синхронизации, уведомления об отдыхе.
import { h, icon, sheet, toast } from '../core/ui.js';
import { fmtTime, fmtDate } from '../core/util.js';
import * as sync from '../core/sync.js';

/** Возвращает элемент, который сам обновляется при смене статуса. Вызови .destroy() при уходе с экрана. */
export function accountBlock() {
  const box = h('div', { class: 'acc' });
  const draw = () => box.replaceChildren(...content(sync.status()));
  const off = sync.onStatus(draw);
  draw();
  box.destroy = off;
  return box;
}

function content(s) {
  if (!s.user) {
    return [
      h('div', { class: 'card acc-card' },
        h('div', { class: 'acc-title' }, 'Синхронизация'),
        h('div', { class: 'muted small' }, 'Войди, чтобы тренировки были и на телефоне, и на компьютере, сохранялись на сервере и приходило уведомление «отдых окончен».'),
        h('div', { class: 'acc-btns' },
          h('button', { class: 'btn primary', onclick: () => authSheet('login') }, 'Войти'),
          h('button', { class: 'btn', onclick: () => authSheet('register') }, 'Создать аккаунт'))),
    ];
  }
  const when = s.lastSync ? `${fmtDate(s.lastSync)}, ${fmtTime(s.lastSync)}` : 'ещё не было';
  return [
    h('div', { class: 'list' },
      h('div', { class: 'row' },
        h('div', { class: 'acc-ava' }, s.user.login.slice(0, 1).toUpperCase()),
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, s.user.login),
          h('div', { class: 'meta' + (s.error ? ' acc-err' : '') }, s.busy ? 'Синхронизация…' : s.error ? s.error : `Синхронизировано: ${when}${s.pending ? ` · ждут отправки: ${s.pending}` : ''}`)),
        h('button', { class: 'icon-btn', 'aria-label': 'Синхронизировать сейчас', disabled: s.busy, onclick: () => sync.syncNow() }, icon('refresh'))),
      pushRow(s),
      s.pushOn ? h('button', { class: 'row st-btn', onclick: async () => {
        try { const r = await sync.testPush(); toast(r.sent ? 'Отправлено — уведомление придёт через пару секунд' : 'Нет подписанных устройств'); } catch (e) { toast(e.message); }
      } }, icon('bell'), h('div', { class: 'grow' }, 'Проверить уведомление')) : null,
      h('button', { class: 'row st-btn', onclick: logoutFlow }, icon('logout'), h('div', { class: 'grow' }, 'Выйти'))),
  ];
}

function pushRow(s) {
  const sw = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(s.pushOn), 'aria-label': 'Уведомление об окончании отдыха' });
  const row = h('div', { class: 'row' },
    h('div', { class: 'grow' }, h('div', { class: 'title' }, 'Уведомление «отдых окончен»'),
      h('div', { class: 'meta' }, 'Придёт, даже если телефон заблокирован')), sw);
  row.addEventListener('click', async () => {
    try {
      if (s.pushOn) { await sync.disablePush(); toast('Уведомления выключены'); }
      else { await sync.enablePush(); toast('Уведомления включены'); }
    } catch (e) { toast(e.message, { ms: 5000 }); }
  });
  return row;
}

function authSheet(mode) {
  const reg = mode === 'register';
  const login = h('input', { class: 'input', autocomplete: 'username', autocapitalize: 'none', placeholder: 'например, artem' });
  const pass = h('input', { class: 'input', type: 'password', autocomplete: reg ? 'new-password' : 'current-password', placeholder: reg ? 'минимум 6 символов' : '' });
  const invite = reg ? h('input', { class: 'input', autocapitalize: 'none', placeholder: 'выдаётся владельцем' }) : null;
  const err = h('div', { class: 'acc-err small', hidden: true });
  const f = (l, c) => h('div', { class: 'field' }, h('label', null, l), c);
  const btn = h('button', { class: 'btn primary block lg' }, reg ? 'Создать аккаунт' : 'Войти');

  const s = sheet({
    title: reg ? 'Новый аккаунт' : 'Вход',
    content: () => h('form', { class: 'acc-form', onsubmit: (e) => { e.preventDefault(); submit(); } },
      f('Логин', login), f('Пароль', pass), reg ? f('Код приглашения', invite) : null, err, btn,
      reg ? h('div', { class: 'muted small' }, 'Тренировки с этого устройства сразу попадут в новый аккаунт.') : null),
  });
  setTimeout(() => login.focus(), 50);

  async function submit() {
    err.hidden = true;
    btn.disabled = true;
    try {
      if (reg) await sync.register(login.value.trim(), pass.value, invite.value.trim());
      else {
        let keepLocal = false;
        if (sync.hasLocalData()) {
          keepLocal = await choice();
          if (keepLocal === null) return; // передумал
        }
        await sync.login(login.value.trim(), pass.value, { keepLocal });
      }
      s.close();
      toast(reg ? 'Аккаунт создан, данные загружены на сервер' : 'Готово, данные синхронизированы');
    } catch (e) {
      err.textContent = e.message; err.hidden = false;
    } finally { btn.disabled = false; }
  }
}

/** Что делать с данными устройства при входе: true — добавить в аккаунт, false — стереть, null — отмена */
function choice() {
  return new Promise((resolve) => {
    let done = false;
    const pick = (v, close) => { done = true; close(); resolve(v); };
    sheet({
      title: 'На этом устройстве уже есть тренировки',
      onClose: () => { if (!done) resolve(null); },
      content: (close) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('p', { class: 'muted', style: { margin: '0 0 4px' } }, 'Добавить их в аккаунт или стереть и загрузить тренировки с сервера?'),
        h('button', { class: 'btn primary block lg', onclick: () => pick(true, close) }, 'Добавить в аккаунт'),
        h('button', { class: 'btn danger block', onclick: () => pick(false, close) }, 'Стереть и загрузить с сервера'),
        h('button', { class: 'btn block', onclick: () => pick(null, close) }, 'Отмена')),
    });
  });
}

async function logoutFlow() {
  const wipe = await new Promise((resolve) => {
    let done = false;
    const pick = (v, close) => { done = true; close(); resolve(v); };
    sheet({
      title: 'Выйти из аккаунта?',
      onClose: () => { if (!done) resolve(null); },
      content: (close) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('p', { class: 'muted', style: { margin: '0 0 4px' } }, 'Данные на сервере останутся. Если это чужой телефон или компьютер — сотри их с устройства.'),
        h('button', { class: 'btn block lg', onclick: () => pick(false, close) }, 'Выйти, данные оставить'),
        h('button', { class: 'btn danger block', onclick: () => pick(true, close) }, 'Выйти и стереть с устройства'),
        h('button', { class: 'btn block', onclick: () => pick(null, close) }, 'Отмена')),
    });
  });
  if (wipe === null) return;
  await sync.logout({ wipe });
  toast('Ты вышел из аккаунта');
}
