// Moderasi lapis pertama tanpa AI.
//   reject  -> ditolak langsung, user diminta menulis ulang
//   pending -> disimpan, menunggu kamu setujui (status 'pending')
//   ok      -> langsung tayang
//
// Daftar kata di bawah hanya titik awal. Tambah sendiri sesuai yang muncul di produksi.
// Kata ditulis dalam bentuk yang sudah dinormalisasi (huruf kecil, tanpa angka pengganti huruf).

export type ModerationResult =
  | { verdict: 'ok' }
  | { verdict: 'pending'; reason: string }
  | { verdict: 'reject'; reason: string }

// Langsung ditolak. Kata <= 4 huruf hanya cocok sebagai kata utuh (lihat hits()).
export const HARD_WORDS: string[] = [
  // Indonesia / Betawi
  'anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'jancok', 'jancuk', 'pukimak', 'bajingan', 'asu',
  // Jawa / Sunda / Minang / lainnya
  'dancok', 'diancuk', 'kimak', 'pantek', 'puki', 'pepek', 'jembut', 'sundal', 'lonte',
  // Inggris
  'fuck', 'fucking', 'fucker', 'motherfucker', 'cunt', 'bitch', 'asshole', 'faggot', 'nigger', 'nigga',
  // SARA: hinaan langsung
  'cindo'
]

// Masuk antrean persetujuan (kasar ringan, ambigu, SARA, atau politik).
export const SOFT_WORDS: string[] = [
  // Kasar ringan
  'tolol', 'goblok', 'bego', 'brengsek', 'sialan', 'kampret', 'tai', 'sange', 'bokep', 'bunuh',
  'cuk', 'celeng', 'bacot', 'bangke', 'goblog', 'kehed', 'belegug', 'bodat', 'monyet', 'peler', 'titit', 'colmek',
  'jablay', 'pelacur', 'banci', 'bencong',
  // Kekerasan / seksual
  'bacok', 'gorok', 'perkosa', 'porno', 'porn',
  // Inggris
  'shit', 'shitty', 'bullshit', 'bastard', 'dick', 'slut', 'whore',
  // SARA
  'kafir', 'cino', 'aseng', 'pribumi', 'yahudi', 'agama', 'islam', 'kristen', 'katolik', 'hindu', 'budha', 'buddha', 'konghucu', 'ateis', 'atheis',
  // Politik praktis
  'pilpres', 'pilkada', 'pemilu', 'capres', 'cawapres', 'partai', 'pdip', 'gerindra', 'golkar', 'nasdem', 'pkb', 'pks',
  'prabowo', 'jokowi', 'gibran', 'anies', 'ganjar', 'megawati', 'cebong', 'kadrun', 'komunis', 'khilafah'
]

const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i'
}

// "A n j 1 n g" -> "anjing", "4nj1ng" -> "anjing", "anjiiiing" -> "anjing"
export function normalize(input: string): string {
  const lower = input.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  const mapped = Array.from(lower).map(ch => LEET[ch] ?? ch).join('')
  return mapped.replace(/(.)\1{2,}/g, '$1')
}

function squash(normalized: string): string {
  return normalized.replace(/[^a-z]/g, '')
}

// Kata pendek (<= 4 huruf) hanya cocok sebagai kata utuh, supaya "asu" tidak menangkap "asuransi".
function hits(normalized: string, list: string[]): string | null {
  const words = normalized.split(/[^a-z]+/).filter(Boolean)
  const squashed = squash(normalized)
  for (const bad of list) {
    if (words.includes(bad)) return bad
    if (bad.length > 4 && squashed.includes(bad)) return bad
  }
  return null
}

const TLDS = 'com|net|org|id|co|io|me|link|xyz|ly|ee|gl|gd|app|dev|site|online|shop|store|tv|cc|us|sg|my|biz|info|to|gg|cx|page|click|top|vip'
const URL_RE = new RegExp(`https?:\\/\\/|www\\.|\\b[a-z0-9-]+\\.(${TLDS})\\b|\\b(dot|titik)\\s*(com|co|id|net|org)\\b`, 'i')
const PHONE_RE = /(\d[\s.\-]?){8,}/
const HANDLE_RE = /@\w{3,}/
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/

export const MIN_LENGTH = 15
export const MAX_LENGTH = 500

export function moderate(text: string): ModerationResult {
  const t = text.trim()
  if (t.length < MIN_LENGTH) return { verdict: 'reject', reason: `Ceritanya terlalu singkat. Tulis minimal ${MIN_LENGTH} huruf.` }
  if (t.length > MAX_LENGTH) return { verdict: 'reject', reason: `Ceritanya terlalu panjang. Maksimal ${MAX_LENGTH} huruf.` }
  if (URL_RE.test(t)) return { verdict: 'reject', reason: 'Jangan cantumkan tautan.' }
  if (EMAIL_RE.test(t)) return { verdict: 'reject', reason: 'Jangan cantumkan alamat email.' }
  if (PHONE_RE.test(t)) return { verdict: 'reject', reason: 'Jangan cantumkan nomor telepon.' }
  if (HANDLE_RE.test(t)) return { verdict: 'reject', reason: 'Jangan cantumkan akun sosmed.' }

  const n = normalize(t)
  const hard = hits(n, HARD_WORDS)
  if (hard) return { verdict: 'reject', reason: 'Ada kata yang tidak diperbolehkan. Coba tulis dengan bahasa yang lebih netral.' }
  const soft = hits(n, SOFT_WORDS)
  if (soft) return { verdict: 'pending', reason: 'soft-word' }
  return { verdict: 'ok' }
}

// Nama kategori: 3-24 karakter, huruf/angka/spasi saja, tanpa kata terlarang.
export type CategoryResult = { ok: true; name: string; slug: string } | { ok: false; reason: string }

export function moderateCategory(input: string): CategoryResult {
  const name = input.replace(/\s+/g, ' ').trim()
  if (name.length < 3 || name.length > 24) return { ok: false, reason: 'Nama kategori 3 sampai 24 karakter.' }
  if (!/^[\p{L}\p{N} ]+$/u.test(name)) return { ok: false, reason: 'Nama kategori hanya boleh huruf, angka, dan spasi.' }
  const flat = normalize(name)
  if ([...HARD_WORDS, ...SOFT_WORDS].some(w => flat.includes(w))) return { ok: false, reason: 'Nama kategori tidak bisa dipakai. Coba kata lain.' }
  const title = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, '').trim().replace(/ +/g, '-')
  if (!slug) return { ok: false, reason: 'Nama kategori tidak valid.' }
  return { ok: true, name: title, slug }
}
