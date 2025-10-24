import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    index: '/users',
    show: (id: number | string) => `/users/${id}`,
  },
}

export function client() {
  const authStore = useAuthStore()
  return axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${authStore.getToken}`,
    },
  })
}
