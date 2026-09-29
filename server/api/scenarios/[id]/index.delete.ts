// DELETE /api/scenarios/:id -> penulis menghapus kasusnya sendiri (beserta suara dan laporan). Tidak bisa dibatalkan.
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })
  const own = await db.prepare('SELECT 1 AS ok FROM scenarios WHERE id = ? AND author_id = ?').bind(id, voterId).first()
  if (!own) throw createError({ statusCode: 404, statusMessage: 'Kasus tidak ditemukan.' })
  await db.batch([
    db.prepare('DELETE FROM votes WHERE scenario_id = ?').bind(id),
    db.prepare('DELETE FROM reports WHERE scenario_id = ?').bind(id),
    db.prepare('DELETE FROM scenarios WHERE id = ? AND author_id = ?').bind(id, voterId)
  ])
  return { ok: true }
})
