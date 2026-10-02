-- Kategori Freelance & Klien (urusan freelancer dengan klien: nego harga, revisi, telat bayar, dsb).
-- Ditaruh setelah Di Kantor (40), sebelum Kuliah (42).
-- Kalau slug ini sudah pernah diusulkan pengunjung (pending), langsung dipublikasikan dan dirapikan.
INSERT OR IGNORE INTO categories (name, slug, status, sort, created_at) VALUES
  ('Freelance & Klien', 'freelance-klien', 'published', 41, 0);

UPDATE categories SET name = 'Freelance & Klien', status = 'published', sort = 41
WHERE slug = 'freelance-klien';

-- Kasus #38 ("klien kasih harga sekian, dengan provide alat...") belum punya kategori.
UPDATE scenarios SET category_id = (SELECT id FROM categories WHERE slug = 'freelance-klien')
WHERE id = 38 AND category_id IS NULL;
