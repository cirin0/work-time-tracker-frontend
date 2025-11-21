import type { BaseModel } from './base.model'
import type { User } from '@/features/profile/lib/user.interface'

export interface TimeEntry extends BaseModel {
  user_id: number
  start_time: string
  stop_time: string | null
  duration: number
  comment: string | null

  // relationships

  user?: User
}
