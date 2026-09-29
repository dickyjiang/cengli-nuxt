// Memberi setiap pengunjung id anonim lewat cookie. Dipakai untuk "satu orang satu suara" dan rate limit.
// Bukan pengaman anti-curang, cukup untuk game santai.
export default defineEventHandler((event) => {
  if (!getRequestURL(event).pathname.startsWith('/api/')) return
  let id = getCookie(event, 'cbc_vid')
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    id = crypto.randomUUID()
    setCookie(event, 'cbc_vid', id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !import.meta.dev,
      path: '/',
      maxAge: 60 * 60 * 24 * 365
    })
  }
  event.context.voterId = id
})
