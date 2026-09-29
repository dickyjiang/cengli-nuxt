import type { H3Event } from 'h3'

// Admin dilindungi satu token rahasia (NUXT_ADMIN_TOKEN) yang dikirim lewat header x-admin-token.
export function requireAdmin(event: H3Event) {
  const expected = String(useRuntimeConfig(event).adminToken || '')
  if (expected.length < 16) throw createError({ statusCode: 503, statusMessage: 'Admin belum dikonfigurasi (NUXT_ADMIN_TOKEN minimal 16 karakter).' })
  const given = String(getRequestHeader(event, 'x-admin-token') || '')
  let diff = given.length ^ expected.length
  for (let i = 0; i < expected.length; i++) diff |= (given.charCodeAt(i) || 0) ^ expected.charCodeAt(i)
  if (diff !== 0) throw createError({ statusCode: 401, statusMessage: 'Token salah.' })
}
