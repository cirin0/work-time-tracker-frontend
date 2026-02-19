export interface DailySchedule {
  id: number
  day_of_week: string
  start_time: string
  end_time: string
  break_duration: number | null
  is_working_day: boolean
}
