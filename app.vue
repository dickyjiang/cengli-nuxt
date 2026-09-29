<script setup lang="ts">
const site = useRuntimeConfig().public.siteUrl as string
const desc = 'Adil atau nggak? Apa kata kamu?'
useHead({
  meta: [
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Cengli / Bo Cengli' },
    { property: 'og:title', content: 'Cengli - Bo Cengli?' },
    { property: 'og:description', content: desc },
    { property: 'og:image', content: `${site}/og.png` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: `${site}/og.png` }
  ]
})
const siteKey = useRuntimeConfig().public.turnstileSiteKey as string
if (siteKey) useHead({ script: [{ key: 'turnstile', src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit', async: true, defer: true }] })
const { ensure: ensureHuman } = useHuman()
onMounted(() => { ensureHuman().catch(() => { /* akan diulang saat vote */ }) })
const open = ref(false)
watch(() => useRoute().fullPath, () => { open.value = false })
</script>

<template>
  <div class="shell">
  <main class="wrap">
    <header class="top">
      <NuxtLink to="/" class="logo" aria-label="CLBCL, ke beranda"><span class="f">CL</span><span class="u">BCL</span></NuxtLink>
      <span class="top-title" aria-hidden="true">Adil atau nggak?</span>
      <div class="menu">
        <button type="button" class="menu-btn" aria-label="Menu" :aria-expanded="open" @click="open = !open"><i /><i /><i /></button>
        <div v-if="open" class="menu-pop">
          <NuxtLink to="/">Beranda</NuxtLink>
          <NuxtLink to="/riwayat">Riwayatku</NuxtLink>
          <NuxtLink to="/tulis">Tulis kasus baru</NuxtLink>
        </div>
      </div>
    </header>
    <NuxtPage />
  </main>
  <footer class="site-foot">
    <span>© 2026 cenglibocengli · v0.1 ·
      <NuxtLink to="/tentang">Tentang</NuxtLink> · <NuxtLink to="/aturan">Aturan &amp; Privasi</NuxtLink></span>
    <a href="mailto:hello@dickyjiang.com">hello@dickyjiang.com</a>
  </footer>
  </div>
</template>
