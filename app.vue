<script setup lang="ts">
const site = useRuntimeConfig().public.siteUrl as string
const desc = 'Kejadian sehari-hari, kamu yang nilai. Cengli atau Bo Cengli?'
useHead({
  meta: [
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Cengli / Bo Cengli' },
    { property: 'og:title', content: 'Adil atau nggak? Kamu yang nilai.' },
    { property: 'og:description', content: desc },
    { property: 'og:image', content: `${site}/og.png` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: `${site}/og.png` }
  ]
})
</script>

<template>
  <main class="wrap">
    <header class="top">
      <NuxtLink to="/" class="logo" aria-label="CLBCL, ke beranda"><span class="f">CL</span><span class="u">BCL</span></NuxtLink>
    </header>
    <NuxtPage />
  </main>
</template>
