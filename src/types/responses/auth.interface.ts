import type { User } from '../interfaces/user.interface'

export interface LoginResponse {
  access_token: string
  expires_in: number
  user: User
}

export interface RefreshResponse {
  message: string
  access_token: string
  expires_in: number
  user: User
}
