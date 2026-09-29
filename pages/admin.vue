<script setup lang="ts">
interface Sc { id: number; text: string; status: string; createdAt: number; reports: number; category: string | null; categoryStatus: string | null }
interface Cat { id: number; name: string; slug: string; createdAt: number; scenarios: number }
interface Pub { id: number; name: string }
interface Queue { scenarios: Sc[]; categories: Cat[]; publishedCategories: Pub[] }

useHead({ title: 'Admin', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const token = ref('')
const q = ref<Queue | null>(null)
const err = ref('')
const busy = ref(false)
const mergeTo = ref<Record<number, string>>({})

onMounted(() => {
  try { token.value = sessionStorage.getItem('cbc_admin') || '' } catch { /* abaikan */ }
  if (token.value) load()
})

async function api<T>(url: string, opts: { method?: 'GET' | 'POST'; body?: Record<string, unknown> } = {}) {
  return await $fetch<T>(url, { method: opts.method, body: opts.body, headers: { 'x-admin-token': token.value } })
}
function msg(e: unknown) {
  const m = e as { statusMessage?: string; data?: { statusMessage?: string } }
  return m?.data?.statusMessage || m?.statusMessage || 'Gagal. Coba lagi.'
}
async function load() {
  busy.value = true; err.value = ''
  try {
    q.value = await api<Queue>('/api/admin/queue')
    try { sessionStorage.setItem('cbc_admin', token.value) } catch { /* abaikan */ }
  } catch (e) { q.value = null; err.value = msg(e) }
  busy.value = false
}
async function act(url: string, body: Record<string, unknown>) {
  busy.value = true; err.value = ''
  try { await api(url, { method: 'POST', body }); await load() } catch (e) { err.value = msg(e); busy.value = false }
}
function logout() { token.value = ''; q.value = null; try { sessionStorage.removeItem('cbc_admin') } catch { /* abaikan */ } }
const fmt = (t: number) => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
</script>

<template>
  <div class="stack">
    <section v-if="!q" class="card">
      <h2>Admin</h2>
      <form @submit.prevent="load">
        <div class="field">
          <label for="tok">Token admin</label>
          <input id="tok" v-model="token" type="password" autocomplete="off">
        </div>
        <p v-if="err" class="msg err" role="alert">{{ err }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="busy || !token">Masuk</button>
      </form>
    </section>

    <template v-else>
      <div class="row">
        <h2>Antrean</h2>
        <span><button type="button" class="linkish" @click="load">Muat ulang</button> · <button type="button" class="linkish" @click="logout">Keluar</button></span>
      </div>
      <p v-if="err" class="msg err" role="alert">{{ err }}</p>

      <h2>Kategori baru ({{ q.categories.length }})</h2>
      <p v-if="!q.categories.length" class="msg">Tidak ada.</p>
      <div v-for="c in q.categories" :key="c.id" class="card">
        <p class="story"><strong>{{ c.name }}</strong> · {{ c.scenarios }} kasus · {{ fmt(c.createdAt) }}</p>
        <div class="row">
          <button type="button" class="btn btn-primary btn-small" :disabled="busy" @click="act(`/api/admin/categories/${c.id}`, { action: 'approve' })">Setujui</button>
          <button type="button" class="btn btn-ghost btn-small" :disabled="busy" @click="act(`/api/admin/categories/${c.id}`, { action: 'reject' })">Tolak</button>
        </div>
        <div class="field">
          <label :for="`m${c.id}`">Gabungkan ke</label>
          <select :id="`m${c.id}`" v-model="mergeTo[c.id]">
            <option value="">Pilih kategori</option>
            <option v-for="p in q.publishedCategories" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
          </select>
          <button type="button" class="btn btn-ghost btn-small" :disabled="busy || !mergeTo[c.id]" @click="act(`/api/admin/categories/${c.id}`, { action: 'merge', targetId: Number(mergeTo[c.id]) })">Gabungkan</button>
        </div>
      </div>

      <h2>Kasus ({{ q.scenarios.length }})</h2>
      <p v-if="!q.scenarios.length" class="msg">Tidak ada.</p>
      <div v-for="s in q.scenarios" :key="s.id" class="card">
        <p class="msg">#{{ s.id }} · {{ s.status === 'flagged' ? `di-flag (${s.reports} laporan)` : 'menunggu' }} · {{ s.category || 'tanpa kategori' }}<template v-if="s.categoryStatus === 'pending'"> (kategori pending)</template> · {{ fmt(s.createdAt) }}</p>
        <p class="story">{{ s.text }}</p>
        <div class="row">
          <button type="button" class="btn btn-primary btn-small" :disabled="busy" @click="act(`/api/admin/scenarios/${s.id}`, { action: 'approve' })">Tayangkan</button>
          <button type="button" class="btn btn-ghost btn-small" :disabled="busy" @click="act(`/api/admin/scenarios/${s.id}`, { action: 'reject' })">Tolak</button>
        </div>
      </div>
    </template>
  </div>
</template>
