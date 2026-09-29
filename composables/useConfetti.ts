// Confetti kecil tanpa library: semburan dari titik (x, y), jatuh dengan gravitasi, lalu hilang.
export function useConfetti() {
  function fire(x: number, y: number, colors: string[]) {
    if (!import.meta.client) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const dpr = window.devicePixelRatio || 1
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50'
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) { canvas.remove(); return }
    ctx.scale(dpr, dpr)

    const parts = Array.from({ length: 80 }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9 // menyembur ke atas, agak melebar
      const v = 6 + Math.random() * 9
      return {
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
        r: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.4,
        c: colors[Math.floor(Math.random() * colors.length)],
        round: Math.random() < 0.3
      }
    })

    const t0 = performance.now(), LIFE = 1800
    const step = (now: number) => {
      const t = now - t0
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const alpha = t > LIFE * 0.6 ? Math.max(0, 1 - (t - LIFE * 0.6) / (LIFE * 0.4)) : 1
      ctx.globalAlpha = alpha
      for (const p of parts) {
        p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill() }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (t < LIFE) requestAnimationFrame(step)
      else canvas.remove()
    }
    requestAnimationFrame(step)
  }
  return { fire }
}
