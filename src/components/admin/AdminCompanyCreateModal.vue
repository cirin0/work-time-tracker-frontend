<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CreateCompanyRequest } from '@/types/requests/companyRequest.interface'

const props = defineProps<{
  show: boolean
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: CreateCompanyRequest): void
}>()

const form = ref<CreateCompanyRequest>({
  name: '',
  email: '',
  phone: '',
  address: '',
  description: '',
  latitude: null,
  longitude: null,
  radius_meters: null,
})

const error = ref<string | null>(null)

watch(
  () => props.show,
  (v) => {
    if (v) {
      // Reset form when modal opens
      form.value = {
        name: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        latitude: null,
        longitude: null,
        radius_meters: null,
      }
      error.value = null
    }
  },
)

function setError(msg: string) {
  error.value = msg
}

function onSubmit() {
  if (!form.value.name?.trim()) {
    error.value = "Назва компанії обов'язкова"
    return
  }
  error.value = null
  emit('submit', { ...form.value })
}

defineExpose({ setError })
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>Створення компанії</h3>
          <button class="btn-close" @click="emit('close')">✕</button>
        </div>

        <form class="modal-body" @submit.prevent="onSubmit">
          <div v-if="error" class="error-banner">{{ error }}</div>

          <div class="field">
            <label>Назва *</label>
            <input v-model="form.name" type="text" placeholder="Назва компанії" />
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="company@example.com" />
          </div>

          <div class="field">
            <label>Телефон</label>
            <input v-model="form.phone" type="text" placeholder="+380..." />
          </div>

          <div class="field">
            <label>Адреса</label>
            <input v-model="form.address" type="text" placeholder="вул. ..." />
          </div>

          <div class="field">
            <label>Опис</label>
            <textarea v-model="form.description" rows="3" placeholder="Опис компанії..." />
          </div>

          <div class="row">
            <div class="field">
              <label>Широта</label>
              <input
                v-model.number="form.latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                placeholder="48.45"
              />
            </div>
            <div class="field">
              <label>Довгота</label>
              <input
                v-model.number="form.longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                placeholder="34.98"
              />
            </div>
          </div>

          <div class="field">
            <label>Радіус офісу (м)</label>
            <input v-model.number="form.radius_meters" type="number" min="1" placeholder="100" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="emit('close')">Скасувати</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Створення...' : 'Створити' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field input,
.field textarea {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.9rem;
  color: #111827;
  outline: none;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.15s;
}

.field input:focus,
.field textarea:focus {
  border-color: #2563eb;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-submit {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
