// Sitemap untuk halaman publik yang boleh diindeks: halaman statis + semua kasus yang tayang (/s/<id>).
const PAGES = ['/', '/tentang', '/aturan']
const MAX_CASES = 5000

export default defineEventHandler(async (event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/$/, '')
  const urls = PAGES.map(p => `  <url><loc>${site}${p === '/' ? '/' : p}</loc></url>`)
  try {
    const { results } = await useDB(event)
      .prepare("SELECT id, created_at AS createdAt FROM scenarios WHERE status = 'published' ORDER BY id DESC LIMIT ?")
      .bind(MAX_CASES)
      .all<{ id: number; createdAt: number }>()
    for (const r of results) {
      const d = new Date(r.createdAt)
      const lastmod = Number.isNaN(d.getTime()) ? '' : `<lastmod>${d.toISOString().slice(0, 10)}</lastmod>`
      urls.push(`  <url><loc>${site}/s/${r.id}</loc>${lastmod}</url>`)
    }
  } catch { /* database tidak terjangkau: tetap sajikan halaman statis */ }
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
})
