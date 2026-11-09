// API Тренькинса на Cloudflare Workers.
//  POST /api/register {login, password, invite}   → {token, user}
//  POST /api/login    {login, password}           → {token, user}
//  POST /api/logout
//  GET  /api/me                                    → {user}
//  POST /api/sync     {cursor, changes:[{store,id,data}]} → {cursor, changes:[{store,id,data}], more}
//  GET  /api/push/key                              → {key}
//  POST /api/push/subscribe   {subscription}
//  POST /api/push/unsubscribe {endpoint}
//  POST /api/rest     {at, title?, body?}          — запланировать push «отдых окончен»
//  DELETE /api/rest                                — отменить
//  POST /api/push/test                             — проверочный push сразу
// Авторизация: заголовок Authorization: Bearer <token>.

import { b64u, sendPush } from './webpush.js';

const STORES = new Set(['exercises', 'templates', 'programs', 'workouts', 'body', 'settings']);
const PBKDF2_ITER = 20000; // ограничение CPU бесплатного тарифа Workers
const PAGE = 500;

// ---------- помощники ----------
const enc = new TextEncoder();
const now = () => Date.now();
const randomToken = (n = 32) => b64u.encode(crypto.getRandomValues(new Uint8Array(n)));
async function sha256(str) { return b64u.encode(await crypto.subtle.digest('SHA-256', enc.encode(str))); }

async function pbkdf2(password, salt, iter) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64u.encode(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256));
}
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${PBKDF2_ITER}$${b64u.encode(salt)}$${await pbkdf2(password, salt, PBKDF2_ITER)}`;
}
async function checkPassword(password, stored) {
  const [, iter, salt, hash] = stored.split('$');
  const got = await pbkdf2(password, b64u.decode(salt), Number(iter));
  // сравнение без раннего выхода
  if (got.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

function cors(req, env, res) {
  const origin = req.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
  const h = new Headers(res.headers);
  if (origin && allowed.includes(origin)) {
    h.set('Access-Control-Allow-Origin', origin);
    h.set('Vary', 'Origin');
    h.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    h.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    h.set('Access-Control-Max-Age', '86400');
  }
  return new Response(res.body, { status: res.status, headers: h });
}

async function body(req) {
  try { return await req.json(); } catch { throw new HttpError(400, 'Неверный JSON'); }
}

async function auth(req, env) {
  const m = (req.headers.get('Authorization') || '').match(/^Bearer (.+)$/);
  if (!m) throw new HttpError(401, 'Нужен вход');
  const th = await sha256(m[1]);
  const row = await env.DB.prepare('SELECT u.id, u.login, s.last_seen FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?').bind(th).first();
  if (!row) throw new HttpError(401, 'Сессия истекла, войди заново');
  if (now() - row.last_seen > 3600_000) await env.DB.prepare('UPDATE sessions SET last_seen = ? WHERE token_hash = ?').bind(now(), th).run();
  return { id: row.id, login: row.login, tokenHash: th };
}

async function newSession(env, userId, device) {
  const token = randomToken();
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, device, created_at, last_seen) VALUES (?, ?, ?, ?, ?)')
    .bind(await sha256(token), userId, (device || '').slice(0, 120), now(), now()).run();
  return token;
}

function validLogin(login) {
  if (typeof login !== 'string' || !/^[\p{L}\p{N}_.-]{2,32}$/u.test(login.trim())) throw new HttpError(400, 'Логин: 2–32 символа — буквы, цифры, _ . -');
  return login.trim();
}

// ---------- обработчики ----------
const routes = {
  async 'POST /api/register'(req, env) {
    const b = await body(req);
    if (!env.INVITE_CODE || b.invite !== env.INVITE_CODE) throw new HttpError(403, 'Неверный код приглашения');
    const login = validLogin(b.login);
    if (typeof b.password !== 'string' || b.password.length < 6) throw new HttpError(400, 'Пароль — минимум 6 символов');
    const exists = await env.DB.prepare('SELECT 1 FROM users WHERE login = ?').bind(login).first();
    if (exists) throw new HttpError(409, 'Такой логин уже занят');
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO users (id, login, pass, rev, created_at) VALUES (?, ?, ?, 0, ?)').bind(id, login, await hashPassword(b.password), now()).run();
    return json({ token: await newSession(env, id, req.headers.get('User-Agent')), user: { id, login } });
  },

  async 'POST /api/login'(req, env) {
    const b = await body(req);
    const login = validLogin(b.login);
    const u = await env.DB.prepare('SELECT id, login, pass FROM users WHERE login = ?').bind(login).first();
    if (!u || typeof b.password !== 'string' || !(await checkPassword(b.password, u.pass))) throw new HttpError(401, 'Неверный логин или пароль');
    return json({ token: await newSession(env, u.id, req.headers.get('User-Agent')), user: { id: u.id, login: u.login } });
  },

  async 'POST /api/logout'(req, env) {
    const u = await auth(req, env);
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(u.tokenHash).run();
    return json({ ok: true });
  },

  async 'GET /api/me'(req, env) {
    const u = await auth(req, env);
    return json({ user: { id: u.id, login: u.login } });
  },

  /**
   * Синхронизация. Клиент присылает изменённые записи и свой курсор (последний виденный rev).
   * Запись принимается, если её updatedAt не старее серверной («побеждает свежее»).
   * В ответ — всё, что изменилось на сервере после курсора (порциями по PAGE).
   */
  async 'POST /api/sync'(req, env) {
    const u = await auth(req, env);
    const b = await body(req);
    const cursor = Number(b.cursor) || 0;
    // ответ ограничиваем по размеру: из России соединения с Cloudflare рвутся после ~16 КБ
    const maxBytes = Math.min(Math.max(Number(b.maxBytes) || 200_000, 2000), 1_000_000);
    const changes = Array.isArray(b.changes) ? b.changes : [];
    if (changes.length > 2000) throw new HttpError(413, 'Слишком много изменений за раз');

    let accepted = 0;
    if (changes.length) {
      const keys = changes.filter((c) => STORES.has(c.store) && typeof c.id === 'string' && c.data && typeof c.data === 'object');
      // текущие updated_at на сервере для присланных записей
      const existing = new Map();
      for (let i = 0; i < keys.length; i += 50) {
        const part = keys.slice(i, i + 50);
        const q = part.map(() => '(store = ? AND id = ?)').join(' OR ');
        const rows = await env.DB.prepare(`SELECT store, id, updated_at FROM records WHERE user_id = ? AND (${q})`)
          .bind(u.id, ...part.flatMap((c) => [c.store, c.id])).all();
        for (const r of rows.results) existing.set(`${r.store}/${r.id}`, r.updated_at);
      }
      const win = keys.filter((c) => {
        const cur = existing.get(`${c.store}/${c.id}`);
        return cur == null || (Number(c.data.updatedAt) || 0) > cur;
      });
      if (win.length) {
        const { rev } = await env.DB.prepare('UPDATE users SET rev = rev + ? WHERE id = ? RETURNING rev').bind(win.length, u.id).first();
        let r = rev - win.length;
        const stmts = win.map((c) => env.DB.prepare(
          `INSERT INTO records (user_id, store, id, data, updated_at, rev) VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT (user_id, store, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at, rev = excluded.rev`)
          .bind(u.id, c.store, c.id, JSON.stringify(c.data), Number(c.data.updatedAt) || 0, ++r));
        for (let i = 0; i < stmts.length; i += 100) await env.DB.batch(stmts.slice(i, i + 100));
        accepted = win.length;
      }
    }

    const rows = await env.DB.prepare('SELECT store, id, data, rev FROM records WHERE user_id = ? AND rev > ? ORDER BY rev LIMIT ?')
      .bind(u.id, cursor, PAGE + 1).all();
    const list = [];
    let size = 0;
    for (const r of rows.results.slice(0, PAGE)) {
      if (list.length && size + r.data.length > maxBytes) break;
      list.push(r); size += r.data.length;
    }
    return json({
      accepted,
      cursor: list.length ? list[list.length - 1].rev : cursor,
      more: rows.results.length > list.length,
      changes: list.map((r) => ({ store: r.store, id: r.id, data: JSON.parse(r.data) })),
    });
  },

  async 'GET /api/push/key'(req, env) { return json({ key: env.VAPID_PUBLIC || null }); },

  async 'POST /api/push/subscribe'(req, env) {
    const u = await auth(req, env);
    const { subscription: s } = await body(req);
    if (!s?.endpoint || !s.keys?.p256dh || !s.keys?.auth || !/^https:\/\//.test(s.endpoint)) throw new HttpError(400, 'Неверная подписка');
    await env.DB.prepare(`INSERT INTO push_subs (endpoint, user_id, p256dh, auth, created_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (endpoint) DO UPDATE SET user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`)
      .bind(s.endpoint, u.id, s.keys.p256dh, s.keys.auth, now()).run();
    return json({ ok: true });
  },

  async 'POST /api/push/unsubscribe'(req, env) {
    const u = await auth(req, env);
    const { endpoint } = await body(req);
    await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ? AND user_id = ?').bind(endpoint || '', u.id).run();
    return json({ ok: true });
  },

  async 'POST /api/push/test'(req, env) {
    const u = await auth(req, env);
    const sent = await pushToUser(env, u.id, { title: 'Тренькинс', body: 'Уведомления работают 💪', tag: 'test' });
    return json({ sent });
  },

  async 'POST /api/rest'(req, env) {
    const u = await auth(req, env);
    const b = await body(req);
    const at = Number(b.at);
    if (!at || at < now() - 5000 || at > now() + 3600_000) throw new HttpError(400, 'Неверное время');
    const stub = env.REST_TIMER.get(env.REST_TIMER.idFromName(u.id));
    await stub.fetch('https://do/set', { method: 'POST', body: JSON.stringify({ userId: u.id, at, title: String(b.title || 'Отдых окончен').slice(0, 80), body: String(b.body || 'Пора на следующий подход').slice(0, 160) }) });
    return json({ ok: true });
  },

  async 'DELETE /api/rest'(req, env) {
    const u = await auth(req, env);
    const stub = env.REST_TIMER.get(env.REST_TIMER.idFromName(u.id));
    await stub.fetch('https://do/clear', { method: 'POST' });
    return json({ ok: true });
  },
};

/** Шлёт push на все устройства пользователя, мёртвые подписки удаляет. Возвращает число доставленных. */
async function pushToUser(env, userId, payload) {
  if (!env.VAPID_PRIVATE_JWK) return 0;
  const subs = (await env.DB.prepare('SELECT endpoint, p256dh, auth FROM push_subs WHERE user_id = ?').bind(userId).all()).results;
  let ok = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      const status = await sendPush(s, payload, env);
      if (status === 404 || status === 410) await env.DB.prepare('DELETE FROM push_subs WHERE endpoint = ?').bind(s.endpoint).run();
      else if (status >= 200 && status < 300) ok++;
      else console.warn('push', status, s.endpoint.slice(0, 40));
    } catch (e) { console.error('push error', e); }
  }));
  return ok;
}

// ---------- Таймер отдыха: один Durable Object на пользователя, будильник = момент конца отдыха ----------
export class RestTimer {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(req) {
    const path = new URL(req.url).pathname;
    if (path === '/set') {
      const job = await req.json();
      await this.state.storage.put('job', job);
      await this.state.storage.setAlarm(job.at);
    } else {
      await this.state.storage.delete('job');
      await this.state.storage.deleteAlarm();
    }
    return new Response('ok');
  }
  async alarm() {
    const job = await this.state.storage.get('job');
    if (!job) return;
    await this.state.storage.delete('job');
    const sent = await pushToUser(this.env, job.userId, { title: job.title, body: job.body, tag: 'rest', url: './#/workout' });
    console.log(`rest alarm: отправлено ${sent}`);
  }
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return cors(req, env, new Response(null, { status: 204 }));
    const url = new URL(req.url);
    const handler = routes[`${req.method} ${url.pathname}`];
    let res;
    try {
      res = handler ? await handler(req, env) : json({ error: 'Не найдено' }, 404);
    } catch (e) {
      if (e instanceof HttpError) res = json({ error: e.message }, e.status);
      else { console.error(e); res = json({ error: 'Ошибка сервера' }, 500); }
    }
    return cors(req, env, res);
  },
};
