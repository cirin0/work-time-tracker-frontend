import type { DailySchedule } from '../interfaces/dailySchedule.interface'
import type { User } from '../interfaces/user.interface'

export interface WorkScheduleApiResponse {
  id: number
  name: string
  is_default: boolean
  daily_schedules?: DailySchedule[]
}

export interface WorkScheduleWithUserResponse {
  message: string
  user: User
  work_schedule: WorkScheduleApiResponse
}
