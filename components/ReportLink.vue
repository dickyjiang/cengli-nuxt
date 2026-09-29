<script setup lang="ts">
const props = defineProps<{ id: number }>()
const step = ref<'idle' | 'ask' | 'done'>('idle')
const err = ref(false)
async function send() {
  err.value = false
  try { await $fetch(`/api/scenarios/${props.id}/report`, { method: 'POST' }); step.value = 'done' } catch { err.value = true; step.value = 'idle' }
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
      <span v-if="err">Belum terkirim. Coba lagi.</span>
    </template>
  </div>
</template>
