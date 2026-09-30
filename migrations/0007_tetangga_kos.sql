-- Kategori Tetangga & Kos + kasus contoh.
-- Jalankan setelah 0006. Kasus contoh ditandai author_id = 'seed'.
-- Hapus semua contoh kapan saja: DELETE FROM scenarios WHERE author_id = 'seed';

INSERT OR IGNORE INTO categories (name, slug, status, sort, created_at) VALUES
  ('Tetangga & Kos', 'tetangga-kos', 'published', 32, 0);

-- Pindahkan tiga kasus contoh lama yang memang soal tetangga dan kos.
UPDATE scenarios
SET category_id = (SELECT id FROM categories WHERE slug = 'tetangga-kos')
WHERE author_id = 'seed'
  AND (text LIKE 'Tagihan listrik dibagi dua sama teman kos%'
    OR text LIKE 'Tetangga parkir mobil menutup separuh gerbang%'
    OR text LIKE 'Tetangga sebelah karaoke sampai jam 11 malam%');

INSERT INTO scenarios (text, status, author_id, created_at, category_id) VALUES
('Teman satu kos naruh galon kosong di depan pintuku sudah tiga hari, katanya "biar kamu inget gantian isi". Aku merasa dijadikan pajangan. Adil nggak?', 'published', 'seed', 1700000101000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Tetangga nyalain speaker dangdut jam 6 pagi hari Minggu, katanya "biar semangat". Aku nyalain vacuum cleaner jam 6 pagi hari Senin sebagai balasan. Wajar nggak?', 'published', 'seed', 1700000102000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Ibu kos melarang bawa teman ke kamar setelah jam 9, tapi anaknya boleh bawa pacar sampai tengah malam. Aturannya cengli nggak sih?', 'published', 'seed', 1700000103000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Jemuran tetangga di lantai atas menetes ke jemuranku yang baru kering. Aku angkat jemuranku, dia malah bilang "kan cuma air". Siapa yang salah?', 'published', 'seed', 1700000104000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Ada yang menaruh sampah plastik di depan rumahku tiap malam. Aku sudah curiga ke tetangga sebelah, dan aku balikin sampahnya ke depan pagarnya. Wajar nggak?', 'published', 'seed', 1700000105000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Teman kos makan lauk dari kulkas bersama tanpa izin, meninggalkan sticky note "makasih ya, enak" di piringnya. Sopan sih, tapi tetap nggak adil, kan?', 'published', 'seed', 1700000106000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Tetangga pinjam tangga, gerobak, dan bor. Sudah setahun belum balik, sekarang dia malah minta pinjam mobil. Aku nolak, dan sekarang dibilang pelit. Adil nggak?', 'published', 'seed', 1700000107000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Satu kos pakai satu mesin cuci. Ada yang nyuci jam 2 pagi dan bajunya dibiarkan berhari-hari di dalam mesin. Kami yang lain harus nunggu. Salah nggak kalau bajunya kami keluarin?', 'published', 'seed', 1700000108000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Tetangga punya ayam jago yang berkokok jam 3 pagi. Aku bilang baik-baik, dia jawab "itu alarm alami, bersyukur dong". Aku boleh nggak bete?', 'published', 'seed', 1700000109000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Pemilik kos menaikkan harga 200 ribu per bulan tanpa menambah apa pun, alasannya "harga semua naik". Wi-Fi-nya bahkan masih sering putus. Wajar nggak?', 'published', 'seed', 1700000110000, (SELECT id FROM categories WHERE slug = 'tetangga-kos')),
('Tetangga bikin grup RT dan menegur orang di grup tiap ada motor yang parkir agak miring. Motornya sendiri parkir di trotoar. Adil nggak?', 'published', 'seed', 1700000111000, (SELECT id FROM categories WHERE slug = 'tetangga-kos'));
