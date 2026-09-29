<script setup lang="ts">
type Choice = 'fair' | 'unfair'
interface Item { id: number; text: string; createdAt: number; my: Choice | null; counts: Record<Choice, number> | null; category?: string }
interface Page { items: Item[]; nextBefore: number | null }
interface Cat { id: number; name: string; slug: string }

const cat = ref('')
const items = ref<Item[]>([])
const nextBefore = ref<number | null>(null)
const idx = ref(0)
const loading = ref(false)
const loadErr = ref('')
const voted = ref(false)
const leaving = ref(false)
const shareNote = ref('')

const { data: cats } = await useFetch<{ items: Cat[] }>('/api/categories')
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
  cat.value = slug; voted.value = false; shareNote.value = ''
  load(true)
}

function advance() {
  if (leaving.value || !current.value) return
  leaving.value = true
  setTimeout(() => {
    idx.value++
    voted.value = false; shareNote.value = ''; leaving.value = false
    if (items.value.length - idx.value < 3 && nextBefore.value) load(false)
  }, 260)
}

function onVoted() { voted.value = true }

async function share() {
  const it = current.value
  if (!it) return
  const url = `${location.origin}/s/${it.id}`
  const text = 'Menurut kamu, cengli nggak? Vote dulu, baru lihat hasilnya.'
  try {
    if (navigator.share) { await navigator.share({ title: 'Cengli / Bo Cengli', text, url }); return }
    await navigator.clipboard.writeText(url)
    shareNote.value = 'Link disalin.'
  } catch { /* dibatalkan */ }
}

// Geser ke kiri = kasus berikutnya (untuk kartu yang belum di-vote artinya Lewati).
let startX = 0, startY = 0, tracking = false
function down(e: PointerEvent) { startX = e.clientX; startY = e.clientY; tracking = true }
function up(e: PointerEvent) {
  if (!tracking) return
  tracking = false
  const dx = e.clientX - startX, dy = e.clientY - startY
  if (dx < -80 && Math.abs(dx) > Math.abs(dy) * 1.5) advance()
}
</script>

<template>
  <div class="stack">
    <section class="hero">
      <h1>Adil atau nggak?</h1>
      <p>Kamu yang nilai. Vote aja.</p>
    </section>

    <div v-if="cats?.items?.length" class="chips" role="group" aria-label="Kategori">
      <button type="button" :class="['chip', { on: cat === '' }]" :aria-pressed="cat === ''" @click="pickCat('')">Semua</button>
      <button v-for="c in cats.items" :key="c.id" type="button" :class="['chip', { on: cat === c.slug }]" :aria-pressed="cat === c.slug" @click="pickCat(c.slug)">{{ c.name }}</button>
    </div>

    <div v-if="current" class="deck" @pointerdown="down" @pointerup="up" @pointercancel="tracking = false">
      <ScenarioCard :key="current.id" :item="current" :class="{ leaving }" @skip="advance" @voted="onVoted" />
    </div>

    <div v-else-if="!loading" class="card">
      <h2>{{ idx > 0 || cat ? 'Kasus di sini sudah habis' : 'Belum ada kasus' }}</h2>
      <p class="msg">Tulis kasusmu sendiri, atau cek lagi nanti.</p>
    </div>

    <p v-if="loadErr" class="msg err" role="alert">{{ loadErr }}</p>

    <div v-if="voted" class="after">
      <p class="swipe-hint">Swipe untuk kasus berikutnya</p>
      <div class="row" style="justify-content: center; gap: 0.75rem">
        <button type="button" class="btn btn-ghost" @click="advance">Berikutnya</button>
        <button type="button" class="btn btn-primary" @click="share">Bagikan hasil</button>
      </div>
      <p v-if="shareNote" class="msg" role="status">{{ shareNote }}</p>
    </div>
    <div v-else class="bottom">
      <NuxtLink to="/tulis" class="btn btn-ghost">+ Tambah Kasus Baru</NuxtLink>
    </div>
  </div>
</template>
