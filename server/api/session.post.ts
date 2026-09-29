// POST /api/session { token } -> lolos Turnstile, terbitkan cookie sesi manusia (30 hari).
export default defineEventHandler(async (event) => {
  const secret = String(useRuntimeConfig(event).turnstileSecret || '')
  if (!secret) {
    if (import.meta.dev) return { ok: true }
    throw createError({ statusCode: 503, statusMessage: 'Server belum dikonfigurasi.' })
  }
  const body = await readBody<{ token?: string }>(event)
  if (!(await verifyTurnstile(event, body?.token))) {
    throw createError({ statusCode: 400, statusMessage: 'Verifikasi gagal. Muat ulang halaman lalu coba lagi.' })
  }
  setCookie(event, SESSION_COOKIE, await makeSessionValue(secret, event.context.voterId as string), {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60
  })
  return { ok: true }
})
