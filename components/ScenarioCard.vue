<script setup lang="ts">
type Choice = 'fair' | 'unfair'
type Counts = Record<Choice, number>
interface Item { id: number; text: string; createdAt: number; my: Choice | null; counts: Counts | null }

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

async function vote(choice: Choice) {
  if (busy.value) return
  busy.value = true; err.value = ''
  try {
    const r = await $fetch<{ my: Choice; counts: Counts }>(`/api/scenarios/${props.item.id}/vote`, { method: 'POST', body: { choice } })
    animate.value = true
    my.value = r.my; counts.value = r.counts
    emit('voted', props.item.id)
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

</script>

<template>
  <article class="card">
    <p class="story">{{ item.text }}</p>

    <template v-if="!my">
      <div class="votes">
        <button v-for="c in CHOICES" :key="c.key" type="button" :class="['btn', 'vote', c.key]" :disabled="busy" @click="vote(c.key)">
          <svg viewBox="0 0 24 24" aria-hidden="true" :style="c.key === 'unfair' ? 'transform:rotate(180deg)' : undefined"><path d="M2 10h4v11H2zM8 21h9.4a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 18.8 10H14l.7-3.4a1.5 1.5 0 0 0-.4-1.4L13.5 3 8 10z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round" /></svg>
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
          <span class="pct">{{ pct[k] }}%</span>
          <span v-if="k === my" class="you">Pilihanmu</span>
        </div>
      </div>
      <div class="split-track" role="img" :aria-label="`Cengli ${pct.fair} persen, Bo Cengli ${pct.unfair} persen`">
        <div v-for="k in ORDER" :key="k" :class="['seg', k]" :style="{ width: pct[k] + '%' }" />
      </div>
      <div class="split-foot"><span>{{ counts.fair }} suara</span><span>{{ counts.unfair }} suara</span></div>
      <div class="foot">
        <p class="total">{{ total === 1 ? 'Baru kamu yang vote.' : `${total} orang sudah vote.` }}</p>
        <button type="button" class="btn btn-ghost btn-small" :disabled="busy" @click="refresh">{{ busy ? 'Memuat...' : 'Refresh hasil' }}</button>
      </div>
    </template>

    <p v-if="err" class="msg err" role="alert">{{ err }}</p>
  </article>
</template>
