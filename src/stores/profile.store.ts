import { API_ROUTES, apiClient } from '@/core/api'
import type {
  UpdateProfileRequest,
  RequestEmailChangeRequest,
  VerifyEmailChangeRequest,
  ChangePasswordRequest,
  SetupPinCodeRequest,
  ChangePinCodeRequest,
} from '@/types/requests/profileRequest.interface'
import type { UserProfile, UserProfileResponse } from '@/types/responses/profile.api'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore()

  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const displayProfile = computed(() => {
    if (profile.value) return profile.value
    return authStore.currentUser as unknown as UserProfile | null
  })

  async function fetchProfile() {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await apiClient.get<UserProfile>(API_ROUTES.me.show)
      profile.value = data
      return profile.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearProfile() {
    profile.value = null
    error.value = null
  }

  function updateProfileLocally(updates: Partial<UserProfile>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
    }
  }

  async function updateProfile(updates: UpdateProfileRequest) {
    isSaving.value = true
    error.value = null

    try {
      const { data } = await apiClient.patch<UserProfileResponse>(API_ROUTES.me.update, updates)
      profile.value = data.user
      return profile.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function requestEmailChange(payload: RequestEmailChangeRequest) {
    isSaving.value = true
    error.value = null

    try {
      const { data } = await apiClient.post<{ message: string }>(API_ROUTES.me.requestEmailChange, {
        new_email: payload.new_email,
      })
      return data
    } catch (err) {
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function verifyEmailChange(payload: VerifyEmailChangeRequest) {
    isSaving.value = true
    error.value = null

    try {
      const { data } = await apiClient.post<{ message: string }>(API_ROUTES.me.verifyEmailChange, {
        new_email: payload.new_email,
        code: payload.code,
      })

      if (profile.value) {
        profile.value.email = payload.new_email
      }

      if (authStore.currentUser) {
        authStore.currentUser.email = payload.new_email
      }

      return data
    } catch (err) {
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
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )

      profile.value = data.user
      return profile.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update avatar'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function requestPasswordChangeCode() {
    isSaving.value = true
    error.value = null

    try {
      const { data } = await apiClient.post<{ message: string }>(
        API_ROUTES.me.requestPasswordChangeCode,
      )
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to request password code'
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
    displayProfile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    clearProfile,
    updateProfileLocally,
    updateProfile,
    requestEmailChange,
    verifyEmailChange,
    updateAvatar,
    requestPasswordChangeCode,
    changePassword,
    setupPinCode,
    changePinCode,
  }
})
