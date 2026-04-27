<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/interfaces/user.interface'
import type { DailySchedule } from '@/types/interfaces/dailySchedule.interface'
import Card from '@/components/ui/Card.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import ClockIcon from '@/icons/ClockIcon.vue'
import ExclamationTriangleIcon from '@/icons/ExclamationTriangleIcon.vue'
import DocumentTextIcon from '@/icons/DocumentTextIcon.vue'

interface Props {
  currentUser: User | null
  todayHours: number
  todayMinutes: number
}

const props = defineProps<Props>()

const dayNames: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

const todayScheduleEntry = computed<DailySchedule | null>(() => {
  if (!props.currentUser?.work_schedule?.daily_schedules) return null

  const today = new Date().getDay()
  const todayName = dayNames[today]

  return (
    props.currentUser.work_schedule.daily_schedules.find(
      (schedule) => schedule.day_of_week === todayName,
    ) || null
  )
})

const hasConfiguredSchedule = computed(
  () => (props.currentUser?.work_schedule?.daily_schedules?.length ?? 0) > 0,
)

const todaySchedule = computed<DailySchedule | null>(() => {
  if (!todayScheduleEntry.value?.is_working_day) return null
  return todayScheduleEntry.value
})

const expectedHours = computed(() => {
  if (!todaySchedule.value) return 0

  const [startHour, startMin] = todaySchedule.value.start_time.split(':').map(Number)
  const [endHour, endMin] = todaySchedule.value.end_time.split(':').map(Number)

  const startMinutes = (startHour || 0) * 60 + (startMin || 0)
  const endMinutes = (endHour || 0) * 60 + (endMin || 0)

  const minutesInDay = 24 * 60
  const rawDurationMinutes =
    endMinutes > startMinutes ? endMinutes - startMinutes : minutesInDay - startMinutes + endMinutes
  const totalMinutes = Math.max(rawDurationMinutes, 0)

  return totalMinutes / 60
})

const actualMinutes = computed(() => {
  return props.todayHours * 60 + props.todayMinutes
})

const progressPercentage = computed(() => {
  if (expectedHours.value <= 0) return 0
  const expectedMinutes = expectedHours.value * 60
  const percentage = (actualMinutes.value / expectedMinutes) * 100
  return Math.min(Math.round(percentage), 100)
})

const progressBarWidth = computed(() => `${progressPercentage.value}%`)

const progressStatus = computed<'pending' | 'on-track' | 'completed' | 'overtime'>(() => {
  if (progressPercentage.value === 0) return 'pending'
  if (progressPercentage.value < 100) return 'on-track'
  if (progressPercentage.value === 100) return 'completed'
  return 'overtime'
})

const statusColor = computed(() => {
  const colors = {
    pending: 'var(--status-pending)',
    'on-track': 'var(--status-on-track)',
    completed: 'var(--status-completed)',
    overtime: 'var(--status-overtime)',
  }
  return colors[progressStatus.value]
})
</script>

<template>
  <Card>
    <template #header>
      <h3 class="widget-title">
        <CalendarIcon style="width: 20px; margin-right: 0.5rem; vertical-align: middle" />
        Сьогоднішній графік
      </h3>
    </template>

    <div v-if="todaySchedule" class="schedule-content">
      <div class="schedule-time">
        <div class="time-item">
          <span class="time-label">Початок</span>
          <span class="time-value">{{ todaySchedule.start_time }}</span>
        </div>
        <div class="time-divider">—</div>
        <div class="time-item">
          <span class="time-label">Кінець</span>
          <span class="time-value">{{ todaySchedule.end_time }}</span>
        </div>
      </div>

      <div v-if="todaySchedule.break_duration" class="break-info">
        <span class="break-icon"><ClockIcon /></span>
        <span>Перерва: {{ todaySchedule.break_duration }} хв</span>
      </div>

      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Прогрес</span>
          <span class="progress-value">
            {{ todayHours }}г {{ todayMinutes }}хв / {{ expectedHours.toFixed(1) }}г
          </span>
        </div>

        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{ width: progressBarWidth, backgroundColor: statusColor }"
          ></div>
        </div>

        <div class="progress-percentage" :style="{ color: statusColor }">
          {{ progressPercentage }}%
        </div>
      </div>

      <div v-if="progressStatus === 'completed'" class="status-message success">
        ✓ Відмінно! Ви виконали денну норму
      </div>
      <div v-else-if="progressStatus === 'overtime'" class="status-message warning">
        <ExclamationTriangleIcon
          style="width: 1.1rem; height: 1.1rem; margin-right: 0.25rem; vertical-align: middle"
        />
        Понаднормова робота
      </div>
    </div>

    <div v-else-if="hasConfiguredSchedule && todayScheduleEntry" class="schedule-empty">
      <div class="empty-icon"><CalendarIcon /></div>
      <p class="empty-text">Сьогодні вихідний день</p>
      <p class="empty-hint">У графіку цей день позначено як неробочий</p>
    </div>

    <div v-else class="schedule-empty">
      <div class="empty-icon"><DocumentTextIcon /></div>
      <p class="empty-text">Графік роботи не налаштовано</p>
      <p class="empty-hint">Зверніться до вашого менеджера для налаштування графіку</p>
    </div>
  </Card>
</template>

<style scoped>
.widget-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.schedule-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--sand-light);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.time-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.time-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.time-value {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-2);
}

.time-divider {
  font-size: 1.5rem;
  color: var(--text-muted);
  font-weight: 300;
}

.break-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--warning-text);
}

.break-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.break-icon :deep(svg) {
  width: 1.125rem;
  height: 1.125rem;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.progress-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.progress-value {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.progress-bar-container {
  height: 12px;
  background: var(--border);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: all 0.3s ease;
  position: relative;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-percentage {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.status-message {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.status-message.success {
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.status-message.warning {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 1px solid var(--warning-border);
}

/* Empty State */
.schedule-empty {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  opacity: 0.5;
  color: var(--text-muted);
}

.empty-icon :deep(svg) {
  width: 3rem;
  height: 3rem;
}

.empty-text {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

@media (max-width: var(--bp-md)) {
  .time-value {
    font-size: 1.25rem;
  }
}
</style>
