import type { DayOfWeek } from '../enums/enums.types'
import type { BaseModel } from './base.model'
import type { WorkSchedule } from './workSchedule.interface'

export interface DailySchedule extends BaseModel {
  work_schedule_id: number
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  break_duration: number
  is_working_day: boolean

  // relationships

  work_schedule?: WorkSchedule
}
