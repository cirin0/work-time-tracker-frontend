import type { BaseModel } from './base.model'
import type { Company } from './company.interface'
import type { DailySchedule } from './dailySchedule.interface'

export interface WorkSchedule extends BaseModel {
  name: string
  is_default: boolean
  company?: Company | any | null
  daily_schedules?: DailySchedule[] | any
}
