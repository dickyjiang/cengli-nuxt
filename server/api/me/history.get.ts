// GET /api/me/history?tab=voted|mine&before=<id>&limit=20
// Riwayat pengunjung ini (dikenali lewat cookie anonim): kasus yang sudah di-vote, atau kasus yang dia tulis.
// Hasil selalu disertakan, karena pengunjung sudah vote atau memang penulisnya.
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const q = getQuery(event)
  const tab = q.tab === 'mine' ? 'mine' : 'voted'
  const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 50)
  const before = Number(q.before) > 0 ? Number(q.before) : 2 ** 53 - 1

  const where = tab === 'mine' ? 's.author_id = ?' : "v.choice IS NOT NULL AND s.status = 'published'"
  const { results } = await db
    .prepare(
      `SELECT s.id, s.text, s.status, s.created_at AS createdAt, v.choice AS my,
              CASE WHEN c.status = 'published' THEN c.name ELSE 'Lainnya' END AS category
       FROM scenarios s
       LEFT JOIN votes v ON v.scenario_id = s.id AND v.voter_id = ?
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE ${where} AND s.id < ?
       ORDER BY s.id DESC
       LIMIT ?`
    )
    .bind(...(tab === 'mine' ? [voterId, voterId, before, limit + 1] : [voterId, before, limit + 1]))
    .all<{ id: number; text: string; status: string; createdAt: number; my: Choice | null; category: string }>()

  const hasMore = results.length > limit
  const rows = results.slice(0, limit)
  const counts = await countsFor(db, rows.map(r => r.id))
  return {
    items: rows.map(r => ({ ...r, counts: counts.get(r.id) ?? emptyCounts() })),
    nextBefore: hasMore ? rows[rows.length - 1].id : null
  }
})
