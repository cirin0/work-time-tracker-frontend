import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { TimeEntrySummary } from '@/types/interfaces/timeEntrySummary.interface'
import type { CompanyStatistics } from '@/types/interfaces/companyStatistics.interface'

export type { CompanyStatistics }

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
