import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL = 'http://localhost:8000'

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
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
    const token = localStorage.getItem('token-store')

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

      localStorage.setItem('token-store', newToken)

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

      localStorage.removeItem('token-store')

      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
