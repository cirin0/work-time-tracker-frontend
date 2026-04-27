<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import InputField from '@/components/ui/InputField.vue'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const emit = defineEmits<{
  codeSent: [email: string]
  backToAuth: []
}>()

const authStore = useAuthStore()

const generalError = ref<string>('')
const successMessage = ref<string>('')
const isSubmitting = ref(false)

const schema = yup.object({
  email: yup
    .string()
    .required("Електронна пошта є обов'язковою")
    .email('Введіть коректну електронну пошту'),
})

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
  },
})

const onSubmit = handleSubmit(async (values) => {
  generalError.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await authStore.forgotPassword(values.email)
    successMessage.value = response.message

    setTimeout(() => {
      emit('codeSent', values.email)
    }, 1500)
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const response = error.response

      if (response?.status === 422) {
        generalError.value = 'Користувача з такою поштою не знайдено'
      } else if (response?.status === 400) {
        generalError.value = response.data?.message || 'Зачекайте перед повторним запитом'
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
</script>

<template>
  <div>
    <div v-if="successMessage" class="success-alert">
      {{ successMessage }}
    </div>
    <div v-if="generalError" class="error-alert">
      {{ generalError }}
    </div>

    <p class="hint-text">
      Введіть вашу електронну пошту, і ми надішлемо вам код для скидання пароля.
    </p>

    <form @submit="onSubmit">
      <InputField
        name="email"
        label="Електронна пошта"
        type="email"
        icon="email"
        placeholder="Введіть електронну пошту"
      />

      <button class="submit-button" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Надсилаємо...' : 'Надіслати код' }}
      </button>

      <button class="link-button" type="button" @click="emit('backToAuth')">
        Повернутися до входу
      </button>
    </form>
  </div>
</template>

<style scoped>
.hint-text {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.4;
  text-align: center;
}

.success-alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: var(--success-bg);
  border: 1px solid var(--success-border);
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

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

@media (max-width: var(--bp-sm)) {
  .submit-button,
  .link-button {
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }
}
</style>
