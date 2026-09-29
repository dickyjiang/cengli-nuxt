// GET /api/admin/queue -> kasus pending/flagged dan kategori pending.
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const db = useDB(event)
  const scenarios = await db
    .prepare(
      `SELECT s.id, s.text, s.status, s.created_at AS createdAt,
              (SELECT COUNT(*) FROM reports r WHERE r.scenario_id = s.id) AS reports,
              c.name AS category, c.status AS categoryStatus
       FROM scenarios s LEFT JOIN categories c ON c.id = s.category_id
       WHERE s.status IN ('pending', 'flagged')
       ORDER BY s.id DESC LIMIT 100`
    )
    .all()
  const categories = await db
    .prepare(
      `SELECT c.id, c.name, c.slug, c.created_at AS createdAt,
              (SELECT COUNT(*) FROM scenarios s WHERE s.category_id = c.id) AS scenarios
       FROM categories c WHERE c.status = 'pending' ORDER BY c.id DESC LIMIT 100`
    )
    .all()
  const published = await db.prepare("SELECT id, name FROM categories WHERE status = 'published' ORDER BY sort, id").all()
  return { scenarios: scenarios.results, categories: categories.results, publishedCategories: published.results }
})
