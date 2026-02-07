<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { apiClient, API_ROUTES } from '@/core/api'
import { useManagerLeaveRequestStore } from '@/stores/managerLeaveRequest.store'
import ManagerLeaveRequestsList from '@/components/leave-requests/ManagerLeaveRequestsList.vue'
import RejectModal from '@/components/leave-requests/RejectModal.vue'
import type { User } from '@/types/interfaces/user.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import type { UserApiResponse } from '@/types/responses/user.api'
import { transformUserFromApi } from '@/types/responses/user.api'

const { isManager, currentUser } = useRoleGuard()
const managerLeaveRequestStore = useManagerLeaveRequestStore()

const allUsers = ref<User[]>([])
const isLoading = ref(false)
const showRejectModal = ref(false)
const rejectingRequestId = ref<number | null>(null)
const processingRequestId = ref<number | null>(null)

const employees = computed(() => {
  if (!currentUser.value) return []
  return allUsers.value.filter((user) => user.manager?.id === currentUser.value!.id)
})

const pendingRequestsCount = computed(() => {
  return managerLeaveRequestStore.leaveRequests.filter((req) => req.status === 'pending').length
})

async function loadUsers() {
  isLoading.value = true
  try {
    const { data } = await apiClient.get<PaginatedResponse<UserApiResponse>>(API_ROUTES.users.index)
    allUsers.value = data.data.map(transformUserFromApi)
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUsers()
  loadLeaveRequests()
})

async function loadLeaveRequests() {
  try {
    await managerLeaveRequestStore.fetchLeaveRequests()
  } catch (error) {
    console.error('Failed to load leave requests:', error)
  }
}

async function handleApprove(id: number) {
  if (!confirm('Ви впевнені, що хочете схвалити цей запит?')) {
    return
  }

  processingRequestId.value = id
  try {
    await managerLeaveRequestStore.approveLeaveRequest(id)
  } catch (error) {
    console.error('Failed to approve leave request:', error)
    alert('Помилка при схваленні запиту')
  } finally {
    processingRequestId.value = null
  }
}

function handleRejectClick(id: number) {
  rejectingRequestId.value = id
  showRejectModal.value = true
}

async function handleRejectSubmit(comments: string) {
  if (!rejectingRequestId.value) return

  processingRequestId.value = rejectingRequestId.value
  try {
    await managerLeaveRequestStore.rejectLeaveRequest(rejectingRequestId.value, {
      manager_comments: comments,
    })
    showRejectModal.value = false
    rejectingRequestId.value = null
  } catch (error) {
    console.error('Failed to reject leave request:', error)
    alert('Помилка при відхиленні запиту')
  } finally {
    processingRequestId.value = null
  }
}
</script>

<template>
  <div class="manager-panel">
    <div class="panel-header">
      <h1>Панель менеджера</h1>
      <p class="subtitle">Управління командою</p>
    </div>

    <div v-if="!isManager" class="access-denied">
      <h2>Доступ заборонено</h2>
      <p>У вас немає прав для перегляду цієї сторінки</p>
    </div>

    <div v-else class="content-wrapper">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ employees.length }}</div>
            <div class="stat-label">Співробітників</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-value">0</div>
            <div class="stat-label">Запитів на відпустку</div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2>Підлеглі</h2>
        </div>

        <div v-if="isLoading" class="loading">Завантаження...</div>

        <div v-else-if="employees.length === 0" class="empty-state">
          <p>У вас ще немає підлеглих співробітників</p>
        </div>

        <div v-else class="employees-grid">
          <div v-for="employee in employees" :key="employee.id" class="employee-card">
            <div class="employee-header">
              <div class="employee-avatar">
                <img
                  v-if="employee.avatar"
                  :src="employee.avatar"
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
                <span class="role-badge">{{ employee.role }}</span>
              </div>
            </div>

            <div class="employee-stats">
              <div class="stat-item">
                <span class="stat-label">Годин цього місяця:</span>
                <span class="stat-value">0</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Запитів на відпустку:</span>
                <span class="stat-value">0</span>
              </div>
            </div>

            <div class="employee-actions">
              <button class="btn-secondary">Переглянути профіль</button>
              <button class="btn-primary">Звіти</button>
            </div>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="section-header">
          <h2>Запити на відпустку</h2>
          <span v-if="pendingRequestsCount > 0" class="badge"
            >{{ pendingRequestsCount }} нових</span
          >
        </div>

        <ManagerLeaveRequestsList
          :leave-requests="managerLeaveRequestStore.leaveRequests"
          :is-loading="managerLeaveRequestStore.isLoading"
          :error="managerLeaveRequestStore.error"
          :processing-id="processingRequestId"
          @retry="loadLeaveRequests"
          @approve="handleApprove"
          @reject="handleRejectClick"
        />
      </div>

      <RejectModal
        :show-modal="showRejectModal"
        :is-submitting="processingRequestId !== null"
        @close="showRejectModal = false"
        @submit="handleRejectSubmit"
      />
    </div>
  </div>
</template>

<style scoped>
.manager-panel {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
}

.panel-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.access-denied {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.access-denied h2 {
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

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

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.content-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.badge {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.employee-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.employee-card:hover {
  border-color: #9333ea;
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.1);
}

.employee-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.employee-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.employee-info {
  flex: 1;
  min-width: 0;
}

.employee-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.employee-email {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: #d1fae5;
  color: #065f46;
}

.employee-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-item .stat-label {
  color: #6b7280;
}

.stat-item .stat-value {
  font-weight: 600;
  color: #1f2937;
}

.employee-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
