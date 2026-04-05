import { API_ROUTES, apiClient } from '@/core/api'
import { tokenService } from '@/core/api/token.service'
import type { User } from '@/types/interfaces/user.interface'
import type {
  LoginResponse,
  RefreshResponse,
  RegisterResponse,
  VerifyEmailResponse,
} from '@/types/responses/auth.interface'
import type { UserWorkScheduleResponse } from '@/types/responses/profile.api'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_STORE_KEY = 'token-store'

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage<string | undefined>(TOKEN_STORE_KEY, undefined)
  const user = ref<User | null>(null)
  const isLoadingUser = ref(false)

  function setToken(newToken: string) {
    token.value = newToken
  }

  function clearToken() {
    token.value = undefined
    user.value = null
    isLoadingUser.value = false
  }

  tokenService.register({
    get: () => token.value,
    set: setToken,
    clear: clearToken,
  })

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  async function login(email: string, password: string) {
    const { data } = await apiClient.post<LoginResponse>(API_ROUTES.auth.login, {
      email,
      password,
    })
    setToken(data.access_token)
    user.value = data.user

    await getCurrentUser()

    return data
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await apiClient.post<RegisterResponse>(API_ROUTES.auth.register, {
      name,
      email,
      password,
    })
    return data
  }

  async function verifyEmail(email: string, code: string) {
    const { data } = await apiClient.post<VerifyEmailResponse>(API_ROUTES.auth.verifyEmail, {
      email,
      code,
    })
    return data
  }

  async function resendVerificationCode(email: string) {
    const { data } = await apiClient.post<VerifyEmailResponse>(
      API_ROUTES.auth.resendVerificationCode,
      {
        email,
      },
    )
    return data
  }

  async function forgotPassword(email: string) {
    const { data } = await apiClient.post<{ message: string }>(API_ROUTES.auth.forgotPassword, {
      email,
    })
    return data
  }

  async function resetPassword(email: string, code: string, password: string) {
    const { data } = await apiClient.post<{ message: string }>(API_ROUTES.auth.resetPassword, {
      email,
      code,
      password,
      password_confirmation: password,
    })
    return data
  }

  async function refreshToken(): Promise<string> {
    const { data } = await apiClient.post<RefreshResponse>(API_ROUTES.auth.refresh)
    setToken(data.access_token)
    user.value = data.user
    return data.access_token
  }

  async function logout() {
    try {
      await apiClient.post(API_ROUTES.auth.logout)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearToken()
    }
  }

  async function getCurrentUser() {
    if (!token.value) return null

    isLoadingUser.value = true
    try {
      const { data } = await apiClient.get<User>(API_ROUTES.me.show)
      user.value = data
      return user.value
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    } finally {
      isLoadingUser.value = false
    }
  }

  async function fetchMyWorkSchedule() {
    if (!token.value || !user.value) return

    try {
      const { data: responseData } = await apiClient.get<UserWorkScheduleResponse>(
        API_ROUTES.me.getWorkSchedule,
      )
      if (user.value && responseData.data) {
        user.value = {
          ...user.value,
          work_schedule: {
            id: responseData.data.id,
            name: responseData.data.name,
            is_default: responseData.data.is_default,
            daily_schedules: responseData.data.daily_schedules,
          },
        }
      }
    } catch (error) {
      console.error('Failed to fetch work schedule details:', error)
    }
  }

  return {
    token,
    isAuthenticated,
    currentUser,
    isLoadingUser,
    register,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    fetchMyWorkSchedule,
    setToken,
    clearToken,
  }
})
