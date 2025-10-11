import type { UserRole } from '../enums/enums.types'

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: UserRole
  company_id?: number
  manager_id?: number
  work_schedule_id?: number
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  company_id?: number
  manager_id?: number
  avatar?: string
  work_schedule_id?: number
}
