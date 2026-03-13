import type { UserRole, WorkMode } from '../enums/enums.types'
import type { UserBasic } from '../interfaces/userBasic.interface'
import type { WorkSchedule } from '../interfaces/workSchedule.interface'
import type { DailySchedule } from '../interfaces/dailySchedule.interface'

export interface UserProfile {
  id: number
  name: string
  email: string
  avatar: string | null
  role: UserRole
  work_mode: WorkMode
  has_pin_code: boolean
  company: { id: number; name: string } | null
  manager: UserBasic | null
  work_schedule: Pick<WorkSchedule, 'id' | 'name'> | null
  created_at: string
  updated_at: string
}

export interface UserProfileResponse {
  message: string
  user: UserProfile
}

interface WorkScheduleDetails {
  id: number
  name: string
  is_default: boolean
  daily_schedules: DailySchedule[]
}

export interface UserWorkScheduleResponse {
  message: string
  data: WorkScheduleDetails
}
