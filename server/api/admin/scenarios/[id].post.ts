// POST /api/admin/scenarios/:id  { action: 'approve' | 'reject' | 'move', categoryId? }
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDB(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ action?: string; categoryId?: number }>(event)
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })
  if (body?.action === 'approve') {
    await db.batch([
      db.prepare("UPDATE scenarios SET status = 'published' WHERE id = ?").bind(id),
      db.prepare('DELETE FROM reports WHERE scenario_id = ?').bind(id) // supaya tidak langsung ter-flag lagi
    ])
  } else if (body?.action === 'reject') {
    await db.prepare("UPDATE scenarios SET status = 'rejected' WHERE id = ?").bind(id).run()
  } else if (body?.action === 'move') {
    const cat = await db.prepare("SELECT id FROM categories WHERE id = ? AND status = 'published'").bind(body.categoryId ?? 0).first()
    if (!cat) throw createError({ statusCode: 400, statusMessage: 'Kategori tujuan tidak valid.' })
    await db.prepare('UPDATE scenarios SET category_id = ? WHERE id = ?').bind(body.categoryId, id).run()
  } else throw createError({ statusCode: 400, statusMessage: 'Aksi tidak valid.' })
  return { ok: true }
})
