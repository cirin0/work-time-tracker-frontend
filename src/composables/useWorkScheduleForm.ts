import { ref, computed, watch } from 'vue'
import { useForm, useFieldArray } from 'vee-validate'
import * as yup from 'yup'
import type { Ref } from 'vue'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type {
  CreateWorkScheduleRequest,
  DailyScheduleInput,
} from '@/types/requests/workScheduleRequest.interface'
import { DayOfWeek } from '@/types/enums/enums.types'

const VALIDATION_MESSAGES = {
  name: {
    required: "Назва розкладу є обов'язковою",
    max: 'Назва не може перевищувати 255 символів',
  },
  time: {
    required: 'Вкажіть час для робочого дня',
    endAfterStart: 'Час кінця має бути пізніше часу початку',
  },
} as const

const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Понеділок',
  [DayOfWeek.TUESDAY]: 'Вівторок',
  [DayOfWeek.WEDNESDAY]: 'Середа',
  [DayOfWeek.THURSDAY]: 'Четвер',
  [DayOfWeek.FRIDAY]: "П'ятниця",
  [DayOfWeek.SATURDAY]: 'Субота',
  [DayOfWeek.SUNDAY]: 'Неділя',
}

const WORKING_DAYS_DEFAULT: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
]
const ALL_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
]

const workScheduleSchema = yup.object({
  name: yup
    .string()
    .required(VALIDATION_MESSAGES.name.required)
    .max(255, VALIDATION_MESSAGES.name.max),
  is_default: yup.boolean(),
  daily_schedules: yup.array().of(
    yup.object({
      day_of_week: yup.string().required(),
      is_working_day: yup.boolean().required(),
      start_time: yup.string().when('is_working_day', {
        is: true,
        then: (s) => s.required(VALIDATION_MESSAGES.time.required),
        otherwise: (s) => s.optional(),
      }),
      end_time: yup.string().when('is_working_day', {
        is: true,
        then: (s) =>
          s
            .required(VALIDATION_MESSAGES.time.required)
            .test('end-after-start', VALIDATION_MESSAGES.time.endAfterStart, function (value) {
              const { start_time } = this.parent
              if (!start_time || !value) return true
              return value > start_time
            }),
        otherwise: (s) => s.optional(),
      }),
      break_duration: yup.number().min(0).nullable(),
    }),
  ),
})

function buildDefaultDays(): DailyScheduleInput[] {
  return ALL_DAYS.map((key) => ({
    day_of_week: key,
    start_time: '09:00',
    end_time: '18:00',
    break_duration: 60,
    is_working_day: WORKING_DAYS_DEFAULT.includes(key),
  }))
}

function buildDaysFromSchedule(schedule: WorkSchedule): DailyScheduleInput[] {
  return ALL_DAYS.map((key) => {
    const existing = schedule.daily_schedules?.find((ds) => ds.day_of_week === key)
    return {
      day_of_week: key,
      start_time: existing?.start_time?.slice(0, 5) ?? '09:00',
      end_time: existing?.end_time?.slice(0, 5) ?? '18:00',
      break_duration: existing?.break_duration ?? 60,
      is_working_day: existing?.is_working_day ?? false,
    }
  })
}

export interface UseWorkScheduleFormOptions {
  schedule: Ref<WorkSchedule | null | undefined>
  onSubmit: (payload: CreateWorkScheduleRequest) => void
}

export function useWorkScheduleForm({ schedule, onSubmit }: UseWorkScheduleFormOptions) {
  const generalError = ref<string>('')

  const { handleSubmit, resetForm, errors, values } = useForm<{
    name: string
    is_default: boolean
    daily_schedules: DailyScheduleInput[]
  }>({
    validationSchema: workScheduleSchema,
    initialValues: {
      name: '',
      is_default: false,
      daily_schedules: buildDefaultDays(),
    },
  })

  const { fields: dayFields } = useFieldArray<DailyScheduleInput>('daily_schedules')

  // Re-initialize form when schedule prop changes (edit vs create)
  watch(
    schedule,
    (s) => {
      resetForm({
        values: {
          name: s?.name ?? '',
          is_default: s?.is_default ?? false,
          daily_schedules: s ? buildDaysFromSchedule(s) : buildDefaultDays(),
        },
      })
      generalError.value = ''
    },
    { immediate: true },
  )

  // First error from daily_schedules for a given day index
  function getDayError(index: number): string {
    const keys: Array<keyof DailyScheduleInput> = ['start_time', 'end_time', 'break_duration']
    for (const key of keys) {
      const msg = (errors.value as Record<string, string>)[`daily_schedules[${index}].${key}`]
      if (msg) return msg
    }
    return ''
  }

  // Label for a day key
  function getDayLabel(key: DayOfWeek): string {
    return DAY_LABELS[key] ?? key
  }

  const submit = handleSubmit(
    (formValues) => {
      generalError.value = ''
      onSubmit({
        name: formValues.name.trim(),
        is_default: formValues.is_default,
        daily_schedules: formValues.daily_schedules,
      })
    },
    ({ errors: validationErrors }) => {
      const allMessages = Object.values(validationErrors).filter(Boolean)
      generalError.value = allMessages[0] ?? 'Перевірте правильність заповнення форми'
    },
  )

  function clearErrors() {
    generalError.value = ''
  }

  // Computed: which days have time-order errors (for per-day visual feedback)
  const dayFieldsWithErrors = computed(() =>
    dayFields.value.map((field, index) => ({
      field,
      error: getDayError(index),
      label: getDayLabel(field.value.day_of_week),
    })),
  )

  return {
    // form values (reactive — bind directly with v-model on values.name etc.)
    values,
    errors,
    dayFields,
    dayFieldsWithErrors,
    // error state
    generalError,
    // methods
    submit,
    clearErrors,
    getDayLabel,
  }
}
