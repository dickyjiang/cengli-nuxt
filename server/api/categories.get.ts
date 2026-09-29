// GET /api/categories -> kategori yang sudah tayang, urut sort lalu id.
export default defineEventHandler(async (event) => {
  const db = useDB(event)
  const { results } = await db
    .prepare("SELECT id, name, slug FROM categories WHERE status = 'published' ORDER BY sort, id")
    .all<{ id: number; name: string; slug: string }>()
  return { items: results }
})
