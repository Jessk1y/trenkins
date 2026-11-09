// Проверка API на запущенном сервере: node tools/smoke.mjs [base] (по умолчанию http://localhost:8787)
// INVITE_CODE берётся из .dev.vars. Создаёт тестового пользователя smoke_<время>.
import { readFileSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:8787';
const invite = process.env.INVITE || (readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8').match(/^INVITE_CODE=(.+)$/m) || [])[1]?.trim();
const login = `smoke_${Date.now() % 1e8}`;
let token = null;
let failed = 0;

async function call(method, path, body, expect = 200) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5180', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  const ok = res.status === expect;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${method} ${path} → ${res.status}${ok ? '' : ' (ждали ' + expect + ') ' + JSON.stringify(data)}`);
  return { res, data };
}

await call('POST', '/api/register', { login, password: 'secret12', invite: 'wrong' }, 403);
await call('POST', '/api/register', { login, password: '123', invite }, 400);
const reg = await call('POST', '/api/register', { login, password: 'secret12', invite });
token = reg.data?.token;
await call('POST', '/api/register', { login, password: 'secret12', invite }, 409);
await call('GET', '/api/me');

const t0 = Date.now();
const w = { id: 'w1', name: 'День А', updatedAt: t0, createdAt: t0, items: [] };
const s1 = await call('POST', '/api/sync', { cursor: 0, changes: [{ store: 'workouts', id: 'w1', data: w }, { store: 'nope', id: 'x', data: {} }] });
if (s1.data.accepted !== 1 || s1.data.changes.length !== 1) { failed++; console.log('FAIL sync1', s1.data); }

// старая версия не должна перезаписать свежую
await call('POST', '/api/sync', { cursor: s1.data.cursor, changes: [{ store: 'workouts', id: 'w1', data: { ...w, name: 'старое', updatedAt: t0 - 1000 } }] });
// второе устройство: логин заново, тянет с нуля
const lg = await call('POST', '/api/login', { login, password: 'secret12' });
await call('POST', '/api/login', { login, password: 'wrong123' }, 401);
token = lg.data.token;
const s2 = await call('POST', '/api/sync', { cursor: 0, changes: [] });
if (s2.data.changes[0]?.data.name !== 'День А') { failed++; console.log('FAIL LWW', s2.data); }
// новое изменение видно по курсору
await call('POST', '/api/sync', { cursor: s2.data.cursor, changes: [{ store: 'workouts', id: 'w1', data: { ...w, name: 'новое', updatedAt: t0 + 1000 } }] });
const s3 = await call('POST', '/api/sync', { cursor: s2.data.cursor, changes: [] });
if (s3.data.changes[0]?.data.name !== 'новое') { failed++; console.log('FAIL cursor', s3.data); }

await call('GET', '/api/push/key');
await call('POST', '/api/push/subscribe', { subscription: { endpoint: 'http://bad' } }, 400);
await call('POST', '/api/rest', { at: Date.now() + 60000 });
await call('DELETE', '/api/rest');
await call('POST', '/api/logout');
await call('GET', '/api/me', null, 401);

const pre = await fetch(base + '/api/sync', { method: 'OPTIONS', headers: { Origin: 'https://jessk1y.github.io' } });
const acao = pre.headers.get('Access-Control-Allow-Origin');
console.log(`${acao === 'https://jessk1y.github.io' ? 'ok  ' : 'FAIL'} CORS → ${acao}`);
if (acao !== 'https://jessk1y.github.io') failed++;

console.log(failed ? `\n${failed} ошибок` : '\nвсё ок');
process.exit(failed ? 1 : 0);
