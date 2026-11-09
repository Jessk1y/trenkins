// Клиент API бэкенда (Cloudflare Worker, папка server/).
const PROD_API = 'https://trenkins-api.jessk1y.workers.dev';
const isDev = ['localhost', '127.0.0.1'].includes(location.hostname);
export const API_BASE = isDev ? `http://${location.hostname}:8787` : PROD_API;

const LS_AUTH = 'trenkins.auth';
const ls = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch { /* приватный режим */ } },
};
export { ls };

/** { token, user: {id, login} } | null */
export const auth = {
  get() { return ls.get(LS_AUTH); },
  set(v) { ls.set(LS_AUTH, v); },
  clear() { ls.set(LS_AUTH, null); },
};

export class ApiError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

export async function api(method, path, body) {
  const a = auth.get();
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(a?.token ? { Authorization: `Bearer ${a.token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout?.(15000), // зависшее соединение — считаем обрывом и повторяем
    });
  } catch {
    throw new ApiError(0, 'Нет связи с сервером');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || `Ошибка ${res.status}`);
  return data;
}
