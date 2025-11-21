import type { BaseModel } from './base.model'
import type { User } from '@/features/profile/lib/user.interface'
import type { Company } from './company.interface'

export interface WorkSchedule extends BaseModel {
  company_id: number | null
  name: string
  description: string | null
  timezone: string | null

  // relationships

  users?: User[]
  company?: Company
}
