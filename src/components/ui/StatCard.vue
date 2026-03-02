<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon?: string
  variant?: 'success' | 'danger' | 'active'
  sub?: string
}>()
</script>

<template>
  <div class="stat-card" :class="{ active: variant === 'active' }">
    <div v-if="icon" class="stat-icon">{{ icon }}</div>
    <div class="stat-content">
      <div class="stat-value" :class="variant">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="sub" class="stat-sub">{{ sub }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card.active {
  border: 2px solid #22c55e;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-value.success {
  color: #16a34a;
}

.stat-value.danger {
  color: #dc2626;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.stat-sub {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}
</style>
