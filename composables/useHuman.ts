// Sesi manusia di sisi klien: satu kali Turnstile (tak terlihat kecuali diminta) lalu server memasang cookie sesi.
// Dipanggil di latar saat halaman dibuka, dan sebelum tiap vote atau laporan. Hasilnya di-memo, jadi tidak berulang.
interface TurnstileApi {
  render: (el: HTMLElement, o: Record<string, unknown>) => string
  remove?: (id?: string) => void
}

let pending: Promise<void> | null = null

export function useHuman() {
  const siteKey = useRuntimeConfig().public.turnstileSiteKey as string

  async function hasSession() {
    try { return (await $fetch<{ ok: boolean }>('/api/session')).ok } catch { return false }
  }

  async function solve() {
    if (!siteKey) throw new Error('no-site-key')
    let api: TurnstileApi | undefined
    for (let i = 0; i < 100 && !api; i++) {
      api = (window as unknown as { turnstile?: TurnstileApi }).turnstile
      if (!api) await new Promise(r => setTimeout(r, 100))
    }
    if (!api) throw new Error('no-turnstile')
    const el = document.createElement('div')
    el.className = 'human-box'
    document.body.appendChild(el)
    await new Promise<void>((resolve, reject) => {
      let id: string | undefined
      const done = (err?: unknown) => {
        clearTimeout(timer)
        try { if (id) api!.remove?.(id) } catch { /* abaikan */ }
        el.remove()
        err ? reject(err) : resolve()
      }
      const timer = setTimeout(() => done(new Error('timeout')), 30000)
      id = api!.render(el, {
        sitekey: siteKey,
        appearance: 'interaction-only',
        callback: async (token: string) => {
          try { await $fetch('/api/session', { method: 'POST', body: { token } }); done() } catch (e) { done(e) }
        },
        'error-callback': () => done(new Error('turnstile'))
      })
    })
  }

  function ensure(force = false): Promise<void> {
    if (!import.meta.client) return Promise.resolve()
    if (force || !pending) {
      pending = (async () => { if (!force && await hasSession()) return; await solve() })()
      pending.catch(() => { pending = null })
    }
    return pending
  }

  // Jalankan aksi tulis. Kalau server minta verifikasi (sesi habis), ulangi sekali setelah verifikasi ulang.
  async function guarded<T>(fn: () => Promise<T>): Promise<T> {
    await ensure()
    try { return await fn() } catch (e) {
      const code = (e as { data?: { data?: { code?: string } } })?.data?.data?.code
      if (code !== 'human') throw e
      await ensure(true)
      return await fn()
    }
  }

  return { ensure, guarded }
}
