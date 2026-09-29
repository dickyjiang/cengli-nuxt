// POST /api/scenarios/:id/vote  { choice }
// Satu suara per orang, tidak bisa diganti. Mengembalikan hasil terbaru.
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ choice?: string }>(event)
  const choice = body?.choice as Choice

  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })
  if (!CHOICES.includes(choice)) throw createError({ statusCode: 400, statusMessage: 'Pilihan tidak valid.' })

  const exists = await db.prepare("SELECT 1 AS ok FROM scenarios WHERE id = ? AND status = 'published'").bind(id).first()
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Kasus tidak ditemukan.' })

  await db
    .prepare('INSERT INTO votes (scenario_id, voter_id, choice, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (scenario_id, voter_id) DO NOTHING')
    .bind(id, voterId, choice, Date.now())
    .run()

  const mine = await db.prepare('SELECT choice FROM votes WHERE scenario_id = ? AND voter_id = ?').bind(id, voterId).first<{ choice: Choice }>()
  const counts = (await countsFor(db, [id])).get(id) ?? emptyCounts()
  return { id, my: mine?.choice ?? choice, counts }
})
