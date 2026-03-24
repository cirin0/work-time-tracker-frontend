<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleGuard } from '@/composables/useRoleGuard.ts'
import { useEmployeeStore } from '@/stores/employee.store.ts'
import { useAuthStore } from '@/stores/auth.store.ts'
import ActiveWorkSessionCard from '@/components/work-time/ActiveWorkSessionCard.vue'
import TodayScheduleWidget from '@/components/work-time/TodayScheduleWidget.vue'
import TimeEntryList from '@/components/work-time/TimeEntryList.vue'
import StatCard from '@/components/ui/StatCard.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Card from '@/components/ui/Card.vue'

const router = useRouter()
const { currentUser } = useRoleGuard()
const authStore = useAuthStore()
const employeeStore = useEmployeeStore()

// Stats Card: Сьогодні
const todayStats = computed(() => {
  const hours = employeeStore.timeSummary?.summary.today.hours ?? 0
  const minutes = employeeStore.timeSummary?.summary.today.minutes ?? 0
  return { hours, minutes }
})

const todayHours = computed(() => employeeStore.timeSummary?.summary.today.hours ?? 0)
const todayMinutes = computed(() => employeeStore.timeSummary?.summary.today.minutes ?? 0)

// Stats Card: Тиждень
const weekStats = computed(() => {
  const hours = employeeStore.timeSummary?.summary.week.hours ?? 0
  const minutes = employeeStore.timeSummary?.summary.week.minutes ?? 0
  return { hours, minutes }
})

// Stats Card: Місяць
const monthStats = computed(() => {
  const hours = employeeStore.timeSummary?.summary.month.hours ?? 0
  const minutes = employeeStore.timeSummary?.summary.month.minutes ?? 0
  return { hours, minutes }
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
        <StatCard icon="📅" label="Сьогодні">
          <span class="stat-time"
            >{{ todayStats.hours }}г {{ todayStats.minutes.toString().padStart(2, '0') }}хв</span
          >
        </StatCard>
        <StatCard icon="📊" label="Тиждень">
          <span class="stat-time"
            >{{ weekStats.hours }}г {{ weekStats.minutes.toString().padStart(2, '0') }}хв</span
          >
        </StatCard>
        <StatCard icon="📈" label="Місяць">
          <span class="stat-time"
            >{{ monthStats.hours }}г {{ monthStats.minutes.toString().padStart(2, '0') }}хв</span
          >
        </StatCard>
        <StatCard icon="✅" label="Вчасно" :sub-text="attendanceStats.subText">
          <span class="stat-number">{{ attendanceStats.value }}</span>
        </StatCard>
      </div>

      <!-- Quick Actions -->
      <Card>
        <div class="quick-actions">
          <button class="quick-action-btn" @click="viewCompany">
            <span class="qa-icon">🏢</span>
            <span class="qa-label">Компанія</span>
          </button>
          <button class="quick-action-btn" @click="viewStatistics">
            <span class="qa-icon">📈</span>
            <span class="qa-label">Розширена статистика</span>
          </button>
          <button class="quick-action-btn" @click="viewLeaveRequests">
            <span class="qa-icon">📋</span>
            <span class="qa-label">Запити на відпустку</span>
          </button>
        </div>
      </Card>

      <!-- Two Column Layout -->
      <div class="two-column-layout">
        <div class="left-column">
          <!-- Recent Work Log -->
          <Card>
            <template #header>
              <h2>📝 Історія робочого часу</h2>
            </template>
            <TimeEntryList
              :entries="employeeStore.recentEntries"
              :is-loading="employeeStore.isLoadingEntries"
              :show-view-more="false"
            />
            <div v-if="employeeStore.entriesMeta" class="pagination-wrapper">
              <Pagination :meta="employeeStore.entriesMeta" @change-page="handlePageChange" />
            </div>
          </Card>

          <Card v-if="employeeStore.error" variant="highlighted">
            <div class="error-banner">
              <p>{{ employeeStore.error }}</p>
              <button @click="employeeStore.clearError()">Закрити</button>
            </div>
          </Card>
        </div>

        <div class="right-column">
          <!-- Today's Schedule Widget -->
          <TodayScheduleWidget
            v-if="currentUser?.work_schedule"
            :current-user="currentUser"
            :today-hours="todayHours"
            :today-minutes="todayMinutes"
          />

          <Card v-else-if="authStore.isLoadingUser">
            <template #header>
              <h3>📅 Сьогоднішній графік</h3>
            </template>
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Завантаження графіку...</p>
            </div>
          </Card>

          <!-- Attendance Stats -->
          <Card v-if="employeeStore.timeSummary">
            <template #header>
              <h3>📊 Статистика відвідуваності</h3>
            </template>
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
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-dashboard {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.subtitle {
  font-family: var(--font-body);
  color: var(--text-muted);
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

.stat-time,
.stat-number {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 2rem;
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
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-btn:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.quick-action-btn:disabled {
  opacity: 0.55;
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

.pagination-wrapper {
  margin-top: 1.25rem;
}

/* Card Headers */
.card-header h2,
.card-header h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
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
  background: var(--sand-light);
  border-radius: 0.5rem;
}

.attendance-value {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.attendance-value.on-time {
  color: var(--pin-ok-color);
}

.attendance-value.late {
  color: var(--error-text);
}

.attendance-value.early {
  color: var(--accent-2);
}

.attendance-value.overtime {
  color: var(--accent-1);
}

.attendance-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}

/* Error Banner */
.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
}

.error-banner p {
  font-family: var(--font-body);
  color: var(--error-text);
  margin: 0;
}

.error-banner button {
  background: none;
  border: none;
  color: var(--error-text);
  font-family: var(--font-body);
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
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-2);
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
  font-family: var(--font-body);
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: var(--bp-lg)) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .right-column {
    position: static;
  }
}

@media (max-width: var(--bp-sm)) {
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

  .attendance-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
