// GET /api/scenarios/:id  (halaman berbagi /s/:id)
// Hasil hanya dikirim kalau pengunjung ini sudah vote.
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })
  const row = await db
    .prepare(
      `SELECT s.id, s.text, s.created_at AS createdAt, v.choice AS my,
              CASE WHEN c.status = 'published' THEN c.name ELSE 'Lainnya' END AS category
       FROM scenarios s
       LEFT JOIN votes v ON v.scenario_id = s.id AND v.voter_id = ?
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.id = ? AND s.status = 'published'`
    )
    .bind(voterId, id)
    .first<{ id: number; text: string; createdAt: number; my: Choice | null; category: string }>()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Kasus tidak ditemukan.' })
  const counts = row.my ? ((await countsFor(db, [id])).get(id) ?? emptyCounts()) : null
  return { ...row, counts }
})
