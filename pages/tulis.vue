<script setup lang="ts">
interface Cat { id: number; name: string; slug: string }
const config = useRuntimeConfig()
const siteKey = config.public.turnstileSiteKey as string
if (siteKey) useHead({ script: [{ src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true }] })

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
  const token = (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value
  const body: Record<string, unknown> = { text: text.value, turnstileToken: token }
  if (choice.value === '__new') body.newCategory = newName.value
  else if (choice.value) body.categoryId = Number(choice.value)
  try {
    const r = await $fetch<{ status: string }>('/api/scenarios', { method: 'POST', body })
    done.value = r.status === 'published' ? 'published' : 'pending'
    if (r.status === 'published') await navigateTo('/')
  } catch (e) {
    const m = e as { statusMessage?: string; data?: { statusMessage?: string } }
    werr.value = m?.data?.statusMessage || m?.statusMessage || 'Gagal mengirim. Coba lagi sebentar.'
  }
  sending.value = false
}
</script>

<template>
  <div class="stack">
    <section v-if="done === 'pending'" class="card" role="status">
      <h2>Terkirim</h2>
      <p class="msg">Kasusmu menunggu persetujuan sebelum tayang.</p>
      <NuxtLink to="/" class="btn btn-primary">Kembali</NuxtLink>
    </section>

    <section v-else class="card" aria-labelledby="w-title">
      <h2 id="w-title">Ceritain kasusnya</h2>
      <form @submit.prevent="submit">
        <label for="story" class="msg">Singkat aja. Pakai inisial atau A, B, C. Jangan tulis nama lengkap, nomor HP, atau akun sosmed.</label>
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
        <div v-if="siteKey" class="cf-turnstile" :data-sitekey="siteKey" />
        <button type="submit" class="btn btn-primary btn-block" :disabled="sending">{{ sending ? 'Mengirim...' : 'Kirim kasus' }}</button>
        <NuxtLink to="/" class="btn btn-ghost btn-block">Batal</NuxtLink>
      </form>
    </section>
  </div>
</template>
