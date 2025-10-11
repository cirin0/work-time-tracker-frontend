import type { DayOfWeek } from '../enums/enums.types'

export interface CreateDailyScheduleRequest {
  work_schedule_id: number
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  break_duration?: number
  is_working_day?: boolean
}

export interface UpdateDailyScheduleRequest {
  day_of_week?: DayOfWeek
  start_time?: string
  end_time?: string
  break_duration?: number
  is_working_day?: boolean
}
