// Тонкая обёртка над IndexedDB. Все записи готовы к будущей синхронизации:
// у каждой есть id, createdAt, updatedAt и (при удалении) deletedAt — мягкое удаление.

const DB_NAME = 'trenkins';
const DB_VERSION = 1;
export const STORES = ['exercises', 'templates', 'programs', 'workouts', 'body', 'settings'];

let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let result;
    Promise.resolve(fn(s)).then((r) => { result = r; });
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export const db = {
  getAll: (store) => tx(store, 'readonly', (s) => reqP(s.getAll())),
  get: (store, id) => tx(store, 'readonly', (s) => reqP(s.get(id))),
  put: (store, obj) => tx(store, 'readwrite', (s) => { s.put(obj); }),
  putMany: (store, list) => tx(store, 'readwrite', (s) => { for (const o of list) s.put(o); }),
  hardDelete: (store, id) => tx(store, 'readwrite', (s) => { s.delete(id); }),
  clear: (store) => tx(store, 'readwrite', (s) => { s.clear(); }),
};

/** Просим браузер не вычищать данные (на iOS у PWA на экране «Домой» обычно и так ок). */
export async function requestPersist() {
  try { if (navigator.storage?.persist) return await navigator.storage.persist(); } catch { /* нет поддержки */ }
  return false;
}
