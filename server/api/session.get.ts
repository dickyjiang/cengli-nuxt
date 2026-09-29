// GET /api/session -> { ok } apakah pengunjung ini sudah punya sesi manusia yang valid.
export default defineEventHandler(async (event) => ({ ok: await hasHumanSession(event) }))
