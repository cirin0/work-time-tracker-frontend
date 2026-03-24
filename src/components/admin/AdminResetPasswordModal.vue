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
  submit: [data: { password: string; password_confirmation: string }]
}>()

const password = ref('')
const passwordConfirmation = ref('')
const errors = ref<{ password?: string; password_confirmation?: string }>({})
const generalError = ref('')
const isOpen = ref(false)

watch(
  () => props.showModal,
  (open) => {
    isOpen.value = open
    if (open) {
      password.value = ''
      passwordConfirmation.value = ''
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
  if (!password.value) {
    errors.value.password = `Пароль є обов'язковим`
  } else if (password.value.length < 8) {
    errors.value.password = `Пароль має містити щонайменше 8 символів`
  }
  if (!passwordConfirmation.value) {
    errors.value.password_confirmation = `Підтвердження паролю є обов'язковим`
  } else if (password.value !== passwordConfirmation.value) {
    errors.value.password_confirmation = 'Паролі не співпадають'
  }
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', {
    password: password.value,
    password_confirmation: passwordConfirmation.value,
  })
}

function handleClose() {
  emit('close')
}

defineExpose({
  setError: (msg: string) => {
    generalError.value = msg
  },
})
</script>

<template>
  <Modal v-model="isOpen" title="Скинути пароль" max-width="460px">
    <div v-if="generalError" class="error-alert">{{ generalError }}</div>

    <form class="modal-form" @submit.prevent="handleSubmit">
      <p class="user-name">
        Користувач: <strong>{{ user?.name }}</strong>
      </p>

      <InputField
        v-model="password"
        name="password"
        label="Новий пароль"
        type="password"
        placeholder="Мінімум 8 символів"
        icon="lock"
        :error="errors.password"
        required
      />

      <InputField
        v-model="passwordConfirmation"
        name="password_confirmation"
        label="Підтвердження паролю"
        type="password"
        placeholder="Повторіть пароль"
        icon="lock"
        :error="errors.password_confirmation"
        required
      />
    </form>

    <template #footer>
      <ButtonMain variant="secondary" @click="handleClose">Скасувати</ButtonMain>
      <ButtonMain variant="primary" type="submit" :disabled="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? 'Скидання...' : 'Скинути пароль' }}
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

.user-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text);
  margin: 0;
}
</style>
