import type { BaseModel } from './base.model'
import type { Company } from './company.interface'
import type { DailySchedule } from './dailySchedule.interface'
import type { User } from './user.interface'

export interface WorkSchedule extends BaseModel {
  name: string
  company_id: number | null
  is_default: boolean

  // relationships

  company?: Company
  users?: User[]
  daily_schedule?: DailySchedule[]
}

/*
export interface WorkSchedule extends BaseModel {
  name: string;
  description: string | null;
  working_hours_per_day: number;
  working_days_per_week: number;
  start_time: string;
  end_time: string;
}
*/
