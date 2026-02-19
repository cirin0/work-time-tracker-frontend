import type { UserRole, WorkMode } from '../enums/enums.types'

interface Company {
  id: number
  name: string
}

interface Manager {
  id: number
  name: string
  email: string
  avatar: string | null
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
  work_mode?: WorkMode
  has_pin_code?: boolean
  company?: Company | null
  manager?: Manager | null
  work_schedule?: WorkSchedule | null
  created_at: string
  updated_at: string
}

// Parse backend date format: "DD-MM-YYYY HH:mm:ss"
function parseBackendDate(dateString: string): Date {
  // Format: "17-02-2026 21:47:48"
  const parts = dateString.split(' ')
  if (parts.length !== 2) {
    console.error('Invalid date format:', dateString)
    return new Date()
  }

  const datePart = parts[0]!
  const timePart = parts[1]!
  const dateParts = datePart.split('-')
  const timeParts = timePart.split(':')

  if (dateParts.length !== 3 || timeParts.length !== 3) {
    console.error('Invalid date format:', dateString)
    return new Date()
  }

  const day = dateParts[0]!
  const month = dateParts[1]!
  const year = dateParts[2]!
  const hours = timeParts[0]!
  const minutes = timeParts[1]!
  const seconds = timeParts[2]!

  // Month is 0-indexed in JavaScript Date
  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10),
    parseInt(seconds, 10),
  )
}

export function transformUserFromApi(apiUser: UserApiResponse) {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    avatar: apiUser.avatar || null,
    work_mode: apiUser.work_mode,
    has_pin_code: apiUser.has_pin_code,
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
          email: apiUser.manager.email,
          avatar: apiUser.manager.avatar,
        }
      : undefined,
    work_schedule: apiUser.work_schedule
      ? {
          id: apiUser.work_schedule.id,
          name: apiUser.work_schedule.name,
        }
      : undefined,
    createdAt: parseBackendDate(apiUser.created_at),
    updatedAt: parseBackendDate(apiUser.updated_at),
  }
}
