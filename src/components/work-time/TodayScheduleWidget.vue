<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/types/interfaces/user.interface'
import type { DailySchedule } from '@/types/interfaces/dailySchedule.interface'
import { formatDateTime } from '@/core/utils/date'

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

const todaySchedule = computed<DailySchedule | null>(() => {
  if (!props.currentUser?.work_schedule?.daily_schedules) return null

  const today = new Date().getDay()
  const todayName = dayNames[today]

  return (
    props.currentUser.work_schedule.daily_schedules.find(
      (schedule) => schedule.day_of_week === todayName && schedule.is_working_day,
    ) || null
  )
})

const expectedHours = computed(() => {
  if (!todaySchedule.value) return 0

  const [startHour, startMin] = todaySchedule.value.start_time.split(':').map(Number)
  const [endHour, endMin] = todaySchedule.value.end_time.split(':').map(Number)

  const startMinutes = (startHour || 0) * 60 + (startMin || 0)
  const endMinutes = (endHour || 0) * 60 + (endMin || 0)
  const breakMinutes = todaySchedule.value.break_duration || 0

  const totalMinutes = endMinutes - startMinutes - breakMinutes

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
    pending: '#94a3b8',
    'on-track': '#3b82f6',
    completed: '#22c55e',
    overtime: '#f59e0b',
  }
  return colors[progressStatus.value]
})
</script>

<template>
  <div class="schedule-widget">
    <h3 class="widget-title">📅 Сьогоднішній графік</h3>

    <div v-if="todaySchedule" class="schedule-content">
      <div class="schedule-time">
        <div class="time-item">
          <span class="time-label">Початок</span>
          <span class="time-value">{{ formatDateTime(todaySchedule.start_time) }}</span>
        </div>
        <div class="time-divider">—</div>
        <div class="time-item">
          <span class="time-label">Кінець</span>
          <span class="time-value">{{ formatDateTime(todaySchedule.end_time) }}</span>
        </div>
      </div>

      <div v-if="todaySchedule.break_duration" class="break-info">
        <span class="break-icon">☕</span>
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
        ✅ Відмінно! Ви виконали денну норму
      </div>
      <div v-else-if="progressStatus === 'overtime'" class="status-message warning">
        ⚡ Понаднормова робота
      </div>
    </div>

    <div v-else class="schedule-empty">
      <div class="empty-icon">📋</div>
      <p class="empty-text">Графік роботи не налаштовано</p>
      <p class="empty-hint">Зверніться до вашого менеджера для налаштування графіку</p>
    </div>
  </div>
</template>

<style scoped>
.schedule-widget {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.widget-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.25rem;
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
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 0.5rem;
}

.time-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.time-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.time-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2563eb;
}

.time-divider {
  font-size: 1.5rem;
  color: #94a3b8;
  font-weight: 300;
}

.break-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #92400e;
}

.break-icon {
  font-size: 1.125rem;
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
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.progress-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.progress-bar-container {
  height: 12px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
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
  font-size: 1.125rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.status-message {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.status-message.success {
  background: #dcfce7;
  color: #166534;
}

.status-message.warning {
  background: #fef3c7;
  color: #92400e;
}

/* Empty State */
.schedule-empty {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 768px) {
  .schedule-widget {
    padding: 1.25rem;
  }

  .time-value {
    font-size: 1.25rem;
  }
}
</style>
