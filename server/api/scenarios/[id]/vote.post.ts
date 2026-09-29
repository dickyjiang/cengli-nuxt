// POST /api/scenarios/:id/vote  { choice }
// Satu suara per orang, tidak bisa diganti. Mengembalikan hasil terbaru.
// Butuh sesi manusia (Turnstile) dan dibatasi VOTES_PER_HOUR per pengunjung, demi kuota tulis D1.
const VOTES_PER_HOUR = 120

export default defineEventHandler(async (event) => {
  await requireHuman(event)
  const db = useDB(event)
  const voterId = event.context.voterId as string
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ choice?: string }>(event)
  const choice = body?.choice as Choice

  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Kasus tidak valid.' })
  if (!CHOICES.includes(choice)) throw createError({ statusCode: 400, statusMessage: 'Pilihan tidak valid.' })

  const exists = await db.prepare("SELECT 1 AS ok FROM scenarios WHERE id = ? AND status = 'published'").bind(id).first()
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Kasus tidak ditemukan.' })

  const already = await db.prepare('SELECT choice FROM votes WHERE scenario_id = ? AND voter_id = ?').bind(id, voterId).first<{ choice: Choice }>()
  if (!already) {
    const recent = await db.prepare('SELECT COUNT(*) AS n FROM votes WHERE voter_id = ? AND created_at > ?').bind(voterId, Date.now() - 60 * 60 * 1000).first<{ n: number }>()
    if ((recent?.n ?? 0) >= VOTES_PER_HOUR) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak vote dalam waktu singkat. Istirahat sebentar ya.' })
  }

  if (!already) await db
    .prepare('INSERT INTO votes (scenario_id, voter_id, choice, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (scenario_id, voter_id) DO NOTHING')
    .bind(id, voterId, choice, Date.now())
    .run()

  const mine = await db.prepare('SELECT choice FROM votes WHERE scenario_id = ? AND voter_id = ?').bind(id, voterId).first<{ choice: Choice }>()
  const counts = (await countsFor(db, [id])).get(id) ?? emptyCounts()
  return { id, my: mine?.choice ?? choice, counts }
})
