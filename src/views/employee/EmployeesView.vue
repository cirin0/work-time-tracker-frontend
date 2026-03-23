<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useManagerStore } from '@/stores/manager.store.ts'
import { getAvatarUrl } from '@/core/utils/url.ts'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const managerStore = useManagerStore()

onMounted(() => {
  managerStore.fetchEmployees()
})

function viewEmployeeDetails(id: number) {
  router.push({ name: 'employee-details', params: { id } })
}
</script>

<template>
  <div class="employees-page">
    <PageHeader
      title="Підлеглі"
      subtitle="Список співробітників вашої команди"
      back-route="manager"
    />

    <LoadingSpinner v-if="managerStore.isLoadingEmployees" text="Завантаження..." />

    <div v-else-if="managerStore.error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ managerStore.error }}</p>
      <button class="btn-retry" @click="managerStore.fetchEmployees()">Спробувати знову</button>
    </div>

    <div v-else-if="managerStore.employees.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>Поки що немає підлеглих</h3>
      <p>Співробітники з'являться тут після призначення</p>
    </div>

    <div v-else class="employees-grid">
      <div
        v-for="employee in managerStore.employees"
        :key="employee.id"
        class="employee-card"
        @click="viewEmployeeDetails(employee.id)"
      >
        <div class="employee-avatar">
          <img
            v-if="getAvatarUrl(employee.avatar)"
            :src="getAvatarUrl(employee.avatar)!"
            :alt="employee.name"
            class="avatar-img"
          />
          <div v-else class="avatar-placeholder">
            {{ employee.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="employee-info">
          <h3>{{ employee.name }}</h3>
          <p class="employee-email">{{ employee.email }}</p>
          <p v-if="employee.work_schedule" class="employee-schedule">
            📅 {{ employee.work_schedule.name }}
          </p>
        </div>

        <div class="employee-arrow">→</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employees-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: var(--header-text);
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0;
}

/* Grid */
.employees-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.employee-card:hover {
  border-color: var(--accent-2);
  box-shadow: 0 4px 12px var(--shadow);
  transform: translateX(4px);
}

.employee-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: var(--header-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.employee-info {
  flex: 1;
  min-width: 0;
}

.employee-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.2rem 0;
}

.employee-email {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0 0 0.2rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-schedule {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
}

.employee-arrow {
  color: var(--accent-2);
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
