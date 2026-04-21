import axios from 'axios'
import { apiCache } from '@/core/cache/apiCache'

export const API_BASE_URL = import.meta.env.VITE_BASE_URL

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Cache configuration for specific endpoints
const CACHE_CONFIG: Record<string, number> = {
  '/users': 300, // 5 min
  '/time-entries/active': 30, // 30 sec
  '/time-entries/summary/me': 60, // 1 min
  '/managers/users': 300, // 5 min
  '/managers/leave-requests/pending': 120, // 2 min
}

// Request interceptor for cache
apiClient.interceptors.request.use((config) => {
  if (config.method?.toLowerCase() === 'get') {
    const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`
    const cached = apiCache.get(cacheKey)

    if (cached) {
      // Return cached data by canceling request
      return Promise.reject({
        __cached: true,
        data: cached,
        config,
      })
    }
  }
  return config
})

// Response interceptor for cache
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.method?.toLowerCase() === 'get') {
      const url = response.config.url || ''
      const ttl = Object.entries(CACHE_CONFIG).find(([key]) => url.includes(key))?.[1]

      if (ttl) {
        const cacheKey = `${url}?${JSON.stringify(response.config.params || {})}`
        apiCache.set(cacheKey, response.data, ttl)
      }
    }
    return response
  },
  (error) => {
    // Handle cached response
    if (error.__cached) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK (cached)',
        headers: {},
        config: error.config,
      })
    }
    return Promise.reject(error)
  },
)
