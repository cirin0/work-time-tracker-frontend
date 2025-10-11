import type { LeaveRequestStatus, LeaveRequestType } from '../enums/enums.types'

export interface CreateLeaveRequestRequest {
  user_id: number
  type: LeaveRequestType
  start_date: string
  end_date: string
  reason?: string
}

export interface UpdateLeaveRequestRequest {
  type?: LeaveRequestType
  start_date?: string
  end_date?: string
  reason?: string
  status?: LeaveRequestStatus
  processed_by_manager_id?: number
  manager_comments?: string
}
