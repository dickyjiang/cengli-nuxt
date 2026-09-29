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
const started = ref(false)          // desktop: kartu hero dulu, deck setelah "Mulai vote"
const hot = ref(0)
const hotItems = computed(() => (first.value?.items ?? []).slice(0, 5))
onMounted(() => { const t = setInterval(() => { if (hotItems.value.length > 1) hot.value = (hot.value + 1) % hotItems.value.length }, 5000); onBeforeUnmount(() => clearInterval(t)) })

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
  cat.value = slug; started.value = true; voted.value = false; shareNote.value = ''
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
  const text = 'Cengli atau Bo Cengli? Ikut nilai.'
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
  <div :class="['stack', { started }]">
    <section class="hero">
      <h1>Adil atau nggak?</h1>
      <p>Kamu yang nilai. Vote aja.</p>
    </section>

    <div class="filters">
      <div v-if="hotItems.length" class="ticker">
        <strong>Hot Topik</strong>
        <span class="ticker-text">{{ hotItems[hot % hotItems.length].text }}</span>
      </div>
      <div v-if="cats?.items?.length" class="chips" role="group" aria-label="Kategori">
        <button type="button" :class="['chip', { on: cat === '' }]" :aria-pressed="cat === ''" @click="pickCat('')">Semua</button>
        <button v-for="c in cats.items" :key="c.id" type="button" :class="['chip', { on: cat === c.slug }]" :aria-pressed="cat === c.slug" @click="pickCat(c.slug)">{{ c.name }}</button>
      </div>
    </div>

    <section class="hero-card">
      <div class="thumbs" aria-hidden="true">
        <span class="thumb fair"><svg viewBox="0 0 24 24"><path d="M2 10h4v11H2zM8 21h9.4a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 18.8 10H14l.7-3.4a1.5 1.5 0 0 0-.4-1.4L13.5 3 8 10z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round" /></svg></span>
        <span class="thumb unfair"><svg viewBox="0 0 24 24" style="transform:rotate(180deg)"><path d="M2 10h4v11H2zM8 21h9.4a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 18.8 10H14l.7-3.4a1.5 1.5 0 0 0-.4-1.4L13.5 3 8 10z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round" /></svg></span>
      </div>
      <h2>Cengli - Bo Cengli?</h2>
      <p class="sub">Adil atau nggak?</p>
      <div class="row" style="justify-content:center;gap:.75rem">
        <button type="button" class="btn btn-ghost" @click="started = true">Mulai vote</button>
        <NuxtLink to="/tulis" class="btn btn-primary">Tulis kasus baru</NuxtLink>
      </div>
      <p class="note">Tanpa akun. Satu orang satu suara per kasus.</p>
    </section>

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
