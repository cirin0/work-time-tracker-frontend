<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useManagerStore } from '@/stores/manager.store'
import { getAvatarUrl } from '@/core/utils/url'

const router = useRouter()
const managerStore = useManagerStore()

onMounted(() => {
  managerStore.fetchEmployees()
})

function viewEmployeeDetails(id: number) {
  router.push({ name: 'employee-details', params: { id } })
}

function goBack() {
  router.push({ name: 'main' })
}
</script>

<template>
  <div class="employees-page">
    <div class="page-header">
      <button class="btn-back" @click="goBack">← Назад</button>
      <div class="header-text">
        <h1>Підлеглі</h1>
        <p class="subtitle">Список співробітників вашої команди</p>
      </div>
    </div>

    <div v-if="managerStore.isLoadingEmployees" class="loading-state">
      <div class="spinner"></div>
      <span>Завантаження...</span>
    </div>

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

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-back:hover {
  background: #e5e7eb;
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.error-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.error-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
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
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.employee-card:hover {
  border-color: #9333ea;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
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
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
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
  color: #1f2937;
  margin: 0 0 0.2rem 0;
}

.employee-email {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0 0 0.2rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-schedule {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
}

.employee-arrow {
  color: #9333ea;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
