<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
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
  <Card :variant="schedule.is_default ? 'highlighted' : 'default'">
    <template #header>
      <div class="card-title-row">
        <h3 class="card-title">{{ schedule.name }}</h3>
        <Badge v-if="schedule.is_default" variant="status-active" label="За замовчуванням" />
      </div>
      <div class="card-actions">
        <button
          class="btn-action btn-assign"
          @click="emit('assign', schedule)"
          title="Призначити співробітнику"
        >
          👤
        </button>
        <button class="btn-action btn-edit" @click="emit('edit', schedule)" title="Редагувати">
          ✏️
        </button>
        <button
          class="btn-action btn-delete"
          :disabled="isDeleting"
          @click="emit('delete', schedule.id)"
          title="Видалити"
        >
          🗑️
        </button>
      </div>
    </template>

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
  </Card>
</template>

<style scoped>
.card-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.card-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow);
}

.btn-assign:hover:not(:disabled) {
  border-color: var(--accent-2);
  background: var(--sand-light);
}

.btn-edit:hover:not(:disabled) {
  border-color: var(--accent-2);
  background: var(--sand-light);
}

.btn-delete:hover:not(:disabled) {
  border-color: var(--error-border);
  background: var(--error-bg);
}

.btn-delete:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.schedule-meta {
  margin-bottom: 1rem;
}

.meta-item {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-cell {
  border-radius: 0.5rem;
  padding: 0.5rem 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  border: 1.5px solid var(--border);
  background: var(--surface);
  transition: all 0.2s;
}

.day-working {
  background: var(--sand-light);
  border-color: var(--accent-2);
}

.day-off {
  background: var(--surface);
  border-color: var(--border);
}

.day-label {
  font-family: var(--font-body);
  font-weight: 700;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  color: var(--text);
}

.day-time {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--text);
}

.day-break {
  font-family: var(--font-body);
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.day-off-label {
  font-family: var(--font-body);
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  font-style: italic;
}

@media (max-width: var(--bp-lg)) {
  .days-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: var(--bp-sm)) {
  .days-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .card-actions {
    flex-wrap: wrap;
  }
}
</style>
