<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import InputField from '@/components/ui/InputField.vue'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const props = defineProps<{
  email: string
}>()

const emit = defineEmits<{
  resetSuccess: []
  backToAuth: []
}>()

const authStore = useAuthStore()

const generalError = ref<string>('')
const successMessage = ref<string>('')
const isSubmitting = ref(false)
const isResending = ref(false)

const schema = yup.object({
  email: yup
    .string()
    .required("Електронна пошта є обов'язковою")
    .email('Введіть коректну електронну пошту'),
  code: yup
    .string()
    .required("Код підтвердження є обов'язковим")
    .length(6, 'Код має містити 6 символів'),
  password: yup
    .string()
    .required("Пароль є обов'язковим")
    .min(8, 'Пароль має містити мінімум 8 символів'),
  password_confirmation: yup
    .string()
    .required("Підтвердження пароля є обов'язковим")
    .oneOf([yup.ref('password')], 'Паролі не співпадають'),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    email: props.email,
    code: '',
    password: '',
    password_confirmation: '',
  },
})

const onSubmit = handleSubmit(async (values) => {
  generalError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await authStore.resetPassword(values.email, values.code, values.password)
    successMessage.value = response.message

    setTimeout(() => {
      emit('resetSuccess')
    }, 1500)
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const response = error.response

      if (response?.status === 400) {
        generalError.value = response.data?.message || 'Невірний код або код прострочений'
      } else if (response?.status === 422) {
        const errors = response.data?.errors
        if (errors?.password) {
          generalError.value = 'Пароль має містити мінімум 8 символів'
        } else {
          generalError.value = 'Перевірте коректність введених даних'
        }
      } else {
        generalError.value = 'Сталася помилка. Спробуйте ще раз.'
      }
    } else {
      generalError.value = 'Сталася невідома помилка'
    }
  } finally {
    isSubmitting.value = false
  }
})

const resendCode = async () => {
  generalError.value = ''
  successMessage.value = ''
  isResending.value = true

  try {
    const response = await authStore.forgotPassword(props.email)
    successMessage.value = response.message
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const response = error.response

      if (response?.status === 400) {
        generalError.value = response.data?.message || 'Зачекайте перед повторним запитом'
      } else {
        generalError.value = 'Не вдалося надіслати код. Спробуйте ще раз.'
      }
    } else {
      generalError.value = 'Сталася невідома помилка'
    }
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="successMessage" class="success-alert">
      {{ successMessage }}
    </div>
    <div v-if="generalError" class="error-alert">
      {{ generalError }}
    </div>

    <p class="hint-text">Введіть код із листа та новий пароль для вашого акаунту.</p>

    <form @submit="onSubmit">
      <InputField
        name="email"
        label="Електронна пошта"
        type="email"
        icon="email"
        placeholder="Введіть електронну пошту"
      />
      <InputField
        name="code"
        label="Код підтвердження"
        type="text"
        icon="lock"
        placeholder="Введіть 6-значний код"
      />
      <InputField
        name="password"
        label="Новий пароль"
        type="password"
        icon="lock"
        placeholder="Введіть новий пароль"
      />
      <InputField
        name="password_confirmation"
        label="Підтвердження пароля"
        type="password"
        icon="lock"
        placeholder="Повторіть новий пароль"
      />

      <button class="submit-button" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Скидаємо пароль...' : 'Скинути пароль' }}
      </button>

      <button class="secondary-button" type="button" :disabled="isResending" @click="resendCode">
        {{ isResending ? 'Надсилаємо...' : 'Надіслати код повторно' }}
      </button>

      <button class="link-button" type="button" @click="emit('backToAuth')">
        Повернутися до входу
      </button>
    </form>
  </div>
</template>

<style scoped>
.hint-text {
  margin: 0 0 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.4;
  text-align: center;
}

.success-alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 0.5rem;
  color: var(--pin-ok-color);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
}

.error-alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
  color: var(--error-text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
}

.submit-button,
.secondary-button,
.link-button {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button {
  margin-top: 0.25rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
}

.submit-button:hover:not(:disabled) {
  background: var(--accent-2-hover);
}

.secondary-button {
  margin-top: 0.75rem;
  background: var(--sand-light);
  color: var(--text);
  border: 1px solid var(--border);
}

.secondary-button:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.link-button {
  margin-top: 0.75rem;
  background: transparent;
  color: var(--accent-2);
  border: none;
  text-decoration: underline;
}

.link-button:hover {
  color: var(--accent-2-hover);
}

.submit-button:disabled,
.secondary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: var(--bp-sm)) {
  .submit-button,
  .secondary-button,
  .link-button {
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }
}
</style>
