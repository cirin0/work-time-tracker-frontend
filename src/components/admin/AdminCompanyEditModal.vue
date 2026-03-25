<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Company } from '@/types/interfaces/company.interface'
import type { UpdateCompanyRequest } from '@/types/requests/companyRequest.interface'
import Modal from '@/components/ui/Modal.vue'
import InputField from '@/components/ui/InputField.vue'
import ButtonMain from '@/components/ui/ButtonMain.vue'

const props = defineProps<{
  show: boolean
  company: Company | null
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: UpdateCompanyRequest): void
}>()

interface FormState {
  name: string
  email: string
  phone: string
  address: string
  description: string
  latitude: string
  longitude: string
  radius_meters: string
}

const form = ref<FormState>({
  name: '',
  email: '',
  phone: '',
  address: '',
  description: '',
  latitude: '',
  longitude: '',
  radius_meters: '',
})

const error = ref<string | null>(null)
const isOpen = ref(false)

watch(
  () => props.company,
  (c) => {
    if (!c) return
    form.value = {
      name: c.name,
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
      description: c.description ?? '',
      latitude: c.latitude != null ? String(c.latitude) : '',
      longitude: c.longitude != null ? String(c.longitude) : '',
      radius_meters: c.radius_meters != null ? String(c.radius_meters) : '',
    }
  },
  { immediate: true },
)

watch(
  () => props.show,
  (v) => {
    isOpen.value = v
    if (!v) error.value = null
  },
)

watch(isOpen, (open) => {
  if (!open && props.show) {
    emit('close')
  }
})

function setError(msg: string) {
  error.value = msg
}

function onSubmit() {
  if (!form.value.name?.trim()) {
    error.value = "Назва компанії обов'язкова"
    return
  }
  error.value = null

  const payload: UpdateCompanyRequest = {
    name: form.value.name,
    email: form.value.email || null,
    phone: form.value.phone || null,
    address: form.value.address || null,
    description: form.value.description || null,
    latitude: form.value.latitude ? Number(form.value.latitude) : null,
    longitude: form.value.longitude ? Number(form.value.longitude) : null,
    radius_meters: form.value.radius_meters ? Number(form.value.radius_meters) : null,
  }

  emit('submit', payload)
}

defineExpose({ setError })
</script>

<template>
  <Modal v-model="isOpen" title="Редагування компанії" max-width="520px">
    <div v-if="error" class="error-banner">{{ error }}</div>

    <form class="modal-form" @submit.prevent="onSubmit">
      <InputField
        v-model="form.name"
        name="name"
        label="Назва"
        type="text"
        placeholder="Назва компанії"
        icon="company"
        required
      />

      <InputField
        v-model="form.email"
        name="email"
        label="Email"
        type="email"
        placeholder="company@example.com"
        icon="email"
      />

      <InputField
        v-model="form.phone"
        name="phone"
        label="Телефон"
        type="text"
        placeholder="+380..."
        icon="phone"
      />

      <InputField
        v-model="form.address"
        name="address"
        label="Адреса"
        type="text"
        placeholder="вул. ..."
        icon="map"
      />

      <div class="field">
        <label class="form-label">Опис</label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Опис компанії..."
          class="form-textarea"
        />
      </div>

      <div class="row">
        <InputField
          v-model="form.latitude"
          name="latitude"
          label="Широта"
          type="number"
          step="any"
          min="-90"
          max="90"
          placeholder="48.45"
          icon="compass"
        />
        <InputField
          v-model="form.longitude"
          name="longitude"
          label="Довгота"
          type="number"
          step="any"
          min="-180"
          max="180"
          placeholder="34.98"
          icon="compass"
        />
      </div>

      <InputField
        v-model="form.radius_meters"
        name="radius_meters"
        label="Радіус офісу (м)"
        type="number"
        min="1"
        placeholder="100"
        icon="ruler"
      />
    </form>

    <template #footer>
      <ButtonMain variant="secondary" @click="emit('close')">Скасувати</ButtonMain>
      <ButtonMain variant="primary" type="submit" :disabled="isSubmitting" @click="onSubmit">
        {{ isSubmitting ? 'Збереження...' : 'Зберегти' }}
      </ButtonMain>
    </template>
  </Modal>
</template>

<style scoped>
.error-banner {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.form-textarea {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text);
  background: var(--surface);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
}

.form-textarea:focus {
  border-color: var(--accent-2);
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
