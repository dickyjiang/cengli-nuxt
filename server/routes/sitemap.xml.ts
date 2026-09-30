// Sitemap untuk halaman publik yang boleh diindeks. Halaman kasus (/s/<id>) sengaja belum dimasukkan (noindex).
const PAGES = ['/', '/tentang', '/aturan']

export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/$/, '')
  const urls = PAGES.map(p => `  <url><loc>${site}${p === '/' ? '/' : p}</loc></url>`).join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
