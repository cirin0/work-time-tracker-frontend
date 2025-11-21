import { apiClient } from '@/shared/api/client'
import type { User } from '@/features/profile/lib/user.interface'
import type { LoginResponse, RefreshResponse } from '../lib/auth.types'
import { AUTH_ROUTES } from './auth.routes'

export async function loginRequest(email: string, password: string) {
  const { data } = await apiClient.post<LoginResponse>(AUTH_ROUTES.login, { email, password })
  return data
}

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await apiClient.post<User>(AUTH_ROUTES.register, { name, email, password })
  return data
}

export async function refreshRequest() {
  const { data } = await apiClient.post<RefreshResponse>(AUTH_ROUTES.refresh)
  return data
}

export async function logoutRequest() {
  return apiClient.post(AUTH_ROUTES.logout)
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<User>(AUTH_ROUTES.me)
  return data
}
