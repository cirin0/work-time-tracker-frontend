import { API_ROUTES, client } from '@/config/api'
import type { User } from '@/types/interfaces/user.interface'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchTime = ref<number | null>(null)

  const CACHE_DURATION = 5 * 60 * 1000

  function isCacheValid(): boolean {
    if (!profile.value || !lastFetchTime.value) return false
    return Date.now() - lastFetchTime.value < CACHE_DURATION
  }

  async function fetchProfile(forceRefresh = false) {
    if (!forceRefresh && isCacheValid()) {
      return profile.value
    }

    if (isLoading.value) {
      return profile.value
    }

    isLoading.value = true
    error.value = null

    try {
      const { data } = await client().get<User>(API_ROUTES.me)
      profile.value = data
      lastFetchTime.value = Date.now()
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      console.error('Failed to fetch profile:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearCache() {
    profile.value = null
    lastFetchTime.value = null
    error.value = null
  }

  function updateProfile(updates: Partial<User>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
      lastFetchTime.value = Date.now()
    }
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    clearCache,
    updateProfile,
    isCacheValid,
  }
})
