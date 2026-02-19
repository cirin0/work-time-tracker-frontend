import type { BaseModel } from './base.model'
import type { UserBasic } from './userBasic.interface'

export interface LocationData {
  lat: number
  lng: number
}

export interface TimeEntry extends BaseModel {
  user_id?: number
  start_time: string | null
  stop_time: string | null
  duration: number
  entry_type: string
  location_data: LocationData | null
  start_comment: string | null
  stop_comment: string | null

  // relationships
  user?: UserBasic
}
