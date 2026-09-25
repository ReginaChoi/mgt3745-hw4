-- schema.sql
-- One table: a piece of evidence a student attaches to a skill within a career path.
CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  evidence_text TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);