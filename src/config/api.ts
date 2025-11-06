import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

export const API_BASE_URL = 'http://localhost:8000'

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  me: '/me',
  users: {
    index: '/users',
    show: (id: number | string) => `/users/${id}`,
  },
  messages: {
    index: (receiverId: number | string) => `/messages/${receiverId}`,
    store: '/messages',
  },
}

export function client() {
  const authStore = useAuthStore()
  return axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${authStore.getToken}`,
    },
  })
}
