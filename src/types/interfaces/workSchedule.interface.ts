import type { DailySchedule } from './dailySchedule.interface'

export interface WorkSchedule {
  id: number
  name: string
  is_default?: boolean
  daily_schedules?: DailySchedule[]
}
