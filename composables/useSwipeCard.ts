// Kartu ikut jempol: geser kiri/kanan, lepas cukup jauh (atau cukup cepat) = kartu terbang keluar.
// onFling boleh mengembalikan false untuk membiarkan kartu tetap di luar layar (mis. saat pindah halaman).
export function useSwipeCard(onFling: (dir: number) => void | boolean) {
  const dragX = ref(0)
  const dragging = ref(false)
  const flying = ref(false)
  let sx = 0, sy = 0, t0 = 0, tracking = false

  function down(e: PointerEvent) {
    if (flying.value) return
    sx = e.clientX; sy = e.clientY; t0 = Date.now(); tracking = true; dragging.value = false
  }
  function move(e: PointerEvent) {
    if (!tracking) return
    const dx = e.clientX - sx, dy = e.clientY - sy
    if (!dragging.value) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragging.value = true
        ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
      } else if (Math.abs(dy) > 10) { tracking = false; return }
      else return
    }
    dragX.value = dx
  }
  function up(e: PointerEvent) {
    if (!tracking) return
    tracking = false
    if (!dragging.value) return
    const dx = e.clientX - sx
    const speed = Math.abs(dx) / Math.max(Date.now() - t0, 1)
    dragging.value = false
    if (Math.abs(dx) > 100 || (Math.abs(dx) > 40 && speed > 0.5)) fling(Math.sign(dx) || -1)
    else dragX.value = 0
  }
  function cancel() {
    tracking = false; dragging.value = false
    if (!flying.value) dragX.value = 0
  }
  function fling(dir: number) {
    if (flying.value) return
    flying.value = true
    dragX.value = dir * ((import.meta.client ? window.innerWidth : 600) + 120)
    setTimeout(() => {
      const keep = onFling(dir) === false
      if (!keep) { dragX.value = 0; flying.value = false }
    }, 240)
  }

  const cardStyle = computed(() => dragX.value
    ? { transform: `translateX(${dragX.value}px) rotate(${dragX.value * 0.04}deg)`, opacity: flying.value ? 0 : 1 }
    : undefined)
  const progress = computed(() => Math.min(Math.abs(dragX.value) / 150, 1))

  return { dragging, flying, cardStyle, progress, fling, handlers: { onPointerdown: down, onPointermove: move, onPointerup: up, onPointercancel: cancel } }
}
