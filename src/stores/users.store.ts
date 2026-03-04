import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { UserBasic } from '@/types/interfaces/userBasic.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserBasic[]>([])
  const currentUser = ref<UserBasic | null>(null)
  const isLoading = ref(false)
  const isLoadingUser = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)
  const perPage = ref(10)

  async function fetchUsers(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get<PaginatedResponse<UserBasic>>(API_ROUTES.users.index, {
        params: { page },
      })
      users.value = data.data
      currentPage.value = data.meta.current_page
      lastPage.value = data.meta.last_page
      total.value = data.meta.total
      perPage.value = data.meta.per_page
    } catch (err) {
      error.value = extractMessage(err) || 'Помилка завантаження користувачів'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserById(id: number | string) {
    isLoadingUser.value = true
    error.value = null
    try {
      const { data } = await apiClient.get<UserBasic>(API_ROUTES.users.show(id))
      currentUser.value = data
      return data
    } catch (err) {
      error.value = extractMessage(err) || 'Помилка завантаження користувача'
      throw err
    } finally {
      isLoadingUser.value = false
    }
  }

  function $reset() {
    users.value = []
    currentUser.value = null
    isLoading.value = false
    isLoadingUser.value = false
    error.value = null
    currentPage.value = 1
    lastPage.value = 1
    total.value = 0
    perPage.value = 10
  }

  return {
    users,
    currentUser,
    isLoading,
    isLoadingUser,
    error,
    currentPage,
    lastPage,
    total,
    perPage,
    fetchUsers,
    fetchUserById,
    $reset,
  }
})

function extractMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    return (err as { response?: { data?: { message?: string } } }).response?.data?.message
  }
  return undefined
}
