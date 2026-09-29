import type { H3Event } from 'h3'

export function useDB(event: H3Event): D1Database {
  const db = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)?.DB
  if (!db) throw createError({ statusCode: 500, statusMessage: 'Database belum terhubung (binding DB tidak ditemukan).' })
  return db
}

export const CHOICES = ['fair', 'unfair'] as const
export type Choice = (typeof CHOICES)[number]
export type Counts = Record<Choice, number>

export function emptyCounts(): Counts {
  return { fair: 0, unfair: 0 }
}

export async function countsFor(db: D1Database, ids: number[]): Promise<Map<number, Counts>> {
  const out = new Map<number, Counts>()
  if (!ids.length) return out
  const marks = ids.map(() => '?').join(',')
  const { results } = await db
    .prepare(`SELECT scenario_id, choice, COUNT(*) AS n FROM votes WHERE scenario_id IN (${marks}) GROUP BY scenario_id, choice`)
    .bind(...ids)
    .all<{ scenario_id: number; choice: Choice; n: number }>()
  for (const r of results) {
    const c = out.get(r.scenario_id) ?? emptyCounts()
    c[r.choice] = r.n
    out.set(r.scenario_id, c)
  }
  return out
}

export async function verifyTurnstile(event: H3Event, token: string | undefined): Promise<boolean> {
  const secret = useRuntimeConfig(event).turnstileSecret
  if (!secret) return true // dev: dilewati
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token })
  const ip = getRequestHeader(event, 'cf-connecting-ip')
  if (ip) body.set('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
  const json = (await res.json()) as { success?: boolean }
  return json.success === true
}
