<script setup lang="ts">
defineOptions({
  name: 'CardComponent',
})

interface Props {
  variant?: 'default' | 'highlighted'
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  noPadding: false,
})
</script>

<template>
  <div class="card" :class="[`card--${variant}`, { 'card--no-padding': noPadding }]">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface);
  border-radius: 1rem;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px var(--shadow);
  overflow: hidden;
}

.card--highlighted {
  border-color: var(--accent-2);
  border-width: 2px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--border);
  background: var(--sand-light);
}

.card-body {
  padding: 1.5rem 1.75rem;
}

.card--no-padding .card-body {
  padding: 0;
}

.card-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid var(--border);
  background: var(--sand-light);
}
</style>
