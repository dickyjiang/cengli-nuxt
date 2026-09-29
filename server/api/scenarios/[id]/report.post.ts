// POST /api/scenarios/:id/report
// Setelah FLAG_AFTER laporan dari orang berbeda, kasus disembunyikan (status 'flagged') sampai kamu cek.
const FLAG_AFTER = 3
const REPORTS_PER_HOUR = 10

export default defineEventHandler(async (event) => {
  await requireHuman(event)
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })

  const exists = await db.prepare("SELECT 1 AS ok FROM scenarios WHERE id = ? AND status IN ('published', 'flagged')").bind(id).first()
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Kasus tidak ditemukan.' })
  const already = await db.prepare('SELECT 1 AS ok FROM reports WHERE scenario_id = ? AND voter_id = ?').bind(id, voterId).first()
  if (already) return { ok: true }
  const recent = await db.prepare('SELECT COUNT(*) AS n FROM reports WHERE voter_id = ? AND created_at > ?').bind(voterId, Date.now() - 60 * 60 * 1000).first<{ n: number }>()
  if ((recent?.n ?? 0) >= REPORTS_PER_HOUR) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak laporan dalam waktu singkat. Coba lagi nanti.' })

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
