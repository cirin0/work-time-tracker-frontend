import { API_ROUTES, client } from '@/config/api'
import type { User } from '@/types/interfaces/user.interface'
import type { LoginResponse } from '@/types/responses/auth.interface'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'

const TOKEN_STORE_KEY = 'token-store'

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage<string | undefined>(TOKEN_STORE_KEY, undefined)

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
    localStorage.removeItem(TOKEN_STORE_KEY)
  }

  const getToken = computed(() => token.value)

  async function login(email: string, password: string) {
    const { data } = await client().post<LoginResponse>(API_ROUTES.auth.login, {
      email,
      password,
    })
    setToken(data.access_token)
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await client().post<User>(API_ROUTES.auth.register, {
      name,
      email,
      password,
    })
    return data
  }

  return { getToken, register, login, setToken, clearToken }
})
