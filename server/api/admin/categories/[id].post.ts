// POST /api/admin/categories/:id  { action: 'approve' | 'reject' | 'merge', targetId? }
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDB(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ action?: string; targetId?: number }>(event)
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kategori tidak valid.' })
  if (body?.action === 'approve') {
    await db.prepare("UPDATE categories SET status = 'published', sort = 100 WHERE id = ? AND status = 'pending'").bind(id).run()
  } else if (body?.action === 'reject') {
    await db.prepare("UPDATE categories SET status = 'rejected' WHERE id = ? AND status = 'pending'").bind(id).run()
  } else if (body?.action === 'merge') {
    const target = await db.prepare("SELECT id FROM categories WHERE id = ? AND status = 'published'").bind(body.targetId ?? 0).first()
    if (!target) throw createError({ statusCode: 422, statusMessage: 'Kategori tujuan tidak ditemukan.' })
    await db.batch([
      db.prepare('UPDATE scenarios SET category_id = ? WHERE category_id = ?').bind(body.targetId, id),
      db.prepare("DELETE FROM categories WHERE id = ? AND status = 'pending'").bind(id)
    ])
  } else throw createError({ statusCode: 400, statusMessage: 'Aksi tidak valid.' })
  return { ok: true }
})
