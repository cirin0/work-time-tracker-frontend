import type { User } from '../interfaces/user.interface'
import type { UserBasic } from '../interfaces/userBasic.interface'

export interface RegisterResponse {
  message: string
  user: UserBasic
}

export interface VerifyEmailResponse {
  message: string
}

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
