// POST /api/scenarios  { text, categoryId? | newCategory?, turnstileToken }
const MAX_PER_HOUR = 3

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const body = await readBody<{ text?: string; categoryId?: number; newCategory?: string; turnstileToken?: string }>(event)
  const text = String(body?.text ?? '').trim()

  if (!(await verifyTurnstile(event, body?.turnstileToken))) {
    throw createError({ statusCode: 400, statusMessage: 'Verifikasi gagal. Muat ulang halaman lalu coba lagi.' })
  }

  const result = moderate(text)
  if (result.verdict === 'reject') throw createError({ statusCode: 422, statusMessage: result.reason })

  const now = Date.now()
  const recent = await db
    .prepare('SELECT COUNT(*) AS n FROM scenarios WHERE author_id = ? AND created_at > ?')
    .bind(voterId, now - 60 * 60 * 1000)
    .first<{ n: number }>()
  if ((recent?.n ?? 0) >= MAX_PER_HOUR) {
    throw createError({ statusCode: 429, statusMessage: 'Kamu sudah kirim beberapa kasus. Coba lagi satu jam lagi.' })
  }

  // Kategori: pilih dari daftar, atau usulkan yang baru (pending sampai disetujui).
  const now2 = now
  let categoryId: number | null = null
  let categoryName = 'Lainnya'
  if (typeof body?.newCategory === 'string' && body.newCategory.trim()) {
    const c = moderateCategory(body.newCategory)
    if (!c.ok) throw createError({ statusCode: 422, statusMessage: c.reason })
    const existing = await db.prepare('SELECT id, name, status FROM categories WHERE slug = ?').bind(c.slug).first<{ id: number; name: string; status: string }>()
    if (existing && existing.status === 'rejected') throw createError({ statusCode: 422, statusMessage: 'Nama kategori tidak bisa dipakai. Coba kata lain.' })
    if (existing) {
      categoryId = existing.id
      categoryName = existing.status === 'published' ? existing.name : 'Lainnya'
    } else {
      const made = await db.prepare('SELECT COUNT(*) AS n FROM categories WHERE created_by = ? AND created_at > ?').bind(voterId, now2 - 24 * 60 * 60 * 1000).first<{ n: number }>()
      if ((made?.n ?? 0) >= 2) throw createError({ statusCode: 429, statusMessage: 'Batas kategori baru hari ini sudah tercapai. Pilih dari daftar dulu ya.' })
      const row = await db.prepare("INSERT INTO categories (name, slug, status, sort, created_by, created_at) VALUES (?, ?, 'pending', 500, ?, ?) RETURNING id").bind(c.name, c.slug, voterId, now2).first<{ id: number }>()
      categoryId = row!.id
    }
  } else if (Number.isInteger(body?.categoryId)) {
    const cat = await db.prepare("SELECT id, name FROM categories WHERE id = ? AND status = 'published'").bind(body!.categoryId).first<{ id: number; name: string }>()
    if (!cat) throw createError({ statusCode: 422, statusMessage: 'Kategori tidak ditemukan.' })
    categoryId = cat.id; categoryName = cat.name
  }

  const status = result.verdict === 'ok' ? 'published' : 'pending'
  const row = await db
    .prepare('INSERT INTO scenarios (text, status, author_id, created_at, category_id) VALUES (?, ?, ?, ?, ?) RETURNING id')
    .bind(text, status, voterId, now, categoryId)
    .first<{ id: number }>()

  return { id: row!.id, status, text, createdAt: now, category: categoryName }
})
