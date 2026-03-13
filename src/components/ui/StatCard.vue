<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number
  icon?: string
  variant?: 'success' | 'danger' | 'active'
  subText?: string
}>()
</script>

<template>
  <div class="stat-card" :class="{ active: variant === 'active' }">
    <div v-if="icon" class="stat-icon">{{ icon }}</div>
    <div class="stat-content">
      <div v-if="$slots.default" class="stat-value" :class="variant">
        <slot />
      </div>
      <div v-else class="stat-value" :class="variant">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="subText" class="stat-sub">{{ subText }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: var(--surface);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 12px var(--shadow);
  border: 1px solid var(--border);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.active {
  border: 2px solid var(--pin-ok-color);
  background: var(--sand-light);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.stat-value.success {
  color: var(--pin-ok-color);
}

.stat-value.danger {
  color: var(--error-text);
}

.stat-label {
  font-family: var(--font-body);
  color: var(--text-muted);
  font-size: 0.875rem;
}

.stat-sub {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
