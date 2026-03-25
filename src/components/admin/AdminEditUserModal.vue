<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/types/interfaces/user.interface'
import Modal from '@/components/ui/Modal.vue'
import InputField from '@/components/ui/InputField.vue'
import ButtonMain from '@/components/ui/ButtonMain.vue'

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
const isOpen = ref(false)

watch(
  () => props.showModal,
  (open) => {
    isOpen.value = open
    if (open && props.user) {
      name.value = props.user.name
      email.value = props.user.email
      errors.value = {}
      generalError.value = ''
    }
  },
)

watch(isOpen, (open) => {
  if (!open && props.showModal) {
    emit('close')
  }
})

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
  <Modal v-model="isOpen" title="Редагувати користувача" max-width="480px">
    <div v-if="generalError" class="error-alert">{{ generalError }}</div>

    <form class="modal-form" @submit.prevent="handleSubmit">
      <InputField
        v-model="name"
        name="name"
        label="Ім'я"
        type="text"
        placeholder="Введіть ім'я"
        icon="user"
        :error="errors.name"
        required
      />

      <InputField
        v-model="email"
        name="email"
        label="Email"
        type="email"
        placeholder="Введіть email"
        icon="email"
        :error="errors.email"
        required
      />
    </form>

    <template #footer>
      <ButtonMain variant="secondary" @click="handleClose">Скасувати</ButtonMain>
      <ButtonMain variant="primary" type="submit" :disabled="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? 'Збереження...' : 'Зберегти' }}
      </ButtonMain>
    </template>
  </Modal>
</template>

<style scoped>
.error-alert {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
