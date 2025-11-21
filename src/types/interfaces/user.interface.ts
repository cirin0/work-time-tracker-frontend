import type { UserRole } from '../enums/enums.types'
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
}

export interface User extends BaseModel {
  name: string
  email: string
  role: UserRole
  avatar: string | null
  // relationships
  company?: Company
  manager?: Manager
  work_schedule?: WorkSchedule
}
