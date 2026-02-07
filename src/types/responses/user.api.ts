import type { UserRole } from '../enums/enums.types'

interface Company {
  id: number
  name: string
}

interface Manager {
  id: number
  name: string
}

interface WorkSchedule {
  id: number
  name: string
}

export interface UserApiResponse {
  id: number
  name: string
  email: string
  role: UserRole
  avatar: string | null
  company?: Company | null
  manager?: Manager | null
  work_schedule?: WorkSchedule | null
  created_at: string
  updated_at: string
}

export function transformUserFromApi(apiUser: UserApiResponse) {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    avatar: apiUser.avatar || null,
    company: apiUser.company
      ? {
          id: apiUser.company.id,
          name: apiUser.company.name,
        }
      : undefined,
    manager: apiUser.manager
      ? {
          id: apiUser.manager.id,
          name: apiUser.manager.name,
        }
      : undefined,
    work_schedule: apiUser.work_schedule
      ? {
          id: apiUser.work_schedule.id,
          name: apiUser.work_schedule.name,
        }
      : undefined,
    createdAt: new Date(apiUser.created_at),
    updatedAt: new Date(apiUser.updated_at),
  }
}
