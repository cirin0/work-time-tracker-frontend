export interface TimeEntrySummaryPeriodItem {
  hours: number
  minutes: number
  entries: number
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
  entries_count: number
  average_work_time: number
  summary: TimeEntrySummaryPeriod
}
