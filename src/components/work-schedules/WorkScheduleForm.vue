<script setup lang="ts">
import { computed } from 'vue'
import { useWorkScheduleForm } from '@/composables/useWorkScheduleForm'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type { CreateWorkScheduleRequest } from '@/types/requests/workScheduleRequest.interface'

interface Props {
  schedule?: WorkSchedule | null
  isSaving?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [payload: CreateWorkScheduleRequest]
  cancel: []
}>()

const scheduleRef = computed(() => props.schedule)

const {
  values,
  errors,
  generalError,
  submit,
  getDayError,
  updateName,
  updateIsDefault,
  updateDayField,
} = useWorkScheduleForm({
  schedule: scheduleRef,
  onSubmit: (payload) => emit('submit', payload),
})

const DAY_LABELS: Record<string, string> = {
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
  <div class="schedule-form">
    <div class="form-section">
      <label class="form-label"> Назва розкладу <span class="required">*</span> </label>
      <input
        :value="values.name"
        @input="updateName(($event.target as HTMLInputElement).value)"
        type="text"
        class="form-input"
        :class="{ 'input-error': errors.name }"
        placeholder="Наприклад: Стандартний робочий день"
        maxlength="255"
      />
      <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
    </div>

    <div class="form-section">
      <label class="checkbox-label">
        <input
          :checked="values.is_default"
          @change="updateIsDefault(($event.target as HTMLInputElement).checked)"
          type="checkbox"
          class="checkbox-input"
        />
        <span>Розклад за замовчуванням</span>
      </label>
      <p class="hint">Цей розклад буде автоматично призначений новим співробітникам</p>
    </div>

    <div class="form-section">
      <h4 class="section-title">Розклад по днях</h4>
      <div class="days-list">
        <div
          v-for="(day, index) in values.daily_schedules"
          :key="day.day_of_week"
          class="day-row"
          :class="{ 'day-active': day.is_working_day, 'day-has-error': !!getDayError(index) }"
        >
          <div class="day-toggle">
            <label class="toggle-label">
              <input
                :checked="day.is_working_day"
                @change="
                  updateDayField(
                    index,
                    'is_working_day',
                    ($event.target as HTMLInputElement).checked,
                  )
                "
                type="checkbox"
                class="checkbox-input"
              />
              <span class="day-name">{{ DAY_LABELS[day.day_of_week] || day.day_of_week }}</span>
            </label>
          </div>

          <div v-if="day.is_working_day" class="day-fields">
            <div class="time-group">
              <label class="time-label">Початок</label>
              <input
                :value="day.start_time"
                @input="
                  updateDayField(index, 'start_time', ($event.target as HTMLInputElement).value)
                "
                type="time"
                class="time-input"
                :class="{ 'input-error': !!getDayError(index) }"
              />
            </div>
            <div class="time-group">
              <label class="time-label">Кінець</label>
              <input
                :value="day.end_time"
                @input="
                  updateDayField(index, 'end_time', ($event.target as HTMLInputElement).value)
                "
                type="time"
                class="time-input"
                :class="{ 'input-error': !!getDayError(index) }"
              />
            </div>
            <div class="time-group">
              <label class="time-label">Перерва (хв)</label>
              <input
                :value="day.break_duration"
                @input="
                  updateDayField(
                    index,
                    'break_duration',
                    Number(($event.target as HTMLInputElement).value || 0),
                  )
                "
                type="number"
                min="0"
                max="240"
                class="number-input"
                placeholder="60"
              />
            </div>
            <span v-if="getDayError(index)" class="day-error">{{ getDayError(index) }}</span>
          </div>

          <div v-else class="day-off-indicator">Вихідний день</div>
        </div>
      </div>
    </div>

    <div v-if="generalError" class="error-message">{{ generalError }}</div>

    <div class="form-actions">
      <button type="button" class="btn-secondary" @click="emit('cancel')">Скасувати</button>
      <button type="button" class="btn-primary" :disabled="isSaving" @click="submit">
        <span v-if="isSaving">Збереження...</span>
        <span v-else>{{ schedule ? 'Зберегти зміни' : 'Створити розклад' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.required {
  color: var(--error-text);
}

.form-input {
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.1);
}

.input-error {
  border-color: var(--error-border) !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px var(--error-bg) !important;
}

.field-error {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--error-text);
  font-weight: 500;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-2);
  cursor: pointer;
}

.hint {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.75rem 0;
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.day-row {
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  background: var(--surface);
  transition: all 0.2s;
}

.day-active {
  background: var(--sand-light);
  border-color: var(--accent-2);
}

.day-has-error {
  border-color: var(--error-border);
  background: var(--error-bg);
}

.day-toggle {
  min-width: 140px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.day-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.day-fields {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.time-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.time-input,
.number-input {
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: all 0.2s;
}

.time-input:focus,
.number-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 2px rgba(255, 155, 81, 0.1);
}

.number-input {
  width: 80px;
}

.day-off-indicator {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.day-error {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--error-text);
  width: 100%;
  margin-top: 0.25rem;
  font-weight: 500;
}

.error-message {
  background: var(--error-bg);
  border: 1.5px solid var(--error-border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--error-text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

.btn-secondary {
  padding: 0.6rem 1.25rem;
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.btn-secondary:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.btn-primary {
  padding: 0.6rem 1.5rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:not(:disabled):hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.4);
}

@media (max-width: 900px) {
  .day-fields {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .day-row {
    padding: 0.75rem 1rem;
  }

  .day-toggle {
    min-width: 120px;
  }

  .time-group {
    flex: 1;
    min-width: 100px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
