<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  showModal: boolean
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  close: []
  submit: [comments: string]
}>()

const comments = ref('')
const error = ref('')
const generalError = ref('')

watch(
  () => props.showModal,
  (newVal) => {
    if (newVal) {
      comments.value = ''
      error.value = ''
      generalError.value = ''
    }
  },
)

function validateForm(): boolean {
  error.value = ''
  generalError.value = ''

  if (!comments.value.trim()) {
    error.value = "Коментар є обов'язковим"
    return false
  }

  if (comments.value.trim().length < 10) {
    error.value = 'Коментар має містити принаймні 10 символів'
    return false
  }

  return true
}

function handleSubmit() {
  if (!validateForm()) {
    return
  }

  emit('submit', comments.value.trim())
}

function handleClose() {
  comments.value = ''
  error.value = ''
  generalError.value = ''
  emit('close')
}

defineExpose({
  setError: (err: string) => {
    generalError.value = err
  },
})
</script>

<template>
  <div v-if="showModal" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Відхилити запит на відпустку</h2>
        <button @click="handleClose" class="close-button">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div v-if="generalError" class="error-alert">
          {{ generalError }}
        </div>

        <div class="form-group">
          <label for="manager_comments" class="form-label">
            Коментар<span class="required">*</span>
          </label>
          <textarea
            id="manager_comments"
            v-model="comments"
            class="form-textarea"
            :class="{ 'input-error': error }"
            rows="4"
            placeholder="Вкажіть причину відхилення запиту..."
            required
          />
          <span v-if="error" class="field-error">{{ error }}</span>
        </div>

        <div class="form-actions">
          <button type="button" @click="handleClose" class="btn-secondary">Скасувати</button>
          <button type="submit" class="btn-danger" :disabled="isSubmitting">
            {{ isSubmitting ? 'Відхилення...' : 'Відхилити запит' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
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

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1f2937;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
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
  background: #f0f0f0;
}

.modal-form {
  padding: 24px;
}

.error-alert {
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #fecaca;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #dc3545;
  margin-left: 4px;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: #9333ea;
}

.input-error {
  border-color: #dc3545;
}

.field-error {
  display: block;
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-danger {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  background: #fca5a5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-danger {
    width: 100%;
  }
}
</style>
