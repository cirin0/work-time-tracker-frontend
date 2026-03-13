export interface AttendanceStatistics {
  late_count: number
  early_count: number
  on_time_count: number
  total_late_minutes: number
  average_late_minutes: number
  early_leave_count: number
  total_early_leave_minutes: number
  average_early_leave_minutes: number
  overtime_count: number
  total_overtime_minutes: number
  average_overtime_minutes: number
}

export interface TimeEntrySummaryPeriodItem {
  hours: number
  minutes: number
  working_days: number
  late_count: number
  early_count: number
}

export interface TimeEntrySummaryPeriod {
  today: TimeEntrySummaryPeriodItem
  week: TimeEntrySummaryPeriodItem
  month: TimeEntrySummaryPeriodItem
}

export interface TimeEntrySummary {
  user_id: number
  total_hours: number
  total_minutes: number
  working_days: number
  average_work_time: number
  attendance: AttendanceStatistics
  summary: TimeEntrySummaryPeriod
}
