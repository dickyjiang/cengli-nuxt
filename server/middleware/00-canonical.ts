// Alamat pages.dev dialihkan permanen ke cengli.men supaya cookie, riwayat, dan SEO tidak terpecah.
// Hanya host produksi persis; preview branch (dev.cengli-nuxt.pages.dev) dan localhost tidak kena.
const LEGACY_HOST = 'cengli-nuxt.pages.dev'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (url.hostname !== LEGACY_HOST) return
  const target = new URL(url.pathname + url.search, useRuntimeConfig(event).public.siteUrl)
  return sendRedirect(event, target.toString(), 301)
})
