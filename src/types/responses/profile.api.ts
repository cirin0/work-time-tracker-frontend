import type { UserRole, WorkMode } from '../enums/enums.types'
import type { DailySchedule } from '../interfaces/dailySchedule.interface'

interface ProfileCompany {
  id: number
  name: string
}

interface ProfileManager {
  id: number
  name: string
  email: string
  avatar: string | null
}

interface ProfileWorkSchedule {
  id: number
  name: string
}

export interface UserProfile {
  id: number
  name: string
  email: string
  avatar: string | null
  role: UserRole
  work_mode: WorkMode
  has_pin_code: boolean
  company: ProfileCompany | null
  manager: ProfileManager | null
  work_schedule: ProfileWorkSchedule | null
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
