<script setup lang="ts">
const route = useRoute()
const { data: item, error } = await useFetch(`/api/scenarios/${route.params.id}`)
useHead({ title: 'Cengli / Bo Cengli: menurut kamu adil?' })
</script>

<template>
  <div class="stack">
    <div v-if="item" class="deck"><ScenarioCard :item="item" /></div>
    <section v-else class="card">
      <h2>Kasus tidak ditemukan</h2>
      <p class="msg">{{ error?.statusMessage || 'Mungkin sudah dihapus.' }}</p>
    </section>
    <div class="bottom"><NuxtLink to="/" class="btn btn-primary">Lihat kasus lain</NuxtLink></div>
  </div>
</template>
