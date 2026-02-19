<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { useManagerStore } from '@/stores/manager.store'
import ManagerLeaveRequestsList from '@/components/leave-requests/ManagerLeaveRequestsList.vue'
import RejectModal from '@/components/leave-requests/RejectModal.vue'
import QRCodeDisplay from '@/components/qr-code/QRCodeDisplay.vue'

const router = useRouter()
const { isManager } = useRoleGuard()
const managerStore = useManagerStore()

const showRejectModal = ref(false)
const rejectingRequestId = ref<number | null>(null)
const processingRequestId = ref<number | null>(null)

const pendingRequestsCount = computed(() => {
  return managerStore.leaveRequests.length
})

const totalTeamHours = computed(() => {
  return managerStore.companyStats ? parseFloat(managerStore.companyStats.summary.month.hours) : 0
})

const activeEmployees = computed(() => {
  return managerStore.companyStats ? parseInt(managerStore.companyStats.active_employees) : 0
})

onMounted(() => {
  managerStore.fetchEmployees()
  managerStore.fetchCompanyStatistics()
  managerStore.fetchPendingLeaveRequests()
})

async function handleApprove(id: number) {
  if (!confirm('Ви впевнені, що хочете схвалити цей запит?')) {
    return
  }

  processingRequestId.value = id
  try {
    await managerStore.approveLeaveRequest(id)
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
    await managerStore.rejectLeaveRequest(rejectingRequestId.value, {
      manager_comment: comments,
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

function viewAllLeaveRequests() {
  router.push({ name: 'manager-leave-requests' })
}

function viewEmployeeDetails(employeeId: number) {
  router.push({ name: 'employee-details', params: { id: employeeId } })
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
            <div class="stat-value">{{ managerStore.employees.length }}</div>
            <div class="stat-label">Співробітників</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeEmployees }}</div>
            <div class="stat-label">Активних зараз</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalTeamHours.toFixed(1) }}</div>
            <div class="stat-label">Годин команди (місяць)</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-value">{{ pendingRequestsCount }}</div>
            <div class="stat-label">Запитів на відпустку</div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout: QR Code + Employees on left (60%), Leave Requests on right (40%) -->
      <div class="two-column-layout">
        <!-- Left Column: QR Code + Employees -->
        <div class="left-column">
          <!-- QR Code Section -->
          <div class="qr-section">
            <QRCodeDisplay />
          </div>

          <!-- Employees Section -->
          <div class="content-section">
            <div class="section-header">
              <h2>Підлеглі</h2>
            </div>

            <div v-if="managerStore.isLoadingEmployees" class="loading">Завантаження...</div>

            <div v-else-if="managerStore.employees.length === 0" class="empty-state">
              <p>У вас ще немає підлеглих співробітників</p>
            </div>

            <div v-else class="employees-list">
              <div
                v-for="employee in managerStore.employees"
                :key="employee.id"
                class="employee-card"
                @click="viewEmployeeDetails(employee.id)"
              >
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
                </div>

                <div class="employee-indicator">→</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Leave Requests -->
        <div class="right-column">
          <div class="content-section sticky-section">
            <div class="section-header">
              <h2>Нові запити на відпустку</h2>
              <div class="header-actions">
                <span v-if="pendingRequestsCount > 0" class="badge"
                  >{{ pendingRequestsCount }} нових</span
                >
                <button @click="viewAllLeaveRequests" class="btn-view-all">
                  Переглянути всі →
                </button>
              </div>
            </div>

            <ManagerLeaveRequestsList
              :leave-requests="managerStore.leaveRequests"
              :is-loading="managerStore.isLoadingLeaveRequests"
              :error="managerStore.error"
              :processing-id="processingRequestId"
              @retry="managerStore.fetchPendingLeaveRequests"
              @approve="handleApprove"
              @reject="handleRejectClick"
            />
          </div>
        </div>
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
  max-width: 1600px;
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

/* Two Column Layout: 60% left (QR + Employees), 40% right (Leave Requests) */
.two-column-layout {
  display: grid;
  grid-template-columns: 4fr 2fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-column {
  min-width: 0;
}

.sticky-section {
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
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
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-view-all {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
}

.btn-view-all:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
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

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.employee-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  cursor: pointer;
}

.employee-card:hover {
  border-color: #9333ea;
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.1);
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
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.employee-info {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.employee-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.employee-email {
  color: #6b7280;
  font-size: 0.813rem;
  margin: 0;
}

.employee-indicator {
  color: #9333ea;
  font-size: 1.5rem;
  font-weight: 600;
  flex-shrink: 0;
}

.employee-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
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
