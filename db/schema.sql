-- Skema database Careerium (SQLite / libSQL / Turso)
-- Waktu disimpan sebagai epoch milidetik (INTEGER).
-- Teks CV mentah TIDAK PERNAH disimpan.

CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,       -- sudah dinormalisasi (trim + lowercase)
  password_hash  TEXT NOT NULL,
  recovery_hash  TEXT NOT NULL,
  created_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  success     INTEGER NOT NULL,              -- 0 / 1
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time
  ON login_attempts (email, created_at);

CREATE TABLE IF NOT EXISTS analyses (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_posisi  TEXT NOT NULL,
  tahap          TEXT NOT NULL,
  skor           INTEGER NOT NULL,
  skill_json     TEXT NOT NULL,
  gap_json       TEXT NOT NULL,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analyses_user_time
  ON analyses (user_id, created_at);

CREATE TABLE IF NOT EXISTS roadmap_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id  TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  minggu       INTEGER NOT NULL,
  isi_json     TEXT NOT NULL,
  selesai      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_roadmap_items_analysis
  ON roadmap_items (analysis_id);

CREATE TABLE IF NOT EXISTS interview_attempts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id       TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  percobaan_ke      INTEGER NOT NULL,
  skor_total        INTEGER NOT NULL,
  skor_detail_json  TEXT NOT NULL,
  created_at        INTEGER NOT NULL,
  UNIQUE (analysis_id, percobaan_ke)
);
