// GET /api/admin/cases?q=<nomor|kata>&before=<id> -> cari semua kasus (semua status), 20 per halaman.
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDB(event)
  const q = getQuery(event)
  const term = typeof q.q === 'string' ? q.q.trim().slice(0, 100) : ''
  const before = Number(q.before)
  const conds: string[] = []
  const args: (string | number)[] = []
  if (/^#?\d+$/.test(term)) { conds.push('s.id = ?'); args.push(Number(term.replace('#', ''))) }
  else if (term) {
    conds.push("s.text LIKE ? ESCAPE '\\'")
    args.push(`%${term.replace(/[\\%_]/g, m => '\\' + m)}%`)
  }
  if (Number.isInteger(before) && before > 0) { conds.push('s.id < ?'); args.push(before) }
  const rows = await db
    .prepare(
      `SELECT s.id, s.text, s.status, s.created_at AS createdAt, s.author_id = 'seed' AS seed,
              s.category_id AS categoryId, c.name AS category,
              (SELECT COUNT(*) FROM votes v WHERE v.scenario_id = s.id) AS votes
       FROM scenarios s LEFT JOIN categories c ON c.id = s.category_id
       ${conds.length ? 'WHERE ' + conds.join(' AND ') : ''}
       ORDER BY s.id DESC LIMIT 21`
    )
    .bind(...args)
    .all<{ id: number }>()
  const items = rows.results.slice(0, 20)
  return { items, nextBefore: rows.results.length > 20 ? items[items.length - 1].id : null }
})
