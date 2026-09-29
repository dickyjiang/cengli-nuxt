<script setup lang="ts">
defineProps<{ total: number; busy: boolean }>()
defineEmits<{ refresh: [] }>()
</script>

<template>
  <div class="result-meta">
    <span>{{ total === 1 ? 'Baru kamu yang vote.' : `${total} orang sudah vote.` }}</span>
    <button type="button" class="linkish" :disabled="busy" @click="$emit('refresh')">{{ busy ? 'Memuat...' : 'Refresh hasil' }}</button>
  </div>
</template>
