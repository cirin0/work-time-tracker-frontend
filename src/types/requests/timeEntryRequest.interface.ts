export interface CreateTimeEntryRequest {
  start_comment?: string
  latitude?: number
  longitude?: number
  qr_code?: string
}

export interface StopTimeEntryRequest {
  stop_comment?: string
  pin_code: string
}

export interface UpdateTimeEntryRequest {
  start_time?: string
  stop_time?: string
  duration?: number
  comment?: string
}
