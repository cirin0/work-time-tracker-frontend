import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { TimeEntrySummary } from '@/types/interfaces/timeEntrySummary.interface'

export interface CompanyStatistics {
  company_id: number
  total_hours: number
  total_minutes: number
  entries_count: number
  active_entries_count: number
  active_employees: number
  total_employees_with_entries: number
  summary: {
    today: {
      minutes: number
      hours: number
      entries: number
    }
    week: {
      minutes: number
      hours: number
      entries: number
    }
    month: {
      minutes: number
      hours: number
      entries: number
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
