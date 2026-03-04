import type { UserRole, WorkMode } from '../enums/enums.types'
import type { BaseModel } from './base.model'
import type { UserBasic } from './userBasic.interface'
import type { WorkSchedule } from './workSchedule.interface'

export interface User extends BaseModel {
  name: string
  email: string
  role: UserRole
  avatar: string | null
  work_mode?: WorkMode
  has_pin_code?: boolean

  company?: { id: number; name: string } | null
  manager?: UserBasic | null
  work_schedule?: WorkSchedule | null
}
