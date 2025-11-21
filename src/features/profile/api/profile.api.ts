import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import type { UserApiResponse } from '../lib/user.api'
import type { User } from '../lib/user.interface'
import { PROFILE_ROUTES } from './profile.routes'
import { transformUserFromApi } from '../lib/user.api'

export async function fetchProfile(): Promise<User> {
  const { data } = await apiClient.get<User>(PROFILE_ROUTES.me)
  return data
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await apiClient.get<PaginatedResponse<UserApiResponse>>(PROFILE_ROUTES.index)
  return data.data.map(transformUserFromApi)
}

export async function fetchUserById(id: number | string): Promise<User> {
  const { data } = await apiClient.get<User>(PROFILE_ROUTES.show(id))
  return data
}
