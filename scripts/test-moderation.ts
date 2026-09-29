import { moderate, normalize } from '../server/utils/moderation.ts'

const cases: [string, string][] = [
  ['Ada 2 temen deket A & B, si A lagi kejar satu cewe (C), terus si cewenya malah suka sama si B.', 'ok'],
  ['Kami bayar asuransi bareng dan salah satu telat bayar, apakah adil?', 'ok'],
  ['Si A selingkuh sama temen B, terus B nggak mau cerita ke siapa pun.', 'ok'],
  ['Si A itu a n j 1 n g banget sama temennya sendiri di kantor', 'reject'],
  ['Si B 4nj1ng banget sih kelakuannya ke A', 'reject'],
  ['Hubungi saya di 0812 3456 7890 buat cerita lengkapnya ya', 'reject'],
  ['Cerita lengkap ada di https://contoh.com/abc ya semuanya', 'reject'],
  ['Follow @budisantoso buat lihat kelanjutan cerita ini ya', 'reject'],
  ['Si A bilang B tolol di depan semua orang kantor kemarin', 'pending'],
  ['terlalu pendek', 'reject']
]
let fail = 0
for (const [t, want] of cases) {
  const got = moderate(t).verdict
  const okk = got === want
  if (!okk) fail++
  console.log(okk ? 'PASS' : 'FAIL', want.padEnd(8), got.padEnd(8), JSON.stringify(t.slice(0, 50)))
}
console.log('normalize:', normalize('4nj1ngggg'))
process.exit(fail ? 1 : 0)
