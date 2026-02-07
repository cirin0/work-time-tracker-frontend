import { API_ROUTES, apiClient } from '@/core/api'
import type { User } from '@/types/interfaces/user.interface'
import type { UpdateUserRequest } from '@/types/requests/userRequest.interface'
import type { UserApiResponse } from '@/types/responses/user.api'
import { transformUserFromApi } from '@/types/responses/user.api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<User | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const lastFetchTime = ref<number | null>(null)
  const avatarTimestamp = ref<number>(Date.now())

  const CACHE_DURATION = 5 * 60 * 1000

  function isCacheValid(): boolean {
    if (!profile.value || !lastFetchTime.value) return false
    return Date.now() - lastFetchTime.value < CACHE_DURATION
  }

  async function fetchProfile(forceRefresh = false) {
    if (!forceRefresh && isCacheValid()) {
      return profile.value
    }

    if (isLoading.value) {
      return profile.value
    }

    isLoading.value = true
    error.value = null

    try {
      const { data } = await apiClient.get<UserApiResponse>(API_ROUTES.me.show)
      profile.value = transformUserFromApi(data)
      lastFetchTime.value = Date.now()
      return profile.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearCache() {
    profile.value = null
    lastFetchTime.value = null
    error.value = null
  }

  function updateProfileLocally(updates: Partial<User>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
      lastFetchTime.value = Date.now()
    }
  }

  async function updateProfile(updates: UpdateUserRequest) {
    isSaving.value = true
    error.value = null

    try {
      const { data } = await apiClient.patch<{ message: string; user: UserApiResponse }>(
        API_ROUTES.me.update,
        updates,
      )
      profile.value = transformUserFromApi(data.user)
      lastFetchTime.value = Date.now()
      return profile.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateAvatar(file: File) {
    isSaving.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const { data } = await apiClient.post<{ message: string; user: UserApiResponse }>(
        API_ROUTES.me.updateAvatar,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      profile.value = transformUserFromApi(data.user)
      lastFetchTime.value = Date.now()
      avatarTimestamp.value = Date.now() // Update timestamp for cache-busting
      return profile.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update avatar'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  return {
    profile,
    isLoading,
    isSaving,
    error,
    avatarTimestamp,
    fetchProfile,
    clearCache,
    updateProfileLocally,
    updateProfile,
    updateAvatar,
    isCacheValid,
  }
})
