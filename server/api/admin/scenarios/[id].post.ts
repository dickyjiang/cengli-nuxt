// POST /api/admin/scenarios/:id  { action: 'approve' | 'reject' }
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDB(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ action?: string }>(event)
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })
  if (body?.action === 'approve') {
    await db.batch([
      db.prepare("UPDATE scenarios SET status = 'published' WHERE id = ?").bind(id),
      db.prepare('DELETE FROM reports WHERE scenario_id = ?').bind(id) // supaya tidak langsung ter-flag lagi
    ])
  } else if (body?.action === 'reject') {
    await db.prepare("UPDATE scenarios SET status = 'rejected' WHERE id = ?").bind(id).run()
  } else throw createError({ statusCode: 400, statusMessage: 'Aksi tidak valid.' })
  return { ok: true }
})
