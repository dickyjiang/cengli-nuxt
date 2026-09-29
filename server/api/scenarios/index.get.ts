// GET /api/scenarios?filter=new|voted&category=<slug>&before=<id>&limit=10
// Hasil vote hanya dikirim untuk kasus yang sudah di-vote oleh pengunjung ini.
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const q = getQuery(event)
  const filter = q.filter === 'voted' ? 'voted' : 'new'
  const limit = Math.min(Math.max(Number(q.limit) || 10, 1), 30)
  const before = Number(q.before) > 0 ? Number(q.before) : 2 ** 53 - 1

  const catSlug = typeof q.category === 'string' && /^[a-z0-9-]{1,40}$/.test(q.category) ? q.category : ''
  const voteCond = filter === 'voted' ? 'v.choice IS NOT NULL' : 'v.choice IS NULL'
  const { results } = await db
    .prepare(
      `SELECT s.id, s.text, s.created_at AS createdAt, v.choice AS my,
              CASE WHEN c.status = 'published' THEN c.name ELSE 'Lainnya' END AS category
       FROM scenarios s
       LEFT JOIN votes v ON v.scenario_id = s.id AND v.voter_id = ?
       LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.status = 'published' AND s.author_id <> ? AND s.id < ? AND ${voteCond}
         ${catSlug ? "AND c.status = 'published' AND c.slug = ?" : ''}
       ORDER BY s.id DESC
       LIMIT ?`
    )
    .bind(...(catSlug ? [voterId, voterId, before, catSlug, limit + 1] : [voterId, voterId, before, limit + 1]))
    .all<{ id: number; text: string; createdAt: number; my: Choice | null; category: string }>()

  const hasMore = results.length > limit
  const rows = results.slice(0, limit)
  const counts = await countsFor(db, rows.filter(r => r.my).map(r => r.id))
  return {
    items: rows.map(r => ({ ...r, counts: r.my ? (counts.get(r.id) ?? emptyCounts()) : null })),
    nextBefore: hasMore ? rows[rows.length - 1].id : null
  }
})
