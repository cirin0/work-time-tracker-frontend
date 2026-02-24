<script setup lang="ts">
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'

interface Props {
  schedule: WorkSchedule
  isDeleting?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [schedule: WorkSchedule]
  delete: [id: number]
  assign: [schedule: WorkSchedule]
}>()

const DAY_LABELS: Record<string, string> = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Нд',
}

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function getDaySchedule(day: string) {
  return props.schedule.daily_schedules?.find((ds) => ds.day_of_week === day) ?? null
}

function workingDaysCount() {
  return props.schedule.daily_schedules?.filter((ds) => ds.is_working_day).length ?? 0
}
</script>

<template>
  <div class="schedule-card" :class="{ 'is-default': schedule.is_default }">
    <div class="card-header">
      <div class="card-title-row">
        <h3 class="card-title">{{ schedule.name }}</h3>
        <span v-if="schedule.is_default" class="badge-default">За замовчуванням</span>
      </div>
      <div class="card-actions">
        <button
          class="btn-assign"
          @click="emit('assign', schedule)"
          title="Призначити співробітнику"
        >
          👤
        </button>
        <button class="btn-edit" @click="emit('edit', schedule)" title="Редагувати">✏️</button>
        <button
          class="btn-delete"
          :disabled="isDeleting"
          @click="emit('delete', schedule.id)"
          title="Видалити"
        >
          🗑️
        </button>
      </div>
    </div>

    <div class="schedule-meta">
      <span class="meta-item">📅 {{ workingDaysCount() }} робочих днів</span>
    </div>

    <div class="days-grid">
      <div
        v-for="day in ALL_DAYS"
        :key="day"
        class="day-cell"
        :class="{
          'day-working': getDaySchedule(day)?.is_working_day,
          'day-off': !getDaySchedule(day)?.is_working_day,
        }"
      >
        <div class="day-label">{{ DAY_LABELS[day] }}</div>
        <template v-if="getDaySchedule(day)?.is_working_day">
          <div class="day-time">{{ getDaySchedule(day)?.start_time?.slice(0, 5) }}</div>
          <div class="day-time">{{ getDaySchedule(day)?.end_time?.slice(0, 5) }}</div>
          <div v-if="getDaySchedule(day)?.break_duration" class="day-break">
            перерва {{ getDaySchedule(day)?.break_duration }}хв
          </div>
        </template>
        <div v-else class="day-off-label">вихідний</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  transition: box-shadow 0.2s;
}

.schedule-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.schedule-card.is-default {
  border-color: #2563eb;
  border-width: 2px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.badge-default {
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 0.35rem;
}

.card-actions button {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.25rem 0.4rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn-assign:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.btn-edit:hover {
  background: #fff7ed;
  border-color: #f97316;
}

.btn-delete:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #ef4444;
}

.btn-delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.schedule-meta {
  margin-bottom: 0.75rem;
}

.meta-item {
  font-size: 0.8rem;
  color: #6b7280;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.3rem;
}

.day-cell {
  border-radius: 8px;
  padding: 0.4rem 0.2rem;
  text-align: center;
  font-size: 0.72rem;
}

.day-working {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.day-off {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  color: #9ca3af;
}

.day-label {
  font-weight: 700;
  margin-bottom: 0.2rem;
  font-size: 0.75rem;
}

.day-time {
  line-height: 1.3;
}

.day-break {
  font-size: 0.62rem;
  opacity: 0.75;
  margin-top: 0.15rem;
}

.day-off-label {
  font-size: 0.65rem;
  color: #d1d5db;
  margin-top: 0.2rem;
}
</style>
