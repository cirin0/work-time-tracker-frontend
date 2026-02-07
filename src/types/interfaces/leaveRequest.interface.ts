import type { LeaveRequestStatus, LeaveRequestType } from '../enums/enums.types'

export interface LeaveRequest {
  id: number
  user: {
    id: number
    name: string
    email: string
  }
  type: LeaveRequestType
  start_date: string
  end_date: string
  reason: string | null
  status: LeaveRequestStatus
  processed_by_manager_id: number | null
  manager_comments: string | null
  created_at: string
  updated_at: string
}
