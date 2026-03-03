import type { UserRole, WorkMode } from '../enums/enums.types'
import type { BaseModel } from './base.model'
import type { WorkSchedule } from './workSchedule.interface'

interface Company {
  id: number | null
  name: string
}

interface Manager {
  id: number | null
  name: string
  email: string
  avatar: string | null
}

export interface User extends BaseModel {
  name: string
  email: string
  role: UserRole
  avatar: string | null
  work_mode?: WorkMode
  has_pin_code?: boolean

  company?: Company | null
  manager?: Manager | null
  work_schedule?: WorkSchedule | null
}
