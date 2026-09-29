<script setup lang="ts">
const route = useRoute()
const { data: item, error } = await useFetch(`/api/scenarios/${route.params.id}`)
const cardRef = ref<{ showing: boolean; my: unknown; total: number; busy: boolean; refresh: () => void } | null>(null)
const { dragging, cardStyle, progress, fling, handlers } = useSwipeCard(() => { navigateTo('/'); return false })
useHead({ title: 'Cengli / Bo Cengli: menurut kamu adil?', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="stack">
    <div v-if="item" :class="['deck', { dragging }]" :style="{ '--p': progress }" v-bind="handlers"><ScenarioCard ref="cardRef" :item="item" :class="{ dragging }" :style="cardStyle" /></div>
    <section v-else class="card">
      <h2>Kasus tidak ditemukan</h2>
      <p class="msg">{{ error?.statusMessage || 'Mungkin sudah dihapus.' }}</p>
    </section>
    <ResultMeta v-if="cardRef?.showing" :total="cardRef.total" :busy="cardRef.busy" @refresh="cardRef.refresh()" />
    <div class="bottom">
      <NuxtLink to="/" class="btn btn-primary">Lihat kasus lain</NuxtLink>
      <p v-if="item" class="swipe-hint">Geser kartu untuk kasus lainnya</p>
    </div>
    <ReportLink v-if="item" :id="item.id" />
  </div>
</template>
