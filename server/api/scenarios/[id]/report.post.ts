// POST /api/scenarios/:id/report
// Setelah FLAG_AFTER laporan dari orang berbeda, kasus disembunyikan (status 'flagged') sampai kamu cek.
const FLAG_AFTER = 3

export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })

  await db
    .prepare('INSERT INTO reports (scenario_id, voter_id, created_at) VALUES (?, ?, ?) ON CONFLICT (scenario_id, voter_id) DO NOTHING')
    .bind(id, voterId, Date.now())
    .run()
  await db
    .prepare(
      `UPDATE scenarios SET status = 'flagged'
       WHERE id = ? AND status = 'published' AND (SELECT COUNT(*) FROM reports WHERE scenario_id = ?) >= ?`
    )
    .bind(id, id, FLAG_AFTER)
    .run()
  return { ok: true }
})
