<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  subtitle?: string
  backRoute?: string
}>()

const router = useRouter()

function goBack() {
  if (props.backRoute) {
    router.push({ name: props.backRoute })
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="page-header">
    <button class="btn-back" @click="goBack">← Назад</button>
    <div class="header-content">
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-content {
  flex: 1;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.25rem;
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: var(--sand);
  color: var(--text);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  flex-shrink: 0;
  margin-top: 0.4rem;
}

.btn-back:hover {
  background: var(--sand-light);
}
</style>
