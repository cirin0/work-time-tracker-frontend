import type { BaseModel } from './base.model'
import type { User } from '@/features/profile/lib/user.interface'

export interface LeaveRequest extends BaseModel {
  user_id: number
  type: string
  start_date: string
  end_date: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  approver_id: number | null

  // relationships

  user?: User
  approver?: User
}
