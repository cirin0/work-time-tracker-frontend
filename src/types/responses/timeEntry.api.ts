import type { LocationData } from '../interfaces/timeEntry.interface'
import type { UserBasic } from '../interfaces/userBasic.interface'

export interface TimeEntryApiResponse {
  id: number
  user_id?: number
  start_time: string | null
  stop_time: string | null
  duration: number
  entry_type: string
  location_data: LocationData | null
  start_comment: string | null
  stop_comment: string | null
  user?: UserBasic
  created_at: string
  updated_at: string
}

// Parse backend date format: "DD-MM-YYYY HH:mm:ss"
function parseBackendDate(dateString: string): Date {
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

  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10),
    parseInt(seconds, 10),
  )
}

export function transformTimeEntryFromApi(apiEntry: TimeEntryApiResponse) {
  return {
    id: apiEntry.id,
    user_id: apiEntry.user_id,
    start_time: apiEntry.start_time,
    stop_time: apiEntry.stop_time,
    duration: apiEntry.duration,
    entry_type: apiEntry.entry_type,
    location_data: apiEntry.location_data,
    start_comment: apiEntry.start_comment,
    stop_comment: apiEntry.stop_comment,
    user: apiEntry.user,
    createdAt: parseBackendDate(apiEntry.created_at),
    updatedAt: parseBackendDate(apiEntry.updated_at),
  }
}
