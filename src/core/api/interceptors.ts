import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { apiClient } from './client'
import { API_ROUTES } from '../config/api.config'

const TOKEN_KEY = 'token-store'

let isRefreshing = false
let failedRequestsQueue: Array<{
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}> = []

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
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
      originalRequest.url === API_ROUTES.auth.refresh
    ) {
      return Promise.reject(error)
    }

    if (
      originalRequest.url === API_ROUTES.auth.login ||
      originalRequest.url === API_ROUTES.auth.register
    ) {
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
      const { data } = await apiClient.post(API_ROUTES.auth.refresh)
      const newToken = data.access_token

      localStorage.setItem(TOKEN_KEY, newToken)

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

      localStorage.removeItem(TOKEN_KEY)

      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
