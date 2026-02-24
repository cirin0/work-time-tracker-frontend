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

const { values, errors, dayFieldsWithErrors, generalError, submit } = useWorkScheduleForm({
  schedule: scheduleRef,
  onSubmit: (payload) => emit('submit', payload),
})
</script>

<template>
  <div class="schedule-form">
    <div class="form-section">
      <label class="form-label">Назва розкладу <span class="required">*</span></label>
      <input
        v-model="values.name"
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
        <input v-model="values.is_default" type="checkbox" class="checkbox-input" />
        <span>Розклад за замовчуванням</span>
      </label>
      <p class="hint">Цей розклад буде автоматично призначений новим співробітникам</p>
    </div>

    <div class="form-section">
      <h4 class="section-title">Розклад по днях</h4>
      <div class="days-list">
        <div
          v-for="{ field, error, label } in dayFieldsWithErrors"
          :key="field.value.day_of_week"
          class="day-row"
          :class="{ 'day-active': field.value.is_working_day, 'day-has-error': !!error }"
        >
          <div class="day-toggle">
            <label class="toggle-label">
              <input v-model="field.value.is_working_day" type="checkbox" class="checkbox-input" />
              <span class="day-name">{{ label }}</span>
            </label>
          </div>

          <div v-if="field.value.is_working_day" class="day-fields">
            <div class="time-group">
              <label class="time-label">Початок</label>
              <input
                v-model="field.value.start_time"
                type="time"
                class="time-input"
                :class="{ 'input-error': !!error }"
              />
            </div>
            <div class="time-group">
              <label class="time-label">Кінець</label>
              <input
                v-model="field.value.end_time"
                type="time"
                class="time-input"
                :class="{ 'input-error': !!error }"
              />
            </div>
            <div class="time-group">
              <label class="time-label">Перерва (хв)</label>
              <input
                v-model.number="field.value.break_duration"
                type="number"
                min="0"
                max="240"
                class="number-input"
                placeholder="60"
              />
            </div>
            <span v-if="error" class="day-error">{{ error }}</span>
          </div>

          <div v-else class="day-off-indicator">Вихідний день</div>
        </div>
      </div>
    </div>

    <div v-if="generalError" class="error-message">{{ generalError }}</div>

    <div class="form-actions">
      <button type="button" class="btn-cancel" @click="emit('cancel')">Скасувати</button>
      <button type="button" class="btn-submit" :disabled="isSaving" @click="submit">
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
  gap: 1.25rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.9rem;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-error {
  border-color: #ef4444 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.field-error {
  font-size: 0.78rem;
  color: #dc2626;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
}

.hint {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-row {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: #fafafa;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.day-active {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.day-has-error {
  border-color: #fca5a5;
  background: #fff5f5;
}

.day-toggle {
  min-width: 130px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.day-name {
  font-size: 0.88rem;
  font-weight: 500;
  color: #374151;
}

.day-fields {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.time-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.time-label {
  font-size: 0.72rem;
  color: #6b7280;
  font-weight: 500;
}

.time-input,
.number-input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
  color: #1f2937;
  outline: none;
  background: white;
}

.time-input:focus,
.number-input:focus {
  border-color: #2563eb;
}

.number-input {
  width: 70px;
}

.day-off-indicator {
  font-size: 0.8rem;
  color: #9ca3af;
  font-style: italic;
}

.day-error {
  font-size: 0.75rem;
  color: #dc2626;
  width: 100%;
  margin-top: 0.15rem;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.6rem 0.875rem;
  color: #dc2626;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.btn-cancel {
  padding: 0.55rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  padding: 0.55rem 1.5rem;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  opacity: 0.9;
}
</style>
