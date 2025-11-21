import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchCurrentUser, loginRequest, logoutRequest, refreshRequest, registerRequest } from '../api/auth.api'
import { TOKEN_STORE_KEY } from '../api/auth.routes'
import type { User } from '@/features/profile/lib/user.interface'

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage<string | undefined>(TOKEN_STORE_KEY, undefined)
  const user = ref<User | null>(null)

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
    localStorage.removeItem(TOKEN_STORE_KEY)
  }

  const getToken = computed(() => token.value)
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  async function login(email: string, password: string) {
    const data = await loginRequest(email, password)
    setToken(data.access_token)
    user.value = data.user
    return data
  }

  async function register(name: string, email: string, password: string) {
    return registerRequest(name, email, password)
  }

  async function refreshToken(): Promise<string> {
    const data = await refreshRequest()
    setToken(data.access_token)
    user.value = data.user
    return data.access_token
  }

  async function logout() {
    try {
      await logoutRequest()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearToken()
    }
  }

  async function getCurrentUser() {
    if (!token.value) return null

    try {
      const data = await fetchCurrentUser()
      user.value = data
      return data
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  return {
    getToken,
    isAuthenticated,
    currentUser,
    register,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    setToken,
    clearToken,
  }
})
