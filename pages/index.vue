<script setup lang="ts">
type Choice = 'fair' | 'unfair'
interface Item { id: number; text: string; createdAt: number; my: Choice | null; counts: Record<Choice, number> | null; category?: string }
interface Page { items: Item[]; nextBefore: number | null }
interface Cat { id: number; name: string; slug: string }

useHead({
  title: 'Cengli / Bo Cengli: Adil atau Nggak? Vote Kejadian Sehari-hari',
  meta: [{ name: 'description', content: 'Game polling santai: baca kejadian sehari-hari dari tetangga, pasangan, kantor sampai belanja online, vote adil atau nggak, lalu lihat hasilnya. Tanpa akun.' }]
})
const cat = ref('')
const items = ref<Item[]>([])
const nextBefore = ref<number | null>(null)
const idx = ref(0)
const loading = ref(false)
const loadErr = ref('')
const voted = ref(false)
const cardRef = ref<{ my: unknown; total: number; busy: boolean; refresh: () => void } | null>(null)
const started = ref(false)          // desktop: kartu hero dulu, deck setelah "Mulai vote"
const hot = ref(0)
const hotItems = computed(() => (first.value?.items ?? []).slice(0, 5))
onMounted(() => { const t = setInterval(() => { if (hotItems.value.length > 1) hot.value = (hot.value + 1) % hotItems.value.length }, 5000); onBeforeUnmount(() => clearInterval(t)) })

const { data: cats } = await useFetch<{ items: Cat[] }>('/api/categories')

// HP: chip dibagi ke dua baris (seimbang menurut panjang teks) yang bisa digeser bersama.
// Layar lebar: satu daftar berurutan yang membungkus otomatis (chipAll).
const chipAll = computed(() => [{ slug: '', name: 'Semua' }, ...(cats.value?.items ?? [])])
const chipRows = computed(() => {
  const rows: { slug: string; name: string }[][] = [[], []]
  const w = [0, 0]
  for (const c of chipAll.value) {
    const i = w[0] <= w[1] ? 0 : 1
    rows[i].push(c)
    w[i] += c.name.length + 4
  }
  return rows
})
const { data: first } = await useFetch<Page>('/api/scenarios', { query: { filter: 'new', limit: 10 } })
if (first.value) { items.value = first.value.items; nextBefore.value = first.value.nextBefore }

const current = computed(() => items.value[idx.value] ?? null)

async function load(reset: boolean) {
  if (loading.value) return
  loading.value = true; loadErr.value = ''
  try {
    const page = await $fetch<Page>('/api/scenarios', {
      query: { filter: 'new', category: cat.value || undefined, before: reset ? undefined : nextBefore.value ?? undefined, limit: 10 }
    })
    const seen = new Set(reset ? [] : items.value.map(i => i.id))
    items.value = (reset ? [] : items.value).concat(page.items.filter(i => !seen.has(i.id)))
    nextBefore.value = page.nextBefore
    if (reset) idx.value = 0
  } catch { loadErr.value = 'Kasus belum bisa dimuat. Coba lagi.' }
  loading.value = false
}

function pickCat(slug: string) {
  if (cat.value === slug) return
  cat.value = slug; started.value = true; voted.value = false
  load(true)
}

function goNext() {
  if (!current.value) return
  idx.value++
  voted.value = false
  if (items.value.length - idx.value < 3 && nextBefore.value) load(false)
}
const { dragging, cardStyle, progress, fling, handlers } = useSwipeCard(() => { goNext() })
function advance() { if (current.value) fling(-1) }

function onVoted() { voted.value = true }

// Klik Hot Topik: kasus itu jadi kartu pertama di deck (semua kategori), lalu geser lanjut seperti biasa.
function openHot(it: Item) {
  if (cat.value !== '') {
    cat.value = ''
    items.value = first.value?.items ?? []
    nextBefore.value = first.value?.nextBefore ?? null
  }
  items.value = [it, ...items.value.filter(i => i.id !== it.id)]
  idx.value = 0
  voted.value = false
  started.value = true
}

</script>

<template>
  <div :class="['stack', 'home', { started }]">
    <section class="hero">
      <h1>Adil atau nggak?</h1>
      <p>Kamu yang nilai. Vote aja.</p>
    </section>

    <div class="filters">
      <div v-if="hotItems.length" class="ticker">
        <strong>Hot Topik</strong>
        <Transition name="tick" mode="out-in">
          <button :key="hotItems[hot % hotItems.length].id" type="button" class="ticker-text" @click="openHot(hotItems[hot % hotItems.length])">{{ hotItems[hot % hotItems.length].text }}</button>
        </Transition>
      </div>
      <div v-if="cats?.items?.length" class="chips chips-m" role="group" aria-label="Kategori">
        <div v-for="(row, r) in chipRows" :key="r" class="chips-row">
          <button v-for="c in row" :key="c.slug || 'all'" type="button" :class="['chip', { on: cat === c.slug }]" :aria-pressed="cat === c.slug" @click="pickCat(c.slug)">{{ c.name }}</button>
        </div>
      </div>
      <div v-if="cats?.items?.length" class="chips chips-d" role="group" aria-label="Kategori">
        <button v-for="c in chipAll" :key="c.slug || 'all'" type="button" :class="['chip', { on: cat === c.slug }]" :aria-pressed="cat === c.slug" @click="pickCat(c.slug)">{{ c.name }}</button>
      </div>
    </div>

    <section class="hero-card">
      <div class="thumbs" aria-hidden="true">
        <span class="thumb fair"><img src="/thumbup.svg" alt="" width="41" height="48"></span>
        <span class="thumb unfair"><img src="/thumbdown.svg" alt="" width="41" height="48"></span>
      </div>
      <h2><span class="c-fair">Cengli</span> - <span class="c-unfair">Bo Cengli?</span></h2>
      <p class="sub">Adil atau nggak?</p>
      <div class="row" style="justify-content:center;gap:.75rem">
        <button type="button" class="btn btn-ghost" @click="started = true">Mulai vote</button>
        <NuxtLink to="/tulis" class="btn btn-primary">Tulis kasus baru</NuxtLink>
      </div>
    </section>

    <div v-if="current" :class="['deck', { dragging }]" :style="{ '--p': progress }" v-bind="handlers">
      <ScenarioCard ref="cardRef" :key="current.id" :item="current" :class="{ dragging }" :style="cardStyle" @skip="advance" @voted="onVoted" />
    </div>

    <div v-else-if="loading" class="loading" role="status"><LoadingThumb :size="72" /></div>

    <div v-else class="card">
      <h2>{{ idx > 0 || cat ? 'Kasus di sini sudah habis' : 'Belum ada kasus' }}</h2>
      <p class="msg">Tulis kasusmu sendiri, atau cek lagi nanti.</p>
    </div>

    <p v-if="loadErr" class="msg err" role="alert">{{ loadErr }}</p>

    <div v-if="voted" class="after">
      <ResultMeta v-if="cardRef" :total="cardRef.total" :busy="cardRef.busy" @refresh="cardRef.refresh()" />
      <p class="swipe-hint">Geser kartu untuk kasus lainnya</p>
      <button type="button" class="btn btn-ghost" @click="advance">Berikutnya</button>
    </div>
    <div v-else class="bottom">
      <NuxtLink to="/tulis" class="btn btn-ghost">+ Tambah Kasus Baru</NuxtLink>
    </div>

    <ReportLink v-if="current" :key="current.id" :id="current.id" />
  </div>
</template>
