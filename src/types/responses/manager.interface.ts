import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { TimeEntrySummary } from '@/types/interfaces/timeEntrySummary.interface'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type { UserBasic } from '@/types/interfaces/userBasic.interface'

export interface CompanyStatistics {
  company_id: string
  total_hours: string
  total_minutes: string
  entries_count: string
  active_entries_count: string
  active_employees: string
  total_employees_with_entries: string
  summary: {
    today: {
      minutes: string
      hours: string
      entries: string
    }
    week: {
      minutes: string
      hours: string
      entries: string
    }
    month: {
      minutes: string
      hours: string
      entries: string
    }
  }
}

export interface CompanyStatisticsResponse {
  message: string
  data: CompanyStatistics
}

export interface TimeEntriesResponse {
  message: string
  data: TimeEntry[]
}

export interface TimeSummaryResponse {
  message: string
  data: TimeEntrySummary
}

export interface WorkScheduleUser extends UserBasic {
  work_mode: string
  work_schedule: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

export interface WorkScheduleResponse {
  message: string
  user: WorkScheduleUser
  work_schedule: WorkSchedule
}

export interface UpdateWorkScheduleRequest {
  work_schedule_id: number
}
