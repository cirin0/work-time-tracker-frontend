import type { LeaveRequestStatus, LeaveRequestType } from '../enums/enums.types'
import type { BaseModel } from './base.model'
import type { User } from './user.interface'

export interface LeaveRequest extends BaseModel {
  user_id: number
  type: LeaveRequestType
  start_date: string
  end_date: string
  reason: string | null
  status: LeaveRequestStatus
  processed_by_manager_id: number | null
  manager_comment: string | null

  // relationships

  user?: User
  manager?: User
}
