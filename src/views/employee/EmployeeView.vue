<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleGuard } from '@/composables/useRoleGuard.ts'
import { useEmployeeStore } from '@/stores/employee.store.ts'
import { useAuthStore } from '@/stores/auth.store.ts'
import ActiveWorkSessionCard from '@/components/work-time/ActiveWorkSessionCard.vue'
import TodayScheduleWidget from '@/components/work-time/TodayScheduleWidget.vue'
import TimeEntryList from '@/components/work-time/TimeEntryList.vue'
import QRCodeDisplay from '@/components/qr-code/QRCodeDisplay.vue'
import StatCard from '@/components/ui/StatCard.vue'
import Pagination from '@/components/ui/Pagination.vue'

const router = useRouter()
const { currentUser, isManager } = useRoleGuard()
const authStore = useAuthStore()
const employeeStore = useEmployeeStore()

// Stats Card: Сьогодні
const todayStats = computed(() => {
  const hours = employeeStore.timeSummary?.summary.today.hours ?? 0
  const minutes = employeeStore.timeSummary?.summary.today.minutes ?? 0
  return `${hours}г ${minutes.toString().padStart(2, '0')}хв`
})

const todayHours = computed(() => employeeStore.timeSummary?.summary.today.hours ?? 0)
const todayMinutes = computed(() => employeeStore.timeSummary?.summary.today.minutes ?? 0)

// Stats Card: Тиждень
const weekStats = computed(() => {
  const hours = employeeStore.timeSummary?.summary.week.hours ?? 0
  const minutes = employeeStore.timeSummary?.summary.week.minutes ?? 0
  return `${hours}г ${minutes.toString().padStart(2, '0')}хв`
})

// Stats Card: Місяць
const monthStats = computed(() => {
  const hours = employeeStore.timeSummary?.summary.month.hours ?? 0
  const minutes = employeeStore.timeSummary?.summary.month.minutes ?? 0
  return `${hours}г ${minutes.toString().padStart(2, '0')}хв`
})

// Stats Card: Вчасно
const attendanceStats = computed(() => {
  const onTime = employeeStore.timeSummary?.attendance.on_time_count ?? 0
  const late = employeeStore.timeSummary?.attendance.late_count ?? 0
  return {
    value: onTime,
    subText: `Запізнень: ${late}`,
  }
})

onMounted(() => {
  authStore.fetchMyWorkSchedule()
  employeeStore.fetchTimeSummary()
  employeeStore.fetchActiveEntry()
  employeeStore.fetchTimeEntries()
})

async function handleStartWork() {
  try {
    await employeeStore.startWork({})
  } catch (error) {
    console.error('Failed to start work:', error)
  }
}

async function handleStopWork(pinCode: string) {
  try {
    await employeeStore.stopWork({
      stop_comment: undefined,
      pin_code: pinCode,
    })
  } catch (error) {
    console.error('Failed to stop work:', error)
  }
}

async function handlePageChange(page: number) {
  await employeeStore.fetchTimeEntries(page)
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
      <h1>Відстеження робочого часу</h1>
      <p class="subtitle">Ласкаво просимо, {{ currentUser?.name }}</p>
    </div>

    <div class="content-wrapper">
      <ActiveWorkSessionCard
        v-if="currentUser?.role !== 'employee'"
        :active-entry="employeeStore.activeEntry"
        :is-starting="employeeStore.isLoadingActiveEntry"
        :is-stopping="employeeStore.isLoadingActiveEntry"
        @start="handleStartWork"
        @stop="handleStopWork"
      />

      <!-- Stats Grid -->
      <div class="stats-grid">
        <StatCard icon="📅" label="Сьогодні" :value="todayStats" />
        <StatCard icon="📊" label="Тиждень" :value="weekStats" />
        <StatCard icon="📈" label="Місяць" :value="monthStats" />
        <StatCard
          icon="✅"
          label="Вчасно"
          :value="attendanceStats.value"
          :sub-text="attendanceStats.subText"
        />
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="quick-action-btn" @click="viewStatistics">
          <span class="qa-icon">📈</span>
          <span class="qa-label">Розширена статистика</span>
        </button>
        <button class="quick-action-btn" @click="viewLeaveRequests">
          <span class="qa-icon">📋</span>
          <span class="qa-label">Запити на відпустку</span>
        </button>
        <button class="quick-action-btn" @click="viewCompany">
          <span class="qa-icon">🏢</span>
          <span class="qa-label">Компанія</span>
        </button>
      </div>

      <!-- Two Column Layout -->
      <div class="two-column-layout">
        <div class="left-column">
          <!-- Recent Work Log -->
          <div class="content-section">
            <h2>📝 Історія робочого часу</h2>
            <TimeEntryList
              :entries="employeeStore.recentEntries"
              :is-loading="employeeStore.isLoadingEntries"
              :show-view-more="false"
            />
            <Pagination
              v-if="employeeStore.entriesMeta"
              :meta="employeeStore.entriesMeta"
              @change-page="handlePageChange"
            />
          </div>

          <!-- QR Code for Managers -->
          <div v-if="isManager" class="content-section">
            <QRCodeDisplay />
          </div>

          <!-- Error Banner -->
          <div v-if="employeeStore.error" class="error-banner">
            <p>{{ employeeStore.error }}</p>
            <button @click="employeeStore.clearError()">Закрити</button>
          </div>
        </div>

        <div class="right-column">
          <!-- Today's Schedule Widget -->
          <TodayScheduleWidget
            v-if="currentUser?.work_schedule"
            :current-user="currentUser"
            :today-hours="todayHours"
            :today-minutes="todayMinutes"
          />

          <div v-else-if="authStore.isLoadingUser" class="content-section">
            <h3>📅 Сьогоднішній графік</h3>
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Завантаження графіку...</p>
            </div>
          </div>

          <!-- Attendance Stats -->
          <div v-if="employeeStore.timeSummary" class="content-section">
            <h3>📊 Статистика відвідуваності</h3>
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
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Stats Grid */
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

.qa-icon {
  font-size: 1.1rem;
}

.qa-label {
  white-space: nowrap;
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1rem;
}

.content-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-section h2,
.content-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.25rem;
}

/* Attendance Grid */
.attendance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

/* Error Banner */
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

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .employee-dashboard {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
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

  .right-column {
    position: static;
  }

  .attendance-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
