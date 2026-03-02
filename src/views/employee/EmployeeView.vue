<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleGuard } from '@/composables/useRoleGuard.ts'
import { useEmployeeStore } from '@/stores/employee.store.ts'
import { useLeaveRequestStore } from '@/stores/leaveRequest.store.ts'
import QRCodeDisplay from '@/components/qr-code/QRCodeDisplay.vue'
import LeaveRequestsList from '@/components/leave-requests/LeaveRequestsList.vue'
import LeaveRequestForm from '@/components/leave-requests/LeaveRequestForm.vue'
import StatCard from '@/components/ui/StatCard.vue'
import type { CreateLeaveRequestRequest } from '@/types/requests/leaveRequestRequest.interface'

const router = useRouter()
const { currentUser, isManager } = useRoleGuard()
const employeeStore = useEmployeeStore()
const leaveRequestStore = useLeaveRequestStore()

const showFormModal = ref(false)
const isSubmittingForm = ref(false)
const isStartingWork = ref(false)
const isStoppingWork = ref(false)
const stopPinCode = ref('')
const showStopModal = ref(false)

const todayHours = computed(() => {
  return employeeStore.timeSummary?.summary.today.hours ?? 0
})

const todayMinutes = computed(() => {
  return employeeStore.timeSummary?.summary.today.minutes ?? 0
})

const weekHours = computed(() => {
  return employeeStore.timeSummary?.summary.week.hours ?? 0
})

const monthHours = computed(() => {
  return employeeStore.timeSummary?.summary.month.hours ?? 0
})

const isWorking = computed(() => {
  return employeeStore.activeEntry !== null
})

const leaveRequestsCount = computed(() => {
  return leaveRequestStore.leaveRequests.length
})

onMounted(() => {
  employeeStore.fetchTimeSummary()
  employeeStore.fetchActiveEntry()
  leaveRequestStore.fetchLeaveRequests()
})

async function handleStartWork() {
  isStartingWork.value = true
  try {
    await employeeStore.startWork({ entry_type: 'remote' })
  } catch (error) {
    console.error('Failed to start work:', error)
  } finally {
    isStartingWork.value = false
  }
}

function openStopModal() {
  stopPinCode.value = ''
  showStopModal.value = true
}

async function handleStopWork() {
  if (stopPinCode.value.length !== 4) return

  isStoppingWork.value = true
  try {
    await employeeStore.stopWork({
      stop_comment: undefined,
      pin_code: stopPinCode.value,
    })
    showStopModal.value = false
    stopPinCode.value = ''
  } catch (error) {
    console.error('Failed to stop work:', error)
  } finally {
    isStoppingWork.value = false
  }
}

async function handleCreateLeaveRequest(data: CreateLeaveRequestRequest) {
  isSubmittingForm.value = true
  try {
    await leaveRequestStore.createLeaveRequest(data)
    showFormModal.value = false
  } catch (error) {
    console.error('Failed to create leave request:', error)
  } finally {
    isSubmittingForm.value = false
  }
}

function handlePageChange(page: number) {
  leaveRequestStore.fetchLeaveRequests(page)
}

function viewLeaveRequests() {
  router.push({ name: 'leave-requests' })
}

function viewCompany() {
  router.push({ name: 'company' })
}

function viewStatistics() {
  router.push({ name: 'employee-statistics' })
}
</script>

<template>
  <div class="employee-dashboard">
    <div class="dashboard-header">
      <h1>Головна сторінка</h1>
      <p class="subtitle">Ласкаво просимо, {{ currentUser?.name }}</p>
    </div>

    <div class="content-wrapper">
      <div class="stats-grid">
        <StatCard
          :icon="isWorking ? '🟢' : '⏰'"
          :label="isWorking ? 'Працюю зараз' : 'Сьогодні'"
          :value="`${todayHours}г ${todayMinutes}хв`"
          :variant="isWorking ? 'active' : undefined"
        />
        <StatCard icon="📅" label="Годин за тиждень" :value="weekHours.toFixed(1)" />
        <StatCard icon="📊" label="Годин за місяць" :value="monthHours.toFixed(1)" />
        <StatCard icon="📄" label="Запитів на відпустку" :value="leaveRequestsCount" />
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button
          v-if="!isWorking"
          class="quick-action-btn start"
          :disabled="isStartingWork"
          @click="handleStartWork"
        >
          <span class="qa-icon">▶️</span>
          <span class="qa-label">{{ isStartingWork ? 'Починаю...' : 'Почати роботу' }}</span>
        </button>
        <button
          v-else
          class="quick-action-btn stop"
          :disabled="isStoppingWork"
          @click="openStopModal"
        >
          <span class="qa-icon">⏹️</span>
          <span class="qa-label">Завершити роботу</span>
        </button>
        <button class="quick-action-btn" @click="viewLeaveRequests">
          <span class="qa-icon">📋</span>
          <span class="qa-label">Запити на відпустку</span>
        </button>
        <button class="quick-action-btn" @click="viewStatistics">
          <span class="qa-icon">📈</span>
          <span class="qa-label">Розширена статистика</span>
        </button>
        <button class="quick-action-btn" @click="viewCompany">
          <span class="qa-icon">🏢</span>
          <span class="qa-label">Компанія</span>
        </button>
      </div>

      <div class="two-column-layout">
        <div class="left-column">
          <div v-if="isManager" class="qr-section">
            <QRCodeDisplay />
          </div>

          <div v-if="employeeStore.error" class="error-banner">
            <p>{{ employeeStore.error }}</p>
            <button @click="employeeStore.clearError()">Закрити</button>
          </div>

          <div v-if="employeeStore.timeSummary" class="content-section">
            <h2>Статистика відвідуваності</h2>
            <div class="attendance-grid">
              <div class="attendance-item">
                <span class="attendance-value on-time">{{
                  employeeStore.timeSummary.attendance.on_time_count
                }}</span>
                <span class="attendance-label">Вчасно</span>
              </div>
              <div class="attendance-item">
                <span class="attendance-value late">{{
                  employeeStore.timeSummary.attendance.late_count
                }}</span>
                <span class="attendance-label">Запізнень</span>
              </div>
              <div class="attendance-item">
                <span class="attendance-value early">{{
                  employeeStore.timeSummary.attendance.early_count
                }}</span>
                <span class="attendance-label">Раніше</span>
              </div>
              <div class="attendance-item">
                <span class="attendance-value overtime">{{
                  employeeStore.timeSummary.attendance.overtime_count
                }}</span>
                <span class="attendance-label">Понаднормових</span>
              </div>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="content-section sticky-section">
            <div class="section-header">
              <div class="header-actions">
                <h2>Мої запити на відпустку</h2>
                <span v-if="leaveRequestsCount > 0" class="badge">{{ leaveRequestsCount }}</span>
              </div>
            </div>

            <LeaveRequestsList
              :leave-requests="leaveRequestStore.leaveRequests"
              :is-loading="leaveRequestStore.isLoading"
              :error="leaveRequestStore.error"
              :pagination="leaveRequestStore.pagination"
              @retry="leaveRequestStore.fetchLeaveRequests()"
              @create="showFormModal = true"
              @page-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <LeaveRequestForm
        :show-form="showFormModal"
        :is-submitting="isSubmittingForm"
        @close="showFormModal = false"
        @submit="handleCreateLeaveRequest"
      />

      <!-- Stop Work Modal -->
      <div v-if="showStopModal" class="modal-overlay" @click.self="showStopModal = false">
        <div class="modal-content">
          <h3>Завершити роботу</h3>
          <p class="modal-description">Введіть ваш PIN-код для підтвердження</p>
          <input
            v-model="stopPinCode"
            type="password"
            maxlength="4"
            placeholder="0000"
            class="pin-input"
            @keyup.enter="handleStopWork"
          />
          <div class="modal-actions">
            <button class="btn-cancel" @click="showStopModal = false">Скасувати</button>
            <button
              class="btn-confirm"
              :disabled="stopPinCode.length !== 4 || isStoppingWork"
              @click="handleStopWork"
            >
              {{ isStoppingWork ? 'Завершую...' : 'Підтвердити' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
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

.quick-action-btn:hover:not(:disabled) {
  border-color: #2563eb;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.quick-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-action-btn.start {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border-color: transparent;
}

.quick-action-btn.start:hover:not(:disabled) {
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.quick-action-btn.stop {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: transparent;
}

.quick-action-btn.stop:hover:not(:disabled) {
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.qa-icon {
  font-size: 1.1rem;
}

.qa-label {
  white-space: nowrap;
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 3fr 2fr;
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

.content-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
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
  margin-bottom: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge {
  background: #2563eb;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-create {
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

.btn-create:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
}

/* Attendance Grid */
.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.attendance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.attendance-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.attendance-value.on-time {
  color: #22c55e;
}

.attendance-value.late {
  color: #ef4444;
}

.attendance-value.early {
  color: #f59e0b;
}

.attendance-value.overtime {
  color: #3b82f6;
}

.attendance-label {
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
}

/* Error banner */
.error-banner {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-banner p {
  color: #991b1b;
  margin: 0;
}

.error-banner button {
  background: none;
  border: none;
  color: #991b1b;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

/* Stop Work Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.modal-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.pin-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 1.5rem;
}

.pin-input:focus {
  border-color: #2563eb;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel {
  padding: 0.625rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .employee-dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-action-btn {
    justify-content: center;
  }

  .attendance-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
