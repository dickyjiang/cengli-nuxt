<script setup lang="ts">
const route = useRoute()
const { data: item, error } = await useFetch(`/api/scenarios/${route.params.id}`)
const cardRef = ref<{ showing: boolean; my: unknown; total: number; busy: boolean; refresh: () => void } | null>(null)
const { dragging, cardStyle, progress, fling, handlers } = useSwipeCard(() => { navigateTo('/'); return false })
// Kasus yang tayang (published) boleh diindeks; kasus milik sendiri yang belum tayang atau tidak ditemukan tetap noindex.
const site = String(useRuntimeConfig().public.siteUrl).replace(/\/$/, '')
const snippet = computed(() => {
  const t = (item.value?.text || '').replace(/\s+/g, ' ').trim()
  return t.length > 60 ? `${t.slice(0, 57).trimEnd()}...` : t
})
const indexable = computed(() => !!item.value && (item.value as { published?: boolean }).published === true)
const pageTitle = computed(() => item.value ? `${snippet.value} | Cengli / Bo Cengli` : 'Cengli / Bo Cengli: menurut kamu adil?')
const pageDesc = computed(() => item.value ? `${item.value.text} Vote anonim: Cengli (adil) atau Bo Cengli (nggak adil)?` : 'Adil atau nggak? Apa kata kamu?')
useHead({
  title: pageTitle,
  meta: computed(() => [
    { name: 'robots', content: indexable.value ? 'index,follow' : 'noindex' },
    { name: 'description', content: pageDesc.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDesc.value },
    { property: 'og:url', content: `${site}/s/${route.params.id}` }
  ]),
  link: computed(() => indexable.value ? [{ rel: 'canonical', href: `${site}/s/${route.params.id}` }] : [])
})
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
