<script setup lang="ts">
defineOptions({
  name: 'BadgeComponent',
})

interface Props {
  variant:
    | 'role-admin'
    | 'role-manager'
    | 'role-employee'
    | 'status-active'
    | 'status-pending'
    | 'status-rejected'
  label: string
}

defineProps<Props>()
</script>

<template>
  <span class="badge" :class="variant">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 0.25rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: var(--font-body);
}

/* Role variants */
.role-admin {
  background: var(--role-admin-bg);
  color: var(--role-admin-color);
  border: 1px solid var(--role-admin-border);
}

.role-manager {
  background: var(--role-manager-bg);
  color: var(--role-manager-color);
  border: 1px solid var(--role-manager-border);
}

.role-employee {
  background: var(--role-employee-bg);
  color: var(--role-employee-color);
  border: 1px solid var(--role-employee-border);
}

/* Status variants */
.status-active {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-pending {
  background: rgba(251, 191, 36, 0.15);
  color: #d97706;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-rejected {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
}

/* Dark mode adjustments for status variants */
[data-theme='dark'] .status-active {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

[data-theme='dark'] .status-pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}
</style>
