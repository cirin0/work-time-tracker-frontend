<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="loading">
    <div class="spinner"></div>
    <p v-if="text">{{ text }}</p>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--accent-2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
