// GET /api/scenarios/:id/results  (untuk tombol "Refresh hasil")
// Hasil hanya diberikan kepada yang sudah vote.
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })

  const mine = await db.prepare('SELECT choice FROM votes WHERE scenario_id = ? AND voter_id = ?').bind(id, voterId).first<{ choice: Choice }>()
  if (!mine) {
    const own = await db.prepare('SELECT 1 AS ok FROM scenarios WHERE id = ? AND author_id = ?').bind(id, voterId).first()
    if (!own) return { id, my: null, counts: null }
    return { id, my: null, counts: (await countsFor(db, [id])).get(id) ?? emptyCounts() }
  }
  const counts = (await countsFor(db, [id])).get(id) ?? emptyCounts()
  return { id, my: mine.choice, counts }
})
