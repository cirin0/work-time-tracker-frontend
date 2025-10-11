import type { UserRole } from '../enums/enums.types'
import type { BaseModel } from './base.model'
import type { Company } from './company.interface'
import type { LeaveRequest } from './leaveRequest.interface'
import type { TimeEntry } from './timeEntry.interface'
import type { WorkSchedule } from './workSchedule.interface'

export interface User extends BaseModel {
  name: string
  email: string
  role: UserRole
  company_id: number | null
  manager_id: number | null
  avatar: string | null
  work_schedule_id: number | null

  // relationships

  company?: Company
  manager?: User
  employees?: User[]
  leave_requests?: LeaveRequest[]
  time_entries?: TimeEntry[]
  work_schedule?: WorkSchedule
}
