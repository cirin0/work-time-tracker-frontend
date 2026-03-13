import type { User } from '../interfaces/user.interface'
import type { WorkSchedule } from '../interfaces/workSchedule.interface'

export interface WorkScheduleWithUserResponse {
  message: string
  user: User
  work_schedule: WorkSchedule
}
