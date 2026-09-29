-- Kategori kasus. Kategori baru dari pengunjung berstatus 'pending' sampai kamu setujui.
-- Selama pending, kasusnya ditampilkan sebagai "Lainnya" (lihat server/api/scenarios/index.get.ts).
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending', 'rejected')),
  sort INTEGER NOT NULL DEFAULT 100,
  created_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_categories_status_sort ON categories (status, sort, id);

INSERT INTO categories (name, slug, status, sort, created_at) VALUES
  ('Pertemanan', 'pertemanan', 'published', 10, 0),
  ('Bisnis', 'bisnis', 'published', 20, 0),
  ('Rumah Tangga', 'rumah-tangga', 'published', 30, 0),
  ('Di Kantor', 'di-kantor', 'published', 40, 0),
  ('Keluarga', 'keluarga', 'published', 50, 0),
  ('Lainnya', 'lainnya', 'published', 999, 0);

ALTER TABLE scenarios ADD COLUMN category_id INTEGER REFERENCES categories (id);
CREATE INDEX idx_scenarios_category ON scenarios (category_id, status, id DESC);
