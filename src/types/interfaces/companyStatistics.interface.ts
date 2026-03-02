import type {
  AttendanceStatistics,
  TimeEntrySummaryPeriod,
} from '@/types/interfaces/timeEntrySummary.interface'

export interface CompanyStatistics {
  company_id: number
  employee_count: number
  total_hours: number
  total_minutes: number
  total_entries_count: number
  total_working_days: number
  average_working_days_per_employee: number
  active_entries_count: number
  active_employees: number
  total_employees_with_entries: number
  attendance: AttendanceStatistics
  summary: TimeEntrySummaryPeriod
}
