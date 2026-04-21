<script setup lang="ts">
import { ref, computed } from 'vue'
import { LeaveRequestType } from '@/types/enums/enums.types'
import { todayAsInputDate } from '@/core/utils/date'

interface Props {
  showForm: boolean
  isSubmitting?: boolean
}

interface FormData {
  type: LeaveRequestType | ''
  start_date: string
  end_date: string
  reason: string
}

withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: { type: LeaveRequestType; start_date: string; end_date: string; reason?: string }]
}>()

const formData = ref<FormData>({
  type: '',
  start_date: '',
  end_date: '',
  reason: '',
})

const errors = ref<Partial<Record<keyof FormData, string>>>({})
const generalError = ref<string | null>(null)

const minDate = computed(() => todayAsInputDate())

function validateForm(): boolean {
  errors.value = {}
  generalError.value = null

  if (!formData.value.type) {
    errors.value.type = "Тип відпустки є обов'язковим"
  }

  if (!formData.value.start_date) {
    errors.value.start_date = "Дата початку є обов'язковою"
  }

  if (!formData.value.end_date) {
    errors.value.end_date = "Дата кінця є обов'язковою"
  }

  if (formData.value.start_date && formData.value.end_date) {
    const startDate = new Date(formData.value.start_date)
    const endDate = new Date(formData.value.end_date)

    if (endDate < startDate) {
      errors.value.end_date = 'Дата кінця не може бути раніше дати початку'
    }
  }

  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validateForm()) {
    return
  }

  if (!formData.value.type) {
    generalError.value = 'Будь ласка, оберіть тип відпустки'
    return
  }

  emit('submit', {
    type: formData.value.type as LeaveRequestType,
    start_date: formData.value.start_date,
    end_date: formData.value.end_date,
    reason: formData.value.reason || undefined,
  })
}

function handleClose() {
  formData.value = {
    type: '',
    start_date: '',
    end_date: '',
    reason: '',
  }
  errors.value = {}
  generalError.value = null
  emit('close')
}

defineExpose({
  setError: (error: string) => {
    generalError.value = error
  },
})
</script>

<template>
  <div class="leave-request-form-wrapper">
    <div v-if="showForm" class="form-overlay" @click="handleClose">
      <div class="form-container" @click.stop>
        <div class="form-header">
          <h2>Новий запит на відпустку</h2>
          <button @click="handleClose" class="close-button">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="leave-request-form">
          <div v-if="generalError" class="error-alert">
            {{ generalError }}
          </div>

          <div class="form-group">
            <label for="type" class="form-label"
              >Тип відпустки<span class="required">*</span></label
            >
            <select
              id="type"
              v-model="formData.type"
              class="form-input"
              :class="{ 'input-error': errors.type }"
            >
              <option value="" disabled>Оберіть тип відпустки</option>
              <option value="vacation">Відпустка</option>
              <option value="sick">Лікарняний</option>
              <option value="personal">Особисті причини</option>
              <option value="business_trip">Відрядження</option>
            </select>
            <span v-if="errors.type" class="field-error">{{ errors.type }}</span>
          </div>

          <div class="form-group">
            <label for="start_date" class="form-label"
              >Дата початку<span class="required">*</span></label
            >
            <input
              id="start_date"
              v-model="formData.start_date"
              type="date"
              class="form-input"
              :class="{ 'input-error': errors.start_date }"
              :min="minDate"
            />
            <span v-if="errors.start_date" class="field-error">{{ errors.start_date }}</span>
          </div>

          <div class="form-group">
            <label for="end_date" class="form-label"
              >Дата кінця<span class="required">*</span></label
            >
            <input
              id="end_date"
              v-model="formData.end_date"
              type="date"
              class="form-input"
              :class="{ 'input-error': errors.end_date }"
              :min="formData.start_date || minDate"
            />
            <span v-if="errors.end_date" class="field-error">{{ errors.end_date }}</span>
          </div>

          <div class="form-group">
            <label for="reason" class="form-label">Причина</label>
            <textarea
              id="reason"
              v-model="formData.reason"
              class="form-textarea"
              :class="{ 'input-error': errors.reason }"
              rows="4"
              placeholder="Опишіть причину запиту на відпустку..."
            />
            <span v-if="errors.reason" class="field-error">{{ errors.reason }}</span>
          </div>

          <div class="form-actions">
            <button type="button" @click="handleClose" class="button button-secondary">
              Скасувати
            </button>
            <button type="submit" class="button button-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Створення...' : 'Створити запит' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.form-container {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.form-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--text);
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-button:hover {
  background: var(--bg);
}

.leave-request-form {
  padding: 24px;
}

.error-alert {
  background: var(--error-bg);
  color: var(--error-text);
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid var(--error-border);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}

.required {
  color: var(--error-text);
  margin-left: 4px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-2);
}

.input-error {
  border-color: var(--error-text);
}

.field-error {
  display: block;
  color: var(--error-text);
  font-size: 12px;
  margin-top: 4px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.button-secondary {
  background: var(--sand);
  color: var(--text);
}

.button-secondary:hover {
  background: var(--sand-light);
}

.button-primary {
  background: var(--accent-2);
  color: var(--btn-on-accent);
}

.button-primary:hover:not(:disabled) {
  background: var(--accent-2-hover);
}

.button-primary:disabled {
  background: var(--sand);
  cursor: not-allowed;
}

@media (max-width: var(--bp-md)) {
  .form-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .form-actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}
</style>
