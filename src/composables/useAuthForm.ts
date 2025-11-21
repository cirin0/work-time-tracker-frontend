import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const VALIDATION_MESSAGES = {
  email: {
    required: "Email є обов'язковим",
    invalid: 'Введіть валідний email',
  },
  password: {
    required: "Пароль є обов'язковим",
    minLength: 'Пароль має містити мінімум 6 символів',
  },
  name: {
    required: "Ім'я є обов'язковим",
    minLength: "Ім'я має містити мінімум 3 символи",
  },
} as const

const ERROR_MESSAGES = {
  invalidCredentials: 'Невірні дані для входу',
  serverError: 'Сталася помилка. Спробуйте ще раз.',
  unknownError: 'Сталася невідома помилка',
  registrationSuccess: 'Реєстрація успішна! Тепер ви можете увійти.',
} as const

const loginSchema = yup.object({
  email: yup
    .string()
    .required(VALIDATION_MESSAGES.email.required)
    .email(VALIDATION_MESSAGES.email.invalid),
  password: yup
    .string()
    .required(VALIDATION_MESSAGES.password.required)
    .min(6, VALIDATION_MESSAGES.password.minLength),
})

const registerSchema = yup.object({
  name: yup
    .string()
    .required(VALIDATION_MESSAGES.name.required)
    .min(3, VALIDATION_MESSAGES.name.minLength),
  email: yup
    .string()
    .required(VALIDATION_MESSAGES.email.required)
    .email(VALIDATION_MESSAGES.email.invalid),
  password: yup
    .string()
    .required(VALIDATION_MESSAGES.password.required)
    .min(6, VALIDATION_MESSAGES.password.minLength),
})

type FormField = 'name' | 'email' | 'password'

export function useAuthForm(isLogin: () => boolean) {
  const authStore = useAuthStore()
  const router = useRouter()

  const serverErrors = ref<Record<string, string>>({})
  const generalError = ref<string>('')
  const successMessage = ref<string>('')

  const savedName = ref<string>('')
  const savedEmail = ref<string>('')

  const validationSchema = computed(() => (isLogin() ? loginSchema : registerSchema))

  const { handleSubmit, resetForm, setFieldError, values } = useForm({
    validationSchema,
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  watch(
    () => authStore.getToken,
    () => {
      if (authStore.getToken) {
        router.push({ name: 'main' })
      }
    },
  )

  function handleServerError(error: unknown) {
    if (!axios.isAxiosError(error)) {
      generalError.value = ERROR_MESSAGES.unknownError
      return
    }

    const response = error.response

    if (response?.status === 401) {
      generalError.value = response.data?.error || ERROR_MESSAGES.invalidCredentials
      return
    }

    if (response?.status === 422) {
      const errors = response.data?.errors

      if (errors) {
        setValidationErrors(errors)
      }

      if (response.data?.message && !Object.keys(errors || {}).length) {
        generalError.value = response.data.message
      }
      return
    }

    generalError.value = ERROR_MESSAGES.serverError
  }

  function setValidationErrors(errors: Record<string, string[]>) {
    const validFields: FormField[] = ['name', 'email', 'password']

    Object.keys(errors).forEach((field) => {
      const errorMessages = errors[field]
      if (!errorMessages || errorMessages.length === 0) return

      const errorMessage = errorMessages[0]
      if (!errorMessage) return

      if (validFields.includes(field as FormField)) {
        setFieldError(field as FormField, errorMessage)
      }

      serverErrors.value[field] = errorMessage
    })
  }

  function clearErrors() {
    serverErrors.value = {}
    generalError.value = ''
    successMessage.value = ''
  }

  function clearErrorsOnly() {
    serverErrors.value = {}
    generalError.value = ''
  }

  function saveCurrentValues() {
    if (values.name) savedName.value = values.name
    if (values.email) savedEmail.value = values.email
  }

  async function login(email: string, password: string) {
    clearErrors()
    try {
      await authStore.login(email, password)
      router.push({ name: 'main' })
    } catch (error: unknown) {
      handleServerError(error)
      throw error
    }
  }

  async function register(name: string, email: string, password: string) {
    clearErrors()
    try {
      await authStore.register(name, email, password)
      successMessage.value = ERROR_MESSAGES.registrationSuccess

      savedName.value = name
      savedEmail.value = email

      resetForm({
        values: {
          name: '',
          email,
          password: '',
        },
      })
    } catch (error: unknown) {
      handleServerError(error)
      throw error
    }
  }

  function handleValidationErrors(errors: Record<string, string | undefined>) {
    const errorFields = Object.keys(errors) as FormField[]

    if (errorFields.length > 0) {
      const firstField = errorFields[0]
      const firstError = firstField ? errors[firstField] : undefined

      if (firstError) {
        generalError.value = firstError
      }
    }
  }

  const onSubmit = handleSubmit(
    async (values) => {
      clearErrorsOnly()

      try {
        if (isLogin()) {
          await login(values.email, values.password)
        } else {
          await register(values.name || '', values.email, values.password)
        }
      } catch {}
    },
    ({ errors }) => handleValidationErrors(errors),
  )

  function resetFormState() {
    clearErrorsOnly()
    saveCurrentValues()

    resetForm({
      values: {
        name: savedName.value,
        email: savedEmail.value,
        password: '',
      },
    })
  }

  return {
    serverErrors,
    generalError,
    successMessage,
    onSubmit,
    resetFormState,
    clearErrors,
  }
}
