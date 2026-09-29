<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>()
const notFound = computed(() => props.error?.statusCode === 404)
useHead({ title: notFound.value ? 'Halaman tidak ditemukan | Cengli / Bo Cengli' : 'Ada masalah | Cengli / Bo Cengli', meta: [{ name: 'robots', content: 'noindex' }] })
const home = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="shell">
    <main class="wrap">
      <header class="top">
        <a href="/" class="logo" aria-label="CLBCL, ke beranda" @click.prevent="home"><span class="f">CL</span><span class="u">BCL</span></a>
      </header>
      <div class="stack">
        <section class="card" role="alert">
          <h2>{{ notFound ? 'Halaman tidak ditemukan' : 'Ada yang tidak beres' }}</h2>
          <p class="msg">{{ notFound ? 'Alamatnya mungkin salah, atau halamannya sudah dihapus.' : 'Coba muat ulang sebentar lagi. Kalau tetap begini, kabari kami di hello@dickyjiang.com.' }}</p>
          <button type="button" class="btn btn-primary" @click="home">Ke beranda</button>
        </section>
      </div>
    </main>
  </div>
</template>
