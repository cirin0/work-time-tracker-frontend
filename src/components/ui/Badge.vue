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
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.status-pending {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 1px solid var(--warning-border);
}

.status-rejected {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
}
</style>
