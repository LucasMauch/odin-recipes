-- D1: un solo tipo de fila «evento» (repaso o prueba), idempotente por (usuario, id).
CREATE TABLE IF NOT EXISTS usuarios (
  hash    TEXT PRIMARY KEY,           -- SHA-256 hex del código de acceso (el código nunca se guarda)
  creado  INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS eventos (
  seq     INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario TEXT NOT NULL REFERENCES usuarios(hash),
  id      TEXT NOT NULL,
  tipo    TEXT NOT NULL CHECK (tipo IN ('r','p')),
  datos   TEXT NOT NULL,              -- JSON del evento
  UNIQUE (usuario, id)
);
CREATE INDEX IF NOT EXISTS eventos_usuario_seq ON eventos(usuario, seq);
