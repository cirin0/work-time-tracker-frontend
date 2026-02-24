<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useManagerStore } from '@/stores/manager.store'
import { useWorkScheduleStore } from '@/stores/workSchedule.store'
import type { User } from '@/types/interfaces/user.interface'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { TimeEntrySummary } from '@/types/interfaces/timeEntrySummary.interface'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import { formatDate, formatTime } from '@/core/utils/date'
import { getAvatarUrl } from '@/core/utils/url'

const route = useRoute()
const router = useRouter()
const managerStore = useManagerStore()
const workScheduleStore = useWorkScheduleStore()

const employeeId = computed(() => Number(route.params.id))
const employee = ref<User | null>(null)
const employeeSummary = ref<TimeEntrySummary | null>(null)
const employeeTimeEntries = ref<TimeEntry[]>([])
const employeeWorkSchedule = ref<WorkSchedule | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const activeTab = ref<'overview' | 'timeEntries' | 'schedule'>('overview')

// Schedule editing
const isEditingSchedule = ref(false)
const selectedScheduleId = ref<number | null>(null)
const scheduleAssignSuccess = ref<string | null>(null)
const scheduleAssignError = ref<string | null>(null)

const avatarUrl = ref<string | null>(null)
watch(
  () => employee.value?.avatar,
  () => {
    avatarUrl.value = getAvatarUrl(employee.value?.avatar)
  },
  { immediate: true },
)

onMounted(() => {
  loadEmployeeDetails()
  workScheduleStore.fetchWorkSchedules()
})

async function loadEmployeeDetails() {
  isLoading.value = true
  loadError.value = null
  try {
    // Завантажуємо основні дані - якщо вони не завантажаться, показуємо помилку
    await managerStore.fetchEmployeeById(employeeId.value)
    employee.value = managerStore.selectedEmployee

    if (!employee.value) {
      loadError.value = 'Співробітника не знайдено'
      return
    }

    // Решту даних завантажуємо незалежно - якщо щось не завантажиться, це не критично
    await Promise.allSettled([
      managerStore.fetchEmployeeTimeSummary(employeeId.value).then(() => {
        employeeSummary.value = managerStore.selectedEmployeeSummary
      }),
      managerStore.fetchEmployeeWorkSchedule(employeeId.value).then(() => {
        employeeWorkSchedule.value = managerStore.selectedEmployeeWorkSchedule
      }),
    ])
  } catch (error) {
    console.error('Failed to load employee details:', error)
    loadError.value = managerStore.error || 'Не вдалося завантажити дані співробітника'
  } finally {
    isLoading.value = false
  }
}

async function loadTimeEntries() {
  if (employeeTimeEntries.value.length > 0) return
  try {
    await managerStore.fetchEmployeeTimeEntries(employeeId.value)
    employeeTimeEntries.value = managerStore.selectedEmployeeTimeEntries
  } catch (error) {
    console.error('Failed to load time entries:', error)
  }
}

async function assignSchedule() {
  if (!selectedScheduleId.value) return
  scheduleAssignError.value = null
  scheduleAssignSuccess.value = null
  try {
    await workScheduleStore.assignScheduleToEmployee(employeeId.value, {
      work_schedule_id: selectedScheduleId.value,
    })
    // Refresh employee work schedule
    await managerStore.fetchEmployeeWorkSchedule(employeeId.value)
    employeeWorkSchedule.value = managerStore.selectedEmployeeWorkSchedule
    // Also refresh employee info to update work_schedule name in the card
    await managerStore.fetchEmployeeById(employeeId.value)
    employee.value = managerStore.selectedEmployee
    scheduleAssignSuccess.value = 'Графік роботи успішно змінено'
    isEditingSchedule.value = false
    selectedScheduleId.value = null
    setTimeout(() => (scheduleAssignSuccess.value = null), 4000)
  } catch {
    scheduleAssignError.value = workScheduleStore.error ?? 'Помилка призначення графіку'
  }
}

function goBack() {
  router.push({ name: 'main' })
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}г ${mins}хв`
}

const workModeLabel = computed(() => {
  const modes: Record<string, string> = {
    remote: 'Віддалено',
    office: 'Офіс',
    hybrid: 'Гібрид',
  }
  return modes[employee.value?.work_mode || ''] || employee.value?.work_mode || '-'
})

const daysOfWeekLabels: Record<string, string> = {
  monday: 'Понеділок',
  tuesday: 'Вівторок',
  wednesday: 'Середа',
  thursday: 'Четвер',
  friday: "П'ятниця",
  saturday: 'Субота',
  sunday: 'Неділя',
}
</script>

<template>
  <div class="employee-details">
    <div class="page-header">
      <button @click="goBack" class="btn-back">← Назад</button>
      <h1>Деталі співробітника</h1>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Завантаження...</p>
    </div>

    <div v-else-if="employee" class="content-wrapper">
      <!-- Employee Info Card -->
      <div class="employee-card">
        <div class="employee-header">
          <div class="employee-avatar">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="employee.name" />
            <div v-else class="avatar-placeholder">
              {{ employee.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="employee-info">
            <h2>{{ employee.name }}</h2>
            <p class="employee-email">{{ employee.email }}</p>
            <div class="badges">
              <span class="badge badge-mode">{{ workModeLabel }}</span>
            </div>
          </div>
        </div>

        <div class="employee-details-grid">
          <div class="detail-item">
            <span class="label">Компанія:</span>
            <span class="value">{{ employee.company?.name || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Менеджер:</span>
            <span class="value">{{ employee.manager?.name || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Графік роботи:</span>
            <span class="value">{{ employee.work_schedule?.name || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Дата реєстрації:</span>
            <span class="value">{{ formatDate(employee.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="employeeSummary" class="stats-section">
        <h3>Статистика роботи</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">
                {{ employeeSummary.summary.today.hours }}г
                {{ employeeSummary.summary.today.minutes }}хв
              </div>
              <div class="stat-label">Сьогодні</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">
                {{ employeeSummary.summary.week.hours }}г
                {{ employeeSummary.summary.week.minutes }}хв
              </div>
              <div class="stat-label">Цього тижня</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-value">
                {{ employeeSummary.summary.month.hours }}г
                {{ employeeSummary.summary.month.minutes }}хв
              </div>
              <div class="stat-label">Цього місяця</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ employeeSummary.entries_count }}</div>
              <div class="stat-label">Всього записів</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-section">
        <div class="tabs">
          <button
            @click="activeTab = 'overview'"
            :class="{ active: activeTab === 'overview' }"
            class="tab"
          >
            Огляд
          </button>
          <button
            @click="((activeTab = 'timeEntries'), loadTimeEntries())"
            :class="{ active: activeTab === 'timeEntries' }"
            class="tab"
          >
            Записи часу
          </button>
          <button
            @click="activeTab = 'schedule'"
            :class="{ active: activeTab === 'schedule' }"
            class="tab"
          >
            Графік роботи
          </button>
        </div>

        <div class="tab-content">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="overview">
            <div class="info-card">
              <h4>Загальна інформація</h4>
              <p v-if="employeeSummary">
                Середній робочий час:
                <strong>{{ formatDuration(employeeSummary.average_work_time) }}</strong>
              </p>
              <p>
                Всього годин:
                <strong>{{
                  employeeSummary ? formatDuration(employeeSummary.total_minutes) : '-'
                }}</strong>
              </p>
            </div>
          </div>

          <!-- Time Entries Tab -->
          <div v-if="activeTab === 'timeEntries'" class="time-entries">
            <div v-if="employeeTimeEntries.length === 0" class="empty-state">
              <p>Записи часу відсутні</p>
            </div>
            <div v-else class="entries-list">
              <div v-for="entry in employeeTimeEntries" :key="entry.id" class="entry-item">
                <div class="entry-date">{{ formatDate(entry.created_at) }}</div>
                <div class="entry-details">
                  <div class="entry-time">
                    <span>{{ formatTime(entry.start_time) }}</span>
                    <span>→</span>
                    <span>{{ formatTime(entry.stop_time) }}</span>
                  </div>
                  <div class="entry-duration">Тривалість: {{ formatDuration(entry.duration) }}</div>
                  <div class="entry-type">Тип: {{ entry.entry_type }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule Tab -->
          <div v-if="activeTab === 'schedule'" class="schedule">
            <!-- Success / error notifications -->
            <Transition name="fade">
              <div v-if="scheduleAssignSuccess" class="schedule-notify success">
                ✓ {{ scheduleAssignSuccess }}
              </div>
            </Transition>
            <Transition name="fade">
              <div v-if="scheduleAssignError" class="schedule-notify error">
                {{ scheduleAssignError }}
              </div>
            </Transition>

            <div
              v-if="!employeeWorkSchedule || !employeeWorkSchedule.daily_schedules?.length"
              class="empty-state"
            >
              <p>Графік роботи не призначений</p>
            </div>
            <div v-else>
              <div class="schedule-header">
                <h4>{{ employeeWorkSchedule.name }}</h4>
                <button
                  v-if="!isEditingSchedule"
                  class="btn-change-schedule"
                  @click="isEditingSchedule = true"
                >
                  ✏️ Змінити графік
                </button>
              </div>
              <div class="schedule-list">
                <div
                  v-for="day in employeeWorkSchedule.daily_schedules"
                  :key="day.id"
                  class="schedule-item"
                  :class="{ 'non-working': !day.is_working_day }"
                >
                  <div class="day-name">{{ daysOfWeekLabels[day.day_of_week] }}</div>
                  <div v-if="day.is_working_day" class="day-time">
                    {{ day.start_time }} - {{ day.end_time }}
                    <span v-if="day.break_duration" class="break-info">
                      (перерва: {{ day.break_duration }}хв)
                    </span>
                  </div>
                  <div v-else class="day-off">Вихідний</div>
                </div>
              </div>
            </div>

            <!-- Assign schedule form -->
            <div v-if="isEditingSchedule" class="assign-schedule-form">
              <h5>Призначити інший графік</h5>
              <div class="assign-row">
                <select v-model.number="selectedScheduleId" class="schedule-select">
                  <option :value="null" disabled>Оберіть графік...</option>
                  <option v-for="s in workScheduleStore.workSchedules" :key="s.id" :value="s.id">
                    {{ s.name }}{{ s.is_default ? ' (за замовчуванням)' : '' }}
                  </option>
                </select>
                <button
                  class="btn-assign"
                  :disabled="!selectedScheduleId || workScheduleStore.isSaving"
                  @click="assignSchedule"
                >
                  {{ workScheduleStore.isSaving ? 'Збереження...' : 'Призначити' }}
                </button>
                <button
                  class="btn-cancel-assign"
                  @click="((isEditingSchedule = false), (selectedScheduleId = null))"
                >
                  Скасувати
                </button>
              </div>
              <div v-if="scheduleAssignError" class="assign-error">{{ scheduleAssignError }}</div>
            </div>

            <!-- No schedule assigned yet but can still assign -->
            <div v-if="!employeeWorkSchedule && !isEditingSchedule" class="assign-prompt">
              <button class="btn-change-schedule" @click="isEditingSchedule = true">
                + Призначити графік
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Помилка завантаження</h3>
      <p>{{ loadError || 'Не вдалося завантажити дані співробітника' }}</p>
      <button @click="loadEmployeeDetails" class="btn-primary">Спробувати знову</button>
    </div>
  </div>
</template>

<style scoped>
.employee-details {
  max-width: 1200px;
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
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e5e7eb;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.employee-card {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.employee-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.employee-avatar img,
.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
}

.employee-info h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.employee-email {
  color: #6b7280;
  margin: 0 0 1rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-mode {
  background: #d1fae5;
  color: #065f46;
}

.employee-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-item .value {
  font-weight: 600;
  color: #1f2937;
}

.stats-section {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.tabs-section {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #2563eb;
  background: #f9fafb;
}

.tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.tab-content {
  padding: 2rem;
}

.overview .info-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

.info-card h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem;
}

.info-card p {
  margin: 0.5rem 0;
  color: #4b5563;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entry-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  gap: 1rem;
}

.entry-date {
  font-weight: 600;
  color: #1f2937;
  min-width: 120px;
}

.entry-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.entry-time {
  display: flex;
  gap: 0.5rem;
  color: #4b5563;
}

.entry-duration,
.entry-type {
  color: #6b7280;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.schedule-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-item.non-working {
  background: #fef2f2;
}

.day-name {
  font-weight: 600;
  color: #1f2937;
}

.day-time {
  color: #4b5563;
}

.break-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.day-off {
  color: #dc2626;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.error-state p {
  color: #dc2626;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
}

/* Schedule editing */
.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.schedule-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-change-schedule {
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-change-schedule:hover {
  opacity: 0.88;
}

.assign-schedule-form {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #f8faff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
}

.assign-schedule-form h5 {
  font-size: 0.92rem;
  font-weight: 600;
  color: #1d4ed8;
  margin: 0 0 0.85rem 0;
}

.assign-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.schedule-select {
  flex: 1;
  min-width: 180px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.88rem;
  color: #1f2937;
  outline: none;
  background: white;
}

.schedule-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-assign {
  padding: 0.5rem 1.1rem;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.btn-assign:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-assign:not(:disabled):hover {
  opacity: 0.88;
}

.btn-cancel-assign {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.88rem;
  cursor: pointer;
}

.btn-cancel-assign:hover {
  background: #f9fafb;
}

.assign-error {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #dc2626;
}

.assign-prompt {
  margin-top: 1rem;
  text-align: center;
}

.schedule-notify {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.schedule-notify.success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #15803d;
}

.schedule-notify.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
