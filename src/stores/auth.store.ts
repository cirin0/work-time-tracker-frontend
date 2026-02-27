import { API_ROUTES, apiClient } from '@/core/api'
import { useUiStore } from './ui.store'
import type { User } from '@/types/interfaces/user.interface'
import type { LoginResponse, RefreshResponse } from '@/types/responses/auth.interface'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_STORE_KEY = 'token-store'

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage<string | undefined>(TOKEN_STORE_KEY, undefined)
  const user = ref<User | null>(null)
  const isLoadingUser = ref(false)

  const initialValue = localStorage.getItem(TOKEN_STORE_KEY)
  if (initialValue) {
    token.value = initialValue
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_STORE_KEY, newToken)
  }

  function clearToken() {
    token.value = undefined
    user.value = null
    isLoadingUser.value = false
    localStorage.removeItem(TOKEN_STORE_KEY)
  }

  const getToken = computed(() => token.value)
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  async function login(email: string, password: string) {
    const { data } = await apiClient.post<LoginResponse>(API_ROUTES.auth.login, {
      email,
      password,
    })
    setToken(data.access_token)
    user.value = data.user
    return data
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await apiClient.post<User>(API_ROUTES.auth.register, {
      name,
      email,
      password,
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

    if (user.value) return user.value

    const uiStore = useUiStore()
    return await uiStore.lockMeEndpoint(async () => {
      if (user.value) return user.value

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
    })
  }

  return {
    getToken,
    isAuthenticated,
    currentUser,
    isLoadingUser,
    register,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    setToken,
    clearToken,
  }
})
