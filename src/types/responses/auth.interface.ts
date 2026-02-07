import type { UserApiResponse } from './user.api'

export interface LoginResponse {
  access_token: string
  expires_in: number
  user: UserApiResponse
}

export interface RefreshResponse {
  access_token: string
  expires_in: number
  user: UserApiResponse
}
