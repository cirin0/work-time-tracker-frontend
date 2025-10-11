export interface CreateWorkScheduleRequest {
  name: string
  company_id?: number
  is_default?: boolean
}

export interface UpdateWorkScheduleRequest {
  name?: string
  company_id?: number
  is_default?: boolean
}
