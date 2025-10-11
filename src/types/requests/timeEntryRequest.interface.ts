export interface CreateTimeEntryRequest {
  user_id: number
  start_time: string
  stop_time?: string
  duration?: number
  comment?: string
}

export interface UpdateTimeEntryRequest {
  start_time?: string
  stop_time?: string
  duration?: number
  comment?: string
}
