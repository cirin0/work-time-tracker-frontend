import type { BaseModel } from './base.model'
import type { User } from '@/features/profile/lib/user.interface'
import type { WorkSchedule } from './workSchedule.interface'

export interface Company extends BaseModel {
  name: string
  email: string | null
  phone: string | null
  logo: string | null
  description: string | null
  address: string | null
  manager_id: number | null

  employee_count?: number

  manager?: User
  employees?: User[]
  work_schedules?: WorkSchedule[]
}
