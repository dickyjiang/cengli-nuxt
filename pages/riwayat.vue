<script setup lang="ts">
type Choice = 'fair' | 'unfair'
interface Row { id: number; text: string; status: string; createdAt: number; my: Choice | null; category: string; counts: Record<Choice, number> }
interface Page { items: Row[]; nextBefore: number | null }

useHead({ title: 'Riwayatku | Cengli / Bo Cengli', meta: [{ name: 'robots', content: 'noindex' }] })

const tab = ref<'voted' | 'mine'>('voted')
const items = ref<Row[]>([])
const nextBefore = ref<number | null>(null)
const loading = ref(false)
const loaded = ref(false)
const err = ref('')
const confirmId = ref<number | null>(null)
const deleting = ref(false)

async function load(reset: boolean) {
  if (loading.value) return
  loading.value = true; err.value = ''
  try {
    const page = await $fetch<Page>('/api/me/history', { query: { tab: tab.value, before: reset ? undefined : nextBefore.value ?? undefined, limit: 20 } })
    items.value = reset ? page.items : items.value.concat(page.items)
    nextBefore.value = page.nextBefore
  } catch { err.value = 'Riwayat belum bisa dimuat. Coba lagi.' }
  loading.value = false; loaded.value = true
}
async function remove(id: number) {
  if (deleting.value) return
  deleting.value = true; err.value = ''
  try {
    await $fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(r => r.id !== id)
    confirmId.value = null
  } catch { err.value = 'Kasus belum bisa dihapus. Coba lagi.' }
  deleting.value = false
}
function pick(t: 'voted' | 'mine') { if (tab.value === t) return; tab.value = t; items.value = []; nextBefore.value = null; loaded.value = false; load(true) }
onMounted(() => load(true))

const STATUS: Record<string, string> = { published: 'Tayang', pending: 'Menunggu persetujuan', flagged: 'Disembunyikan', rejected: 'Ditolak' }
const LABEL: Record<Choice, string> = { fair: 'Cengli', unfair: 'Bo Cengli' }
function total(r: Row) { return r.counts.fair + r.counts.unfair }
function pctFair(r: Row) { const t = total(r); return t ? Math.round((r.counts.fair * 100) / t) : 0 }
function leader(r: Row) {
  if (!total(r)) return 'Belum ada suara'
  if (r.counts.fair === r.counts.unfair) return 'Suara imbang'
  return `Mayoritas: ${r.counts.fair > r.counts.unfair ? LABEL.fair : LABEL.unfair}`
}
</script>

<template>
  <div class="stack">
    <h1 class="page-title">Riwayatku</h1>
    <div class="hist-tabs" role="tablist">
      <button type="button" role="tab" :aria-selected="tab === 'voted'" :class="['chip', { on: tab === 'voted' }]" @click="pick('voted')">Sudah kamu vote</button>
      <button type="button" role="tab" :aria-selected="tab === 'mine'" :class="['chip', { on: tab === 'mine' }]" @click="pick('mine')">Kasusmu</button>
    </div>

    <ul v-if="items.length" class="hist">
      <li v-for="r in items" :key="r.id">
        <NuxtLink v-if="r.status === 'published' || tab === 'mine'" :to="`/s/${r.id}`" class="hist-row">
          <p class="hist-text">{{ r.text }}</p>
          <div class="hist-meta">
            <span class="tag">{{ r.category }}</span>
            <span v-if="tab === 'mine'" :class="['tag', 'st-' + r.status]">{{ STATUS[r.status] ?? r.status }}</span>
            <span v-if="r.my" :class="['tag', 'you-' + r.my]">Pilihanmu: {{ LABEL[r.my] }}</span>
          </div>
          <div class="hist-bar" role="img" :aria-label="`Cengli ${pctFair(r)} persen`">
            <span class="seg fair" :style="{ width: (total(r) ? pctFair(r) : 0) + '%' }" />
            <span class="seg unfair" :style="{ width: (total(r) ? 100 - pctFair(r) : 0) + '%' }" />
          </div>
          <p class="hist-foot"><span>{{ leader(r) }}</span><span>{{ total(r) }} suara</span></p>
        </NuxtLink>
        <template v-if="tab === 'mine'">
          <button v-if="confirmId !== r.id" type="button" class="hist-del" :aria-label="`Hapus kasus ${r.id}`" @click="confirmId = r.id">Hapus</button>
          <div v-else class="hist-confirm" role="alertdialog" aria-label="Konfirmasi hapus">
            <p>Hapus kasus ini? Suaranya ikut terhapus dan tidak bisa dikembalikan.</p>
            <div class="row">
              <button type="button" class="btn btn-primary btn-small" :disabled="deleting" @click="remove(r.id)">Ya, hapus</button>
              <button type="button" class="btn btn-ghost btn-small" :disabled="deleting" @click="confirmId = null">Batal</button>
            </div>
          </div>
        </template>
      </li>
    </ul>

    <p v-else-if="loaded && !loading" class="msg hist-empty">
      {{ tab === 'voted' ? 'Kamu belum vote satu kasus pun.' : 'Kamu belum menulis kasus.' }}
      <NuxtLink :to="tab === 'voted' ? '/' : '/tulis'" class="btn btn-ghost">{{ tab === 'voted' ? 'Mulai vote' : 'Tulis kasus baru' }}</NuxtLink>
    </p>
    <p v-else-if="loading" class="msg" role="status">Memuat...</p>

    <p v-if="err" class="msg err" role="alert">{{ err }}</p>
    <button v-if="nextBefore" type="button" class="btn btn-ghost" :disabled="loading" @click="load(false)">Muat lebih banyak</button>
    <p class="note-small">Riwayat tersimpan di browser ini. Kalau cookie dihapus atau pindah perangkat, riwayat tidak ikut.</p>
  </div>
</template>
