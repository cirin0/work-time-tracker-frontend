import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const VALIDATION_MESSAGES = {
  email: {
    required: "Електронна пошта є обов'язковою",
    invalid: 'Введіть коректну електронну пошту',
  },
  code: {
    required: "Код підтвердження є обов'язковим",
    invalid: 'Код підтвердження має містити 6 цифр',
  },
} as const

const ERROR_MESSAGES = {
  verificationFailed: 'Не вдалося підтвердити електронну пошту. Перевірте код і спробуйте ще раз.',
  resendFailed: 'Не вдалося надіслати код повторно. Спробуйте ще раз.',
  validationFailed: 'Перевірте коректність введених даних.',
  serverError: 'Сталася помилка. Спробуйте ще раз.',
  unknownError: 'Сталася невідома помилка',
} as const

const verificationSchema = yup.object({
  email: yup
    .string()
    .required(VALIDATION_MESSAGES.email.required)
    .email(VALIDATION_MESSAGES.email.invalid),
  code: yup
    .string()
    .required(VALIDATION_MESSAGES.code.required)
    .matches(/^\d{6}$/, VALIDATION_MESSAGES.code.invalid),
})

type FormField = 'email' | 'code'

export function useEmailVerificationForm(initialEmail: () => string) {
  const authStore = useAuthStore()

  const generalError = ref('')
  const successMessage = ref('')
  const isVerifying = ref(false)
  const isResending = ref(false)

  const { handleSubmit, setFieldError, setFieldValue, values } = useForm({
    validationSchema: verificationSchema,
    initialValues: {
      email: initialEmail() || '',
      code: '',
    },
  })

  watch(
    initialEmail,
    (newEmail) => {
      if (newEmail && values.email !== newEmail) {
        setFieldValue('email', newEmail)
      }
    },
    { immediate: true },
  )

  function clearMessages() {
    generalError.value = ''
    successMessage.value = ''
  }

  function setValidationErrors(errors: Record<string, string[]>) {
    const validFields: FormField[] = ['email', 'code']
    const fieldMessages: Record<FormField, string> = {
      email: 'Перевірте правильність електронної пошти.',
      code: 'Перевірте правильність коду підтвердження.',
    }

    Object.keys(errors).forEach((field) => {
      const typedField = field as FormField
      if (!validFields.includes(typedField)) return

      setFieldError(typedField, fieldMessages[typedField])
    })

    generalError.value = ERROR_MESSAGES.validationFailed
  }

  function handleAxiosError(error: unknown, fallbackMessage: string) {
    if (!axios.isAxiosError(error)) {
      generalError.value = ERROR_MESSAGES.unknownError
      return
    }

    const response = error.response

    if (response?.status === 422 && response.data?.errors) {
      setValidationErrors(response.data.errors)
      return
    }

    if (response?.status === 400) {
      generalError.value = fallbackMessage
      return
    }

    generalError.value = ERROR_MESSAGES.serverError
  }

  const onVerifySubmit = handleSubmit(async (formValues) => {
    clearMessages()
    isVerifying.value = true

    try {
      await authStore.verifyEmail(formValues.email, formValues.code)
      successMessage.value = 'Електронну пошту успішно підтверджено. Тепер ви можете увійти.'
    } catch (error: unknown) {
      handleAxiosError(error, ERROR_MESSAGES.verificationFailed)
    } finally {
      isVerifying.value = false
    }
  })

  async function resendCode() {
    clearMessages()
    isResending.value = true

    try {
      await verificationSchema.validateAt('email', values)
      await authStore.resendVerificationCode(values.email)
      successMessage.value = 'Новий код підтвердження надіслано на вашу електронну пошту.'
    } catch (error: unknown) {
      if (error instanceof yup.ValidationError) {
        setFieldError('email', error.message)
        generalError.value = ERROR_MESSAGES.validationFailed
        return
      }

      handleAxiosError(error, ERROR_MESSAGES.resendFailed)
    } finally {
      isResending.value = false
    }
  }

  return {
    values,
    generalError,
    successMessage,
    isVerifying,
    isResending,
    onVerifySubmit,
    resendCode,
  }
}
