import type { UserRole } from '@/types/enums/enums.types'
import type { User } from './user.interface'

export interface UserApiResponse {
  id: number
  name: string
  email: string
  role: UserRole
  avatar: string | null
  company: unknown | null
  work_schedule: unknown | null
  created_at: string
  updated_at: string
}

export function transformUserFromApi(apiUser: UserApiResponse): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    avatar: apiUser.avatar,
    company_id: null,
    manager_id: null,
    work_schedule_id: null,
    createdAt: new Date(apiUser.created_at),
    updatedAt: new Date(apiUser.updated_at),
  }
}
