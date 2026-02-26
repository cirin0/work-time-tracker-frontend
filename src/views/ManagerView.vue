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
  return managerStore.companyStats ? managerStore.companyStats.summary.month.hours : 0
})

const activeEmployees = computed(() => {
  return managerStore.companyStats ? managerStore.companyStats.active_employees : 0
})

onMounted(() => {
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

function viewWorkSchedules() {
  router.push({ name: 'work-schedules' })
}

function viewEmployees() {
  router.push({ name: 'manager-employees' })
}

function viewStatistics() {
  router.push({ name: 'manager-statistics' })
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
            <div class="stat-value">{{ managerStore.companyStats?.employee_count ?? 0 }}</div>
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

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="quick-action-btn" @click="viewEmployees">
          <span class="qa-icon">👥</span>
          <span class="qa-label">Підлеглі</span>
        </button>
        <button class="quick-action-btn" @click="viewAllLeaveRequests">
          <span class="qa-icon">📋</span>
          <span class="qa-label">Запити на відпустку</span>
        </button>
        <button class="quick-action-btn" @click="viewWorkSchedules">
          <span class="qa-icon">📅</span>
          <span class="qa-label">Робочі розклади</span>
        </button>
        <button class="quick-action-btn" @click="viewStatistics">
          <span class="qa-icon">📊</span>
          <span class="qa-label">Розширена статистика</span>
        </button>
      </div>

      <div class="two-column-layout">
        <div class="left-column">
          <div class="qr-section">
            <QRCodeDisplay />
          </div>
        </div>

        <div class="right-column">
          <div class="content-section sticky-section">
            <div class="section-header">
              <h2>Нові запити на відпустку</h2>
              <div class="header-actions">
                <span v-if="pendingRequestsCount > 0" class="badge"
                  >{{ pendingRequestsCount }} нових</span
                >
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

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.quick-action-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.qa-icon {
  font-size: 1.1rem;
}

.qa-label {
  white-space: nowrap;
}
</style>
