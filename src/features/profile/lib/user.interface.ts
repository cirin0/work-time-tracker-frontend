import type { UserRole } from '@/types/enums/enums.types'
import type { BaseModel } from '@/types/interfaces/base.model'
import type { Company } from '@/types/interfaces/company.interface'
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'

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
