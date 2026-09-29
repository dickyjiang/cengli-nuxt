# Cengli / Bo Cengli

Nuxt 3 + Cloudflare Pages + D1. Pengunjung anonim (cookie `cbc_vid`), satu suara per kasus, hasil hanya tampil setelah vote.

## Jalankan lokal
```bash
npm install
npm run db:local          # terapkan migrations/0001_init.sql ke D1 lokal
npm run build
npm run preview           # http://localhost:8788 (pakai binding D1 dari wrangler.toml)
npm run test:moderation   # tes filter kata
```
`npm run dev` menjalankan UI, tapi endpoint /api butuh binding D1, jadi untuk uji penuh pakai `build` + `preview`.

## Deploy
1. `npx wrangler d1 create cengli`, salin `database_id` ke `wrangler.toml`.
2. `npm run db:remote`
3. Buat proyek Cloudflare Pages dari repo ini. Build command `npm run build`, output `dist`.
4. Di Pages > Settings > Bindings, pastikan D1 `DB` mengarah ke database `cengli`.
5. Opsional, Turnstile: isi `NUXT_TURNSTILE_SECRET` (secret) dan `NUXT_PUBLIC_TURNSTILE_SITE_KEY`. Kosong = dilewati.

## Moderasi
- `server/utils/moderation.ts`: tolak tautan, email, nomor telepon, akun sosmed; `HARD_WORDS` ditolak, `SOFT_WORDS` masuk antrean `pending`. Daftar kata hanya titik awal, tambah sendiri.
- Rate limit: 3 kasus per jam per pengunjung. Laporan: 3 orang berbeda menyembunyikan kasus (`flagged`).
- Menyetujui kasus pending:
  `npx wrangler d1 execute cengli --remote --command "SELECT id, text FROM scenarios WHERE status='pending'"`
  `npx wrangler d1 execute cengli --remote --command "UPDATE scenarios SET status='published' WHERE id=2"`

## Belum ada
Halaman per kasus (`/s/[id]`) dan gambar OG, rate limit untuk vote, halaman admin.

## Kategori dan landing ver-02
- Landing = satu kartu kasus dengan efek tumpukan; vote mengubah isi kartu jadi hasil, lalu "Swipe untuk kasus berikutnya" + "Bagikan hasil" (link `/s/[id]`). Geser kiri = kasus berikutnya (Lewati kalau belum vote).
- Kategori: `GET /api/categories`; `/tulis` memilih kategori atau "+ Tambah kategori baru". Kategori baru berstatus `pending` (maks 2 per pengunjung per hari); selama pending kasusnya tampil sebagai "Lainnya".
- Menyetujui kategori: `wrangler d1 execute cengli --remote --command "UPDATE categories SET status='published', sort=100 WHERE slug='...'"` (tolak: status='rejected').
- Migrasi: `npm run db:local` menjalankan 0001 dan 0002.
- Tab "Sudah di-vote" dihapus dari landing; belum ada pengganti.
