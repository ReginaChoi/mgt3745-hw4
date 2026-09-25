-- schema.sql
-- One table, because F-03 stores one kind of thing: a piece of evidence
-- attached to one skill on one career path. A second table (for example,
-- separate accounts per student) is ADR-003 territory.

CREATE TABLE IF NOT EXISTS evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  evidence_text TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);