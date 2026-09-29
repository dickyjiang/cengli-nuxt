<script setup lang="ts">
const props = defineProps<{ id: number }>()
const step = ref<'idle' | 'ask' | 'done'>('idle')
const err = ref('')
const { guarded } = useHuman()
async function send() {
  err.value = ''
  try { await guarded(() => $fetch(`/api/scenarios/${props.id}/report`, { method: 'POST' })); step.value = 'done' } catch (e) {
    const m = e as { statusMessage?: string; data?: { statusMessage?: string } }
    err.value = m?.data?.statusMessage || m?.statusMessage || 'Belum terkirim. Coba lagi.'
    step.value = 'idle'
  }
}
</script>

<template>
  <div class="report">
    <span v-if="step === 'done'">Terima kasih, laporanmu diterima.</span>
    <template v-else-if="step === 'ask'">
      <span>Laporkan kasus ini?</span>
      <button type="button" class="linkish" @click="send">Ya, laporkan</button>
      <button type="button" class="linkish" @click="step = 'idle'">Batal</button>
    </template>
    <template v-else>
      <button type="button" class="linkish" @click="step = 'ask'">Laporkan kasus ini</button>
      <span v-if="err">{{ err }}</span>
    </template>
  </div>
</template>
