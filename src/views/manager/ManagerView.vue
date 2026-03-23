<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleGuard } from '@/composables/useRoleGuard.ts'
import { useManagerStore } from '@/stores/manager.store.ts'
import ManagerLeaveRequestsList from '@/components/leave-requests/ManagerLeaveRequestsList.vue'
import RejectModal from '@/components/leave-requests/RejectModal.vue'
import QRCodeDisplay from '@/components/qr-code/QRCodeDisplay.vue'
import StatCard from '@/components/ui/StatCard.vue'

const router = useRouter()
const { isManager, isAdmin } = useRoleGuard()
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

function viewCompany() {
  router.push({ name: 'company' })
}
</script>

<template>
  <div class="manager-panel">
    <div class="panel-header">
      <h1>Панель менеджера</h1>
      <p class="subtitle">Управління командою</p>
    </div>

    <div v-if="!isManager && !isAdmin" class="access-denied">
      <h2>Доступ заборонено</h2>
      <p>У вас немає прав для перегляду цієї сторінки</p>
    </div>

    <div v-else class="content-wrapper">
      <div class="stats-grid">
        <StatCard
          icon="👥"
          label="Співробітників"
          :value="managerStore.companyStats?.employee_count ?? 0"
        />
        <StatCard icon="⚡" label="Активних зараз" :value="activeEmployees" />
        <StatCard icon="⏱️" label="Годин команди (місяць)" :value="totalTeamHours.toFixed(1)" />
        <StatCard icon="⏰" label="Запитів на відпустку" :value="pendingRequestsCount" />
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="quick-action-btn" @click="viewCompany">
          <span class="qa-icon">🏢</span>
          <span class="qa-label">Компанія</span>
        </button>
        <button class="quick-action-btn" @click="viewStatistics">
          <span class="qa-icon">📊</span>
          <span class="qa-label">Розширена статистика</span>
        </button>
        <button class="quick-action-btn" @click="viewAllLeaveRequests">
          <span class="qa-icon">📋</span>
          <span class="qa-label">Запити на відпустку</span>
        </button>
        <button class="quick-action-btn" @click="viewEmployees">
          <span class="qa-icon">👥</span>
          <span class="qa-label">Підлеглі</span>
        </button>
        <button class="quick-action-btn" @click="viewWorkSchedules">
          <span class="qa-icon">📅</span>
          <span class="qa-label">Робочі розклади</span>
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
  color: var(--text);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-muted);
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
  background: var(--surface);
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
  color: var(--text);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge {
  background: #ef4444;
  color: var(--header-text);
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
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  color: var(--header-text);
}

.btn-view-all:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px var(--shadow);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.quick-action-btn:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
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
