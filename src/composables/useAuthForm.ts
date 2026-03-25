import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const VALIDATION_MESSAGES = {
  email: {
    required: "Електронна пошта є обов'язковою",
    invalid: 'Введіть коректну електронну пошту',
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
  validationFailed: 'Перевірте коректність введених даних.',
  emailAlreadyTaken:
    'Ця електронна пошта вже зареєстрована. Спробуйте увійти або використайте іншу пошту.',
  emailNotVerified: 'Спочатку підтвердьте електронну пошту.',
  serverError: 'Сталася помилка. Спробуйте ще раз.',
  unknownError: 'Сталася невідома помилка',
  registrationSuccess: 'Реєстрація успішна. Перевірте пошту та введіть код підтвердження.',
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
  const registeredEmail = ref<string>('')
  const unverifiedEmail = ref<string>('')

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
    () => authStore.isAuthenticated,
    () => {
      if (authStore.isAuthenticated) {
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

    if (response?.status === 403 && response.data?.email_not_verified) {
      unverifiedEmail.value = response.data.email
      return
    }

    if (response?.status === 401) {
      generalError.value = ERROR_MESSAGES.invalidCredentials
      return
    }

    if (response?.status === 422) {
      const errors = response.data?.errors

      if (errors) {
        setValidationErrors(errors)
      }

      if (!Object.keys(errors || {}).length) {
        generalError.value = ERROR_MESSAGES.validationFailed
      }
      return
    }

    generalError.value = ERROR_MESSAGES.serverError
  }

  function setValidationErrors(errors: Record<string, string[]>) {
    const validFields: FormField[] = ['name', 'email', 'password']
    const fieldMessages: Record<FormField, string> = {
      name: 'Перевірте правильність імені.',
      email: 'Перевірте правильність електронної пошти.',
      password: 'Перевірте правильність пароля.',
    }

    const emailErrors = errors.email || []
    const hasEmailTakenError = emailErrors.some((message) =>
      message.toLowerCase().includes('already been taken'),
    )

    if (hasEmailTakenError) {
      generalError.value = ERROR_MESSAGES.emailAlreadyTaken
      serverErrors.value.email = ERROR_MESSAGES.emailAlreadyTaken
      return
    }

    Object.keys(errors).forEach((field) => {
      const typedField = field as FormField
      if (!validFields.includes(typedField)) return

      const translatedMessage = fieldMessages[typedField]

      setFieldError(typedField, translatedMessage)
      serverErrors.value[field] = translatedMessage
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
      registeredEmail.value = email

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
    registeredEmail,
    unverifiedEmail,
    onSubmit,
    resetFormState,
    clearErrors,
  }
}
