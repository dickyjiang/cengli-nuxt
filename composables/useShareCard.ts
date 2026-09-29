type Choice = 'fair' | 'unfair'

export interface ShareCardData {
  text: string
  counts: Record<Choice, number>
  pct: Record<Choice, number>
  my: Choice | null
  verdict: string
  verdictCls: string
}

const W = 1080
const H = 1350
const FAIR = '#1F7A4D'
const UNFAIR = '#C8402F'
const INK = '#141510'
const MUTED = '#6A6C62'
const BG = '#F1F2EE'
const DISPLAY = '"Fraunces", Georgia, "Times New Roman", serif'
const BODY = '"Geist", system-ui, -apple-system, "Segoe UI", sans-serif'

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const lines: string[] = []
  let cut = false
  outer: for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      // Kata yang lebih panjang dari lebar kartu dipecah per huruf.
      let w = word
      while (ctx.measureText(w).width > maxW) {
        let i = w.length
        while (i > 1 && ctx.measureText(w.slice(0, i)).width > maxW) i--
        if (line) { lines.push(line); line = '' }
        lines.push(w.slice(0, i)); w = w.slice(i)
        if (lines.length >= maxLines) { cut = true; break outer }
      }
      const next = line ? `${line} ${w}` : w
      if (ctx.measureText(next).width <= maxW) line = next
      else { lines.push(line); line = w; if (lines.length >= maxLines) { cut = true; break outer } }
    }
    lines.push(line)
    if (lines.length >= maxLines) { cut = lines.length > maxLines; break }
  }
  const out = lines.slice(0, maxLines)
  if (cut || lines.length > maxLines) {
    let last = out[out.length - 1] ?? ''
    while (last && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1)
    out[out.length - 1] = `${last}…`
  }
  return out
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// Menggambar kartu hasil (tanpa nav dan tombol) jadi gambar PNG 1080x1350.
export async function renderShareCard(d: ShareCardData): Promise<Blob> {
  try {
    await Promise.all([
      document.fonts.load(`700 60px ${DISPLAY}`),
      document.fonts.load(`500 40px ${BODY}`),
      document.fonts.load(`700 26px ${BODY}`)
    ])
  } catch { /* pakai font cadangan */ }

  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Latar
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, W, H)
  const tile = await loadImage('/tile.png')
  if (tile) {
    ctx.globalAlpha = 0.18
    const tw = 160 * 2
    const th = (tile.height / tile.width) * tw
    for (let y = 0; y < H; y += th) for (let x = 0; x < W; x += tw) ctx.drawImage(tile, x, y, tw, th)
    ctx.globalAlpha = 1
  }

  // Ukur cerita
  const cardX = 70, cardW = W - 140, pad = 56
  const innerX = cardX + pad, innerW = cardW - pad * 2
  ctx.font = `500 40px ${BODY}`
  const boxPad = 40
  const lines = wrap(ctx, d.text, innerW - boxPad * 2, 6)
  const lh = 58
  const storyH = lines.length * lh + boxPad * 2 - 12

  // Tinggi kartu
  const gap1 = 48, verdictH = 70, gap2 = 32, sideH = 56, pctH = 130, youH = 40, gap3 = 24, barH = 48, gap4 = 24, footH = 36
  const contentH = storyH + gap1 + verdictH + gap2 + sideH + pctH + youH + gap3 + barH + gap4 + footH
  const cardH = contentH + pad * 2
  const cardY = Math.round((H - cardH) / 2) - 10

  // Bayangan dan kartu
  ctx.save()
  ctx.shadowColor = 'rgba(20,21,16,.18)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18
  ctx.fillStyle = '#fff'; rr(ctx, cardX, cardY, cardW, cardH, 56); ctx.fill()
  ctx.restore()
  ctx.fillStyle = '#fff'; rr(ctx, cardX, cardY, cardW, cardH, 56); ctx.fill()
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; rr(ctx, cardX, cardY, cardW, cardH, 56); ctx.stroke()

  let y = cardY + pad

  // Cerita
  ctx.fillStyle = BG; rr(ctx, innerX, y, innerW, storyH, 36); ctx.fill()
  ctx.fillStyle = INK; ctx.font = `500 40px ${BODY}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'
  lines.forEach((l, i) => ctx.fillText(l, innerX + boxPad, y + boxPad + 38 + i * lh - 4))
  y += storyH + gap1

  // Verdict
  const vColor = d.verdictCls === 'fair' ? FAIR : d.verdictCls === 'unfair' ? UNFAIR : '#9A7412'
  ctx.fillStyle = vColor; ctx.font = `700 60px ${DISPLAY}`
  ctx.fillText(d.verdict, innerX, y + 52)
  y += verdictH + gap2

  // Label + persen
  ctx.font = `700 42px ${DISPLAY}`
  ctx.fillStyle = FAIR; ctx.textAlign = 'left'; ctx.fillText('Cengli', innerX, y + 42)
  ctx.fillStyle = UNFAIR; ctx.textAlign = 'right'; ctx.fillText('Bo Cengli', innerX + innerW, y + 42)
  y += sideH
  ctx.font = `700 118px ${DISPLAY}`
  ctx.fillStyle = FAIR; ctx.textAlign = 'left'; ctx.fillText(`${d.pct.fair}%`, innerX, y + 100)
  ctx.fillStyle = UNFAIR; ctx.textAlign = 'right'; ctx.fillText(`${d.pct.unfair}%`, innerX + innerW, y + 100)
  y += pctH
  ctx.font = `700 24px ${BODY}`
  if (d.my) {
    ctx.fillStyle = d.my === 'fair' ? FAIR : UNFAIR
    ctx.textAlign = d.my === 'fair' ? 'left' : 'right'
    ctx.fillText('PILIHANKU', d.my === 'fair' ? innerX : innerX + innerW, y + 24)
  }
  y += youH + gap3

  // Bar
  ctx.save()
  rr(ctx, innerX, y, innerW, barH, barH / 2); ctx.clip()
  ctx.fillStyle = '#E4E5DF'; ctx.fillRect(innerX, y, innerW, barH)
  const fw = (innerW * d.pct.fair) / 100
  ctx.fillStyle = FAIR; ctx.fillRect(innerX, y, fw, barH)
  ctx.fillStyle = UNFAIR; ctx.fillRect(innerX + fw, y, innerW - fw, barH)
  ctx.restore()
  ctx.lineWidth = 3; ctx.strokeStyle = '#D5D6D0'; rr(ctx, innerX, y, innerW, barH, barH / 2); ctx.stroke()
  y += barH + gap4

  // Jumlah suara
  ctx.font = `500 30px ${BODY}`; ctx.fillStyle = MUTED
  ctx.textAlign = 'left'; ctx.fillText(`${d.counts.fair} suara`, innerX, y + 28)
  ctx.textAlign = 'right'; ctx.fillText(`${d.counts.unfair} suara`, innerX + innerW, y + 28)

  // Merek di bawah kartu
  ctx.textAlign = 'center'
  ctx.font = `700 46px ${DISPLAY}`
  const a = 'CL', b = 'BCL'
  const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width
  const bx = W / 2 - (wa + wb) / 2
  ctx.textAlign = 'left'
  ctx.fillStyle = FAIR; ctx.fillText(a, bx, H - 96)
  ctx.fillStyle = UNFAIR; ctx.fillText(b, bx + wa, H - 96)
  ctx.textAlign = 'center'; ctx.fillStyle = MUTED; ctx.font = `500 28px ${BODY}`
  ctx.fillText('Adil atau nggak? Vote di cengli.men', W / 2, H - 50)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png')
  })
}
