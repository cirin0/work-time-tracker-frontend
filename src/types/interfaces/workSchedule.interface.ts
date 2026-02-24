import type { Company } from './company.interface'
import type { DailySchedule } from './dailySchedule.interface'

export interface WorkSchedule {
  id: number
  name: string
  is_default: boolean
  created_at?: string
  updated_at?: string
  company?: Company | null
  daily_schedules?: DailySchedule[]
}
