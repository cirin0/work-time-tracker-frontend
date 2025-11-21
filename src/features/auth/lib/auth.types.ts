import type { User } from '@/features/profile/lib/user.interface'

export interface LoginResponse {
  access_token: string
  expires_in: number
  user: User
}

export interface RefreshResponse {
  access_token: string
  expires_in: number
  user: User
}
