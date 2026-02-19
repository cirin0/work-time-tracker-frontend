export interface TimeEntrySummaryPeriod {
  today: number
  week: number
  month: number
}

export interface TimeEntrySummary {
  user_id: number
  total_hours: number
  total_minutes: number
  entries_count: number
  average_work_time: number
  summary: TimeEntrySummaryPeriod
}
