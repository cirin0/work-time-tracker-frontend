import type { DailySchedule } from '../interfaces/dailySchedule.interface'
import type { UserApiResponse } from './user.api'

export interface WorkScheduleApiResponse {
  id: number
  name: string
  is_default: boolean
  daily_schedules?: DailySchedule[]
}

export interface WorkScheduleWithUserResponse {
  message: string
  user: UserApiResponse
  work_schedule: WorkScheduleApiResponse
}

export function transformWorkScheduleFromApi(apiSchedule: WorkScheduleApiResponse) {
  const now = new Date()
  return {
    id: apiSchedule.id,
    name: apiSchedule.name,
    is_default: apiSchedule.is_default,
    daily_schedules: apiSchedule.daily_schedules || [],
    // Backend не повертає created_at/updated_at для work_schedule, тому використовуємо поточну дату
    createdAt: now,
    updatedAt: now,
  }
}
