<script setup lang="ts">
interface Cat { id: number; name: string; slug: string }
const config = useRuntimeConfig()
const siteKey = config.public.turnstileSiteKey as string

// Turnstile: render eksplisit (aman untuk navigasi SPA) dan reset setelah tiap percobaan, karena token hanya berlaku sekali.
interface TurnstileApi { render: (el: HTMLElement, o: Record<string, unknown>) => string; reset: (id?: string) => void }
const tsEl = ref<HTMLElement | null>(null)
const tsToken = ref('')
let tsId: string | undefined
let poll: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => clearInterval(poll))
onMounted(() => {
  if (!siteKey) return
  let tries = 0
  const t = poll = setInterval(() => {
    const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile
    if (api && tsEl.value) {
      clearInterval(t)
      tsId = api.render(tsEl.value, {
        sitekey: siteKey,
        callback: (tok: string) => { tsToken.value = tok },
        'expired-callback': () => { tsToken.value = '' },
        'error-callback': () => { tsToken.value = '' }
      })
    } else if (++tries > 100) clearInterval(t)
  }, 100)
})
function resetTurnstile() {
  tsToken.value = ''
  const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile
  if (api && tsId) api.reset(tsId)
}

const { data: cats } = await useFetch<{ items: Cat[] }>('/api/categories')
const text = ref('')
const choice = ref<string>('')          // id kategori, atau '__new'
const newName = ref('')
const sending = ref(false)
const werr = ref('')
const done = ref<'' | 'published' | 'pending'>('')

async function submit() {
  if (sending.value) return
  werr.value = ''; sending.value = true
  const token = tsToken.value
  if (siteKey && !token) { werr.value = 'Tunggu verifikasi anti-bot selesai, lalu kirim lagi.'; sending.value = false; return }
  const body: Record<string, unknown> = { text: text.value, turnstileToken: token }
  if (choice.value === '__new') body.newCategory = newName.value
  else if (choice.value) body.categoryId = Number(choice.value)
  try {
    const r = await $fetch<{ id: number; status: string }>('/api/scenarios', { method: 'POST', body })
    done.value = r.status === 'published' ? 'published' : 'pending'
    if (r.status === 'published') await navigateTo(`/s/${r.id}`)
  } catch (e) {
    const m = e as { statusMessage?: string; data?: { statusMessage?: string } }
    werr.value = m?.data?.statusMessage || m?.statusMessage || 'Gagal mengirim. Coba lagi sebentar.'
  }
  if (siteKey && done.value !== 'published') resetTurnstile()
  sending.value = false
}
</script>

<template>
  <div class="stack">
    <section v-if="done === 'pending'" class="card" role="status">
      <h2>Terkirim</h2>
      <p class="msg">Kasusmu menunggu persetujuan sebelum tayang.</p>
      <NuxtLink to="/riwayat" class="btn btn-primary">Lihat di Riwayatku</NuxtLink>
      <NuxtLink to="/" class="btn btn-ghost">Kembali</NuxtLink>
    </section>

    <section v-else class="card" aria-labelledby="w-title">
      <h2 id="w-title">Ceritain kasusnya</h2>
      <form @submit.prevent="submit">
        <label for="story" class="msg">Singkat aja. Pakai inisial atau A, B, C. Jangan tulis nama lengkap, nomor HP, atau akun sosmed. Hindari SARA dan politik.</label>
        <textarea id="story" v-model="text" name="story" maxlength="500" placeholder="Contoh: Ada 2 temen deket A &amp; B. Si A lagi kejar satu cewe (C), tapi cewenya malah suka sama si B." />
        <span class="count">{{ text.length }} / 500</span>

        <div class="field">
          <label for="cat">Kategori</label>
          <select id="cat" v-model="choice">
            <option value="">Pilih kategori</option>
            <option v-for="c in cats?.items" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
            <option value="__new">+ Tambah kategori baru</option>
          </select>
        </div>
        <div v-if="choice === '__new'" class="field">
          <label for="newcat">Nama kategori baru</label>
          <input id="newcat" v-model="newName" type="text" maxlength="24" autocomplete="off" placeholder="Contoh: Rumah Sakit">
          <p class="msg">Kategori baru dicek dulu sebelum tampil. Sementara kasusmu masuk "Lainnya".</p>
          <button type="button" class="back-link linkish" @click="choice = ''; newName = ''">← Pilih dari daftar</button>
        </div>

        <p v-if="werr" class="msg err" role="alert">{{ werr }}</p>
        <div v-if="siteKey" ref="tsEl" />
        <p class="msg">Dengan mengirim, kamu setuju dengan <NuxtLink to="/aturan">Aturan &amp; Privasi</NuxtLink>. Jangan sebut nama asli atau data pribadi orang lain.</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="sending">{{ sending ? 'Mengirim...' : 'Kirim kasus' }}</button>
        <NuxtLink to="/" class="btn btn-ghost btn-block">Batal</NuxtLink>
      </form>
    </section>
  </div>
</template>
