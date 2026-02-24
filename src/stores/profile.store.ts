import { API_ROUTES, apiClient } from '@/core/api'
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  SetupPinCodeRequest,
  ChangePinCodeRequest,
} from '@/types/requests/profileRequest.interface'
import type { UserProfile, UserProfileResponse } from '@/types/responses/profile.api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<UserProfile | null>(null)
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
      const { data } = await apiClient.get<UserProfile>(API_ROUTES.me.show)
      profile.value = data
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

  function updateProfileLocally(updates: Partial<UserProfile>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
      lastFetchTime.value = Date.now()
    }
  }

  async function updateProfile(updates: UpdateProfileRequest) {
    isSaving.value = true
    error.value = null

    try {
      const { data } = await apiClient.patch<UserProfileResponse>(API_ROUTES.me.update, updates)
      profile.value = data.user
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

      const { data } = await apiClient.post<UserProfileResponse>(
        API_ROUTES.me.updateAvatar,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      profile.value = data.user
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

  async function changePassword(passwordData: ChangePasswordRequest) {
    isSaving.value = true
    error.value = null

    try {
      await apiClient.post(API_ROUTES.me.changePassword, passwordData)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to change password'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function setupPinCode(pinData: SetupPinCodeRequest) {
    isSaving.value = true
    error.value = null

    try {
      await apiClient.post(API_ROUTES.me.setupPinCode, pinData)
      if (profile.value) {
        profile.value.has_pin_code = true
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to setup PIN code'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function changePinCode(pinData: ChangePinCodeRequest) {
    isSaving.value = true
    error.value = null

    try {
      await apiClient.patch(API_ROUTES.me.changePinCode, pinData)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to change PIN code'
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
    changePassword,
    setupPinCode,
    changePinCode,
    isCacheValid,
  }
})
