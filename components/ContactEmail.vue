<script setup lang="ts">
// Tautan mailto tidak jalan kalau browser belum punya aplikasi email bawaan,
// jadi selalu sediakan tombol Salin sebagai cadangan.
const EMAIL = 'hello@cengli.men'
const note = ref('')
async function copy() {
  try {
    await navigator.clipboard.writeText(EMAIL)
    note.value = 'Disalin'
  } catch {
    note.value = 'Salin manual'
  }
  setTimeout(() => { note.value = '' }, 2000)
}
</script>

<template>
  <span class="contact-email">
    <a :href="`mailto:${EMAIL}`">{{ EMAIL }}</a>
    <button type="button" class="linkish contact-copy" @click="copy">{{ note || 'Salin' }}</button>
  </span>
</template>
