// "Sesi manusia": cookie cbc_ok = "<kedaluwarsa>.<tanda-tangan>", ditandatangani HMAC dan terikat ke id pengunjung (cbc_vid).
// Diterbitkan hanya setelah lolos Turnstile (POST /api/session), jadi skrip tidak bisa mencetak identitas tak terbatas
// dengan mengganti-ganti cookie. Vote dan laporan mewajibkannya, supaya kuota tulis D1 tidak bisa dihabiskan murah.
import type { H3Event } from 'h3'

export const SESSION_COOKIE = 'cbc_ok'
export const SESSION_DAYS = 30

function b64url(buf: ArrayBuffer) {
  let s = ''
  new Uint8Array(buf).forEach(b => (s += String.fromCharCode(b)))
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sign(secret: string, voterId: string, exp: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`cbc-ok:${voterId}:${exp}`)))
}

export async function makeSessionValue(secret: string, voterId: string, now = Date.now()) {
  const exp = now + SESSION_DAYS * 24 * 60 * 60 * 1000
  return `${exp}.${await sign(secret, voterId, exp)}`
}

export async function checkSessionValue(secret: string, voterId: string, value: string | undefined, now = Date.now()) {
  if (!value) return false
  const [expStr, sig] = value.split('.')
  const exp = Number(expStr)
  if (!sig || !Number.isFinite(exp) || exp < now) return false
  const good = await sign(secret, voterId, exp)
  if (good.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ sig.charCodeAt(i)
  return diff === 0
}

// Di dev tanpa secret pemeriksaan dilewati. Di produksi tanpa secret, semua tulisan ditolak (gagal tertutup).
export async function hasHumanSession(event: H3Event): Promise<boolean> {
  const secret = String(useRuntimeConfig(event).turnstileSecret || '')
  if (!secret) return !!import.meta.dev
  return checkSessionValue(secret, event.context.voterId as string, getCookie(event, SESSION_COOKIE))
}

export async function requireHuman(event: H3Event) {
  if (!(await hasHumanSession(event))) {
    throw createError({ statusCode: 403, statusMessage: 'Verifikasi dulu ya.', data: { code: 'human' } })
  }
}
