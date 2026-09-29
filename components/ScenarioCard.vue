<script setup lang="ts">
type Choice = 'fair' | 'unfair'
type Counts = Record<Choice, number>
interface Item { id: number; text: string; createdAt: number; my: Choice | null; counts: Counts | null; mine?: boolean }

const props = defineProps<{ item: Item }>()
const emit = defineEmits<{ skip: [id: number]; voted: [id: number] }>()

const LABELS: Record<Choice, string> = { fair: 'Cengli', unfair: 'Bo Cengli' }
const ORDER: Choice[] = ['fair', 'unfair']
const CHOICES: { key: Choice; big: string; sub: string }[] = [
  { key: 'fair', big: 'Cengli', sub: 'Adil, wajar aja' },
  { key: 'unfair', big: 'Bo Cengli', sub: 'Nggak adil' }
]

const my = ref<Choice | null>(props.item.my)
const counts = ref<Counts | null>(props.item.counts)
const busy = ref(false)
const err = ref('')
const animate = ref(false)
const shareNote = ref('')

// Penulis melihat hasil kasusnya sendiri tanpa perlu vote.
const showing = computed(() => !!my.value || (!!props.item.mine && !!counts.value))
const total = computed(() => (counts.value ? counts.value.fair + counts.value.unfair : 0))

// Largest remainder, supaya ketiga angka selalu berjumlah 100.
const pct = computed<Record<Choice, number>>(() => {
  const c = counts.value
  const out = { fair: 0, unfair: 0 } as Record<Choice, number>
  if (!c || !total.value) return out
  const raw = ORDER.map(k => (c[k] * 100) / total.value)
  const base = raw.map(Math.floor)
  let left = 100 - base.reduce((a, b) => a + b, 0)
  raw
    .map((r, i) => ({ i, r: r - Math.floor(r) }))
    .sort((a, b) => b.r - a.r)
    .forEach((o) => { if (left > 0) { base[o.i]++; left-- } })
  ORDER.forEach((k, i) => (out[k] = base[i]))
  return out
})

const verdict = computed(() => {
  const c = counts.value
  if (!c || !total.value) return { text: '', cls: '' }
  const top = [...ORDER].sort((a, b) => c[b] - c[a])
  if (c[top[0]] === c[top[1]]) return { text: 'Suara imbang', cls: 'tie' }
  return { text: `Mayoritas: ${LABELS[top[0]]}`, cls: top[0] }
})

function apiMessage(e: unknown, fallback: string) {
  const m = (e as { statusMessage?: string; data?: { statusMessage?: string } })
  return m?.data?.statusMessage || m?.statusMessage || fallback
}

// Angka persen menghitung naik dari 0 (atau dari nilai sebelumnya) ke hasil.
const shown = ref<Record<Choice, number>>({ fair: 0, unfair: 0 })
let raf = 0
function countUp() {
  if (!import.meta.client) return
  cancelAnimationFrame(raf)
  const to = { ...pct.value }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { shown.value = to; return }
  const from = { ...shown.value }
  const t0 = performance.now(), D = 900
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3)
    shown.value = { fair: Math.round(from.fair + (to.fair - from.fair) * e), unfair: Math.round(from.unfair + (to.unfair - from.unfair) * e) }
    if (k < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}
watch(pct, countUp)
onMounted(() => { if (counts.value) countUp() })
onBeforeUnmount(() => cancelAnimationFrame(raf))

const { fire } = useConfetti()
async function vote(choice: Choice, ev?: MouseEvent) {
  const rect = (ev?.currentTarget as HTMLElement | null)?.getBoundingClientRect()
  if (busy.value) return
  busy.value = true; err.value = ''
  try {
    const r = await $fetch<{ my: Choice; counts: Counts }>(`/api/scenarios/${props.item.id}/vote`, { method: 'POST', body: { choice } })
    animate.value = true
    my.value = r.my; counts.value = r.counts
    emit('voted', props.item.id)
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
    fire(x, y, choice === 'fair' ? ['#1F7A4D', '#3FAE78', '#F5C542', '#FFFFFF', '#141510'] : ['#C8402F', '#E9705F', '#F5C542', '#FFFFFF', '#141510'])
  } catch (e) { err.value = apiMessage(e, 'Vote gagal terkirim. Coba tekan lagi.') }
  busy.value = false
}

async function refresh() {
  if (busy.value) return
  busy.value = true; err.value = ''
  try {
    const r = await $fetch<{ my: Choice | null; counts: Counts | null }>(`/api/scenarios/${props.item.id}/results`)
    animate.value = true
    if (r.counts) counts.value = r.counts
  } catch (e) { err.value = apiMessage(e, 'Hasil belum bisa dimuat. Coba lagi.') }
  busy.value = false
}


async function share() {
  const url = `${location.origin}/s/${props.item.id}`
  const text = 'Cengli atau Bo Cengli? Ikut nilai.'
  try {
    // Utamakan gambar kartu hasil + link. Kalau perangkat tidak bisa berbagi file, kirim link saja.
    if (navigator.share && navigator.canShare && counts.value) {
      try {
        const blob = await renderShareCard({
          text: props.item.text, counts: counts.value, pct: pct.value, my: my.value,
          verdict: verdict.value.text, verdictCls: verdict.value.cls
        })
        const file = new File([blob], `cengli-${props.item.id}.png`, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Cengli / Bo Cengli', text: `${text}\n${url}` })
          return
        }
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return
      }
    }
    if (navigator.share) { await navigator.share({ title: 'Cengli / Bo Cengli', text, url }); return }
    await navigator.clipboard.writeText(url)
    shareNote.value = 'Link disalin.'
    setTimeout(() => { shareNote.value = '' }, 2500)
  } catch { /* dibatalkan */ }
}

defineExpose({ my, showing, total, busy, refresh })
</script>

<template>
  <article class="card">
    <p class="story">{{ item.text }}</p>

    <template v-if="!showing">
      <div class="votes">
        <button v-for="c in CHOICES" :key="c.key" type="button" :class="['btn', 'vote', c.key]" :disabled="busy" @click="vote(c.key, $event)">
          <img :src="c.key === 'unfair' ? '/thumbdown.svg' : '/thumbup.svg'" alt="" aria-hidden="true" width="34" height="40">
          <span class="big">{{ c.big }}</span><span class="sub">{{ c.sub }}</span>
        </button>
      </div>
      <div class="card-links">
        <button type="button" class="linkish" @click="emit('skip', item.id)">Lewati</button>
      </div>
    </template>

    <template v-else-if="counts">
      <p :class="['verdict', verdict.cls]">{{ verdict.text }}</p>
      <div class="split-head">
        <div v-for="(k, i) in ORDER" :key="k" :class="['side', k, { r: i === 1 }]">
          <span>{{ LABELS[k] }}</span>
          <span class="pct">{{ shown[k] }}%</span>
          <span v-if="k === my" class="you">Pilihanmu</span>
        </div>
      </div>
      <div class="split-track" role="img" :aria-label="`Cengli ${pct.fair} persen, Bo Cengli ${pct.unfair} persen`">
        <div v-for="k in ORDER" :key="k" :class="['seg', k]" :style="{ width: pct[k] + '%' }" />
      </div>
      <div class="split-foot"><span>{{ counts.fair }} suara</span><span>{{ counts.unfair }} suara</span></div>
      <div class="share-row">
        <button type="button" class="btn btn-primary" @click="share"><span class="ico" aria-hidden="true" />Share ke teman</button>
        <p v-if="shareNote" class="msg" role="status">{{ shareNote }}</p>
      </div>
    </template>

    <p v-if="err" class="msg err" role="alert">{{ err }}</p>
  </article>
</template>
