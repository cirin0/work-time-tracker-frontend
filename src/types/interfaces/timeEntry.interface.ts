import type { BaseModel } from './base.model'
import type { UserBasic } from './userBasic.interface'

export interface LocationData {
  lat: number
  lng: number
}

export interface TimeEntry extends BaseModel {
  user_id?: number
  date: string
  start_time: string | null
  stop_time: string | null
  duration: number
  entry_type: string
  location_data: LocationData | null
  start_comment: string | null
  stop_comment: string | null

  // Schedule adherence fields (may be null if no work schedule assigned)
  lateness_minutes?: number | null
  scheduled_start_time?: string | null
  early_leave_minutes?: number | null
  scheduled_end_time?: string | null
  overtime_minutes?: number | null

  // relationships
  user?: UserBasic
}
