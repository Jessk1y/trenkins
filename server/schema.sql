-- Схема D1 для бэкенда Тренькинса. Повторный запуск безопасен.

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  login      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass       TEXT NOT NULL,              -- pbkdf2$<iter>$<salt b64u>$<hash b64u>
  rev        INTEGER NOT NULL DEFAULT 0, -- счётчик версий записей пользователя
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,           -- sha256(token), сам токен не храним
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device     TEXT,
  created_at INTEGER NOT NULL,
  last_seen  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

-- Все данные приложения: одна строка = одна запись IndexedDB (упражнение, шаблон, тренировка…)
CREATE TABLE IF NOT EXISTS records (
  user_id    TEXT NOT NULL,
  store      TEXT NOT NULL,
  id         TEXT NOT NULL,
  data       TEXT NOT NULL,              -- JSON записи целиком
  updated_at INTEGER NOT NULL,           -- updatedAt записи (часы клиента) — для «побеждает свежее»
  rev        INTEGER NOT NULL,           -- версия на сервере — для «дай всё, что новее курсора»
  PRIMARY KEY (user_id, store, id)
);
CREATE INDEX IF NOT EXISTS records_rev ON records(user_id, rev);

CREATE TABLE IF NOT EXISTS push_subs (
  endpoint   TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS push_subs_user ON push_subs(user_id);
