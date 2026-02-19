import type { UserRole, WorkMode } from '../enums/enums.types'
import type { BaseModel } from './base.model'

interface Company {
  id: number | null
  name: string
}
interface WorkSchedule {
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
  // relationships
  company?: Company
  manager?: Manager
  work_schedule?: WorkSchedule
}
