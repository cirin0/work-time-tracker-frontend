export interface DailyScheduleInput {
  day_of_week: string
  start_time: string
  end_time: string
  break_duration: number
  is_working_day: boolean
}

export interface CreateWorkScheduleRequest {
  name: string
  company_id?: number
  is_default?: boolean
  daily_schedules?: DailyScheduleInput[]
}

export interface UpdateWorkScheduleRequest {
  name?: string
  company_id?: number
  is_default?: boolean
  daily_schedules?: DailyScheduleInput[]
}

export interface AssignWorkScheduleRequest {
  work_schedule_id: number
}
