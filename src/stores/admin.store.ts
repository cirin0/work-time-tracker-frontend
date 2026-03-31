import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { User } from '@/types/interfaces/user.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'
import type {
  AdminUpdateUserRequest,
  AdminUpdateUserRoleRequest,
  AdminUpdateWorkModeRequest,
  AdminResetPasswordRequest,
} from '@/types/requests/adminUserRequest.interface'

export const useAdminStore = defineStore('admin', () => {
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const isLoading = ref(false)
  const isLoadingUser = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginatedResponse<User>['meta'] | null>(null)

  async function fetchAllUsers(page = 1, search = '') {
    isLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search.trim()) params.set('search', search.trim())
      const { data } = await apiClient.get<PaginatedResponse<User>>(
        `${API_ROUTES.admin.users.index}?${params.toString()}`,
      )
      users.value = data.data
      pagination.value = data.meta
    } catch (err: unknown) {
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
      const { data } = await apiClient.get<ApiResponse<User>>(API_ROUTES.admin.users.show(id))
      if (data.data) selectedUser.value = data.data
      return data.data
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка завантаження користувача'
      throw err
    } finally {
      isLoadingUser.value = false
    }
  }

  async function updateUser(id: number | string, payload: AdminUpdateUserRequest) {
    try {
      const { data } = await apiClient.patch<ApiResponse<User>>(
        API_ROUTES.admin.users.update(id),
        payload,
      )
      if (data.data) syncUser(data.data)
      return data.data
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка оновлення користувача'
      throw err
    }
  }

  async function updateUserRole(id: number | string, payload: AdminUpdateUserRoleRequest) {
    try {
      const { data } = await apiClient.patch<ApiResponse<User>>(
        API_ROUTES.admin.users.updateRole(id),
        payload,
      )
      if (data.data) syncUser(data.data)
      return data.data
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка зміни ролі'
      throw err
    }
  }

  async function updateWorkMode(id: number | string, payload: AdminUpdateWorkModeRequest) {
    try {
      const { data } = await apiClient.patch<ApiResponse<User>>(
        API_ROUTES.admin.users.updateWorkMode(id),
        payload,
      )
      if (data.data) syncUser(data.data)
      return data.data
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка зміни режиму роботи'
      throw err
    }
  }

  async function resetPassword(id: number | string, payload: AdminResetPasswordRequest) {
    try {
      const { data } = await apiClient.post<ApiResponse<User>>(
        API_ROUTES.admin.users.resetPassword(id),
        payload,
      )
      return data.data
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка скидання паролю'
      throw err
    }
  }

  async function deleteUser(id: number | string) {
    try {
      await apiClient.delete(API_ROUTES.admin.users.delete(id))
      users.value = users.value.filter((u) => u.id !== id)
      if (selectedUser.value?.id === id) {
        selectedUser.value = null
      }
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка видалення користувача'
      throw err
    }
  }

  function syncUser(updated: User) {
    const index = users.value.findIndex((u) => u.id === updated.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updated }
    }
    if (selectedUser.value?.id === updated.id) {
      selectedUser.value = { ...selectedUser.value, ...updated }
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    users.value = []
    selectedUser.value = null
    isLoading.value = false
    isLoadingUser.value = false
    error.value = null
    pagination.value = null
  }

  return {
    users,
    selectedUser,
    isLoading,
    isLoadingUser,
    error,
    pagination,
    fetchAllUsers,
    fetchUserById,
    updateUser,
    updateUserRole,
    updateWorkMode,
    resetPassword,
    deleteUser,
    clearError,
    $reset,
  }
})

function extractMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    return (err as { response?: { data?: { message?: string } } }).response?.data?.message
  }
  return undefined
}
