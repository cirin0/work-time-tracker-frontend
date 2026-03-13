import type { DayOfWeek } from '../enums/enums.types'

export interface DailySchedule {
  id: number
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  break_duration: number
  is_working_day: boolean
}
