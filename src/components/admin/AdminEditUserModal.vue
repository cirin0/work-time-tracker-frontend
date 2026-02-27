<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/types/interfaces/user.interface'

interface Props {
  showModal: boolean
  user: User | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: { name: string; email: string }]
}>()

const name = ref('')
const email = ref('')
const errors = ref<{ name?: string; email?: string }>({})
const generalError = ref('')

watch(
  () => props.showModal,
  (open) => {
    if (open && props.user) {
      name.value = props.user.name
      email.value = props.user.email
      errors.value = {}
      generalError.value = ''
    }
  },
)

function validate(): boolean {
  errors.value = {}
  if (!name.value.trim()) errors.value.name = "Ім'я є обов'язковим"
  if (!email.value.trim()) {
    errors.value.email = `Email є обов'язковим`
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = `Невірний формат email`
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', { name: name.value.trim(), email: email.value.trim() })
}

function handleClose() {
  emit('close')
}

defineExpose({
  setError: (msg: string) => {
    generalError.value = msg
  },
  setFieldErrors: (errs: { name?: string; email?: string }) => {
    errors.value = errs
  },
})
</script>

<template>
  <div v-if="showModal" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Редагувати користувача</h2>
        <button class="close-button" @click="handleClose">&times;</button>
      </div>

      <form class="modal-form" @submit.prevent="handleSubmit">
        <div v-if="generalError" class="error-alert">{{ generalError }}</div>

        <div class="form-group">
          <label class="form-label">Ім'я <span class="required">*</span></label>
          <input
            v-model="name"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.name }"
            placeholder="Введіть ім'я"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Email <span class="required">*</span></label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            placeholder="Введіть email"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="handleClose">Скасувати</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Збереження...' : 'Зберегти' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-alert {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.form-input {
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #2563eb;
}

.input-error {
  border-color: #ef4444;
}

.field-error {
  font-size: 0.75rem;
  color: #ef4444;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.5rem 1.25rem;
  border: 1.5px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
