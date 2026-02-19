<script setup lang="ts">
import { computed } from 'vue'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { UserRole } from '@/types/enums/enums.types'
import AdminView from './AdminView.vue'
import ManagerView from './ManagerView.vue'
import EmployeeView from './EmployeeView.vue'

const { currentUser } = useRoleGuard()

const currentView = computed(() => {
  if (!currentUser.value) return null

  if (currentUser.value.role === UserRole.ADMIN) {
    return 'admin'
  }

  if (currentUser.value.role === UserRole.MANAGER) {
    return 'manager'
  }

  return 'employee'
})
</script>

<template>
  <div v-if="!currentUser" class="loading-state">
    <p>Завантаження...</p>
  </div>

  <AdminView v-else-if="currentView === 'admin'" />

  <ManagerView v-else-if="currentView === 'manager'" />

  <EmployeeView v-else />
</template>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #6b7280;
  font-size: 1.125rem;
}
</style>
