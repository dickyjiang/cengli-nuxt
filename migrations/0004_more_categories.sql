-- Kategori tambahan: Suami Istri, Kuliah, Sekolah.
-- Urutan (sort): Pertemanan 10, Bisnis 20, Rumah Tangga 30, Di Kantor 40, Keluarga 50, Lainnya 999.
INSERT OR IGNORE INTO categories (name, slug, status, sort, created_at) VALUES
  ('Suami Istri', 'suami-istri', 'published', 35, 0),
  ('Kuliah', 'kuliah', 'published', 42, 0),
  ('Sekolah', 'sekolah', 'published', 44, 0);
