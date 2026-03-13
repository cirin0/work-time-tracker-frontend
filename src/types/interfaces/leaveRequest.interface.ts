import type { LeaveRequestStatus, LeaveRequestType } from '../enums/enums.types'
import type { UserBasic } from './userBasic.interface'

export interface LeaveRequest {
  id: number
  user?: UserBasic
  type: LeaveRequestType
  start_date: string
  end_date: string
  reason?: string | null
  status: LeaveRequestStatus
  processor?: UserBasic | null
  manager_comment?: string | null
  created_at: string
  updated_at?: string
}
