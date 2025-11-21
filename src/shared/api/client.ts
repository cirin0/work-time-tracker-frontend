import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { AUTH_ROUTES, TOKEN_STORE_KEY } from '@/features/auth/api/auth.routes'

export const API_BASE_URL = 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedRequestsQueue: Array<{
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}> = []

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORE_KEY)

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === AUTH_ROUTES.refresh
    ) {
      return Promise.reject(error)
    }

    if (originalRequest.url === AUTH_ROUTES.login || originalRequest.url === AUTH_ROUTES.register) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject })
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    isRefreshing = true

    try {
      const { data } = await apiClient.post(AUTH_ROUTES.refresh)
      const newToken = data.access_token

      localStorage.setItem(TOKEN_STORE_KEY, newToken)

      failedRequestsQueue.forEach((request) => {
        request.resolve(newToken)
      })
      failedRequestsQueue = []

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }

      return apiClient(originalRequest)
    } catch (refreshError) {
      failedRequestsQueue.forEach((request) => {
        request.reject(refreshError as AxiosError)
      })
      failedRequestsQueue = []

      localStorage.removeItem(TOKEN_STORE_KEY)

      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
