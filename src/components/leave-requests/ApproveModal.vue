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
const generalError = ref('')

watch(
  () => props.showModal,
  (newVal) => {
    if (newVal) {
      comments.value = ''
      generalError.value = ''
    }
  },
)

function handleSubmit() {
  emit('submit', comments.value.trim())
}

function handleClose() {
  comments.value = ''
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
        <h2>Схвалити запит на відпустку</h2>
        <button @click="handleClose" class="close-button">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div v-if="generalError" class="error-alert">
          {{ generalError }}
        </div>

        <div class="form-group">
          <label for="manager_comments" class="form-label">
            Коментар <span class="optional">(опціонально)</span>
          </label>
          <textarea
            id="manager_comments"
            v-model="comments"
            class="form-textarea"
            rows="4"
            placeholder="Додайте коментар, якщо потрібно..."
          />
        </div>

        <div class="form-actions">
          <button type="button" @click="handleClose" class="btn-secondary">Скасувати</button>
          <button type="submit" class="btn-success" :disabled="isSubmitting">
            {{ isSubmitting ? 'Схвалення...' : 'Схвалити запит' }}
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border-top: 4px solid var(--accent-2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text);
  font-weight: 600;
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

.modal-form {
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
  font-size: 0.875rem;
}

.optional {
  color: var(--text-muted);
  font-weight: 400;
  font-style: italic;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  transition: border-color 0.2s;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--accent-2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.btn-secondary,
.btn-success {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--sand);
  color: var(--text);
}

.btn-secondary:hover {
  background: var(--sand-light);
}

.btn-success {
  background: var(--accent-2);
  color: var(--btn-on-accent);
}

.btn-success:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--sand);
}

@media (max-width: var(--bp-md)) {
  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-success {
    width: 100%;
  }
}
</style>
