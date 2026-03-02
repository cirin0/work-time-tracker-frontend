import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import type { CreateLeaveRequestRequest } from '@/types/requests/leaveRequestRequest.interface'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'

export const useLeaveRequestStore = defineStore('leaveRequest', () => {
  const leaveRequests = ref<LeaveRequest[]>([])
  const currentLeaveRequest = ref<LeaveRequest | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginatedResponse<LeaveRequest>['meta'] | null>(null)

  async function fetchLeaveRequests(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get<PaginatedResponse<LeaveRequest>>(
        `${API_ROUTES.leaveRequests.index}?page=${page}`,
      )
      leaveRequests.value = response.data.data
      pagination.value = response.data.meta
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка завантаження запитів на відпустку'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchLeaveRequest(id: number | string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get<LeaveRequest>(API_ROUTES.leaveRequests.show(id))
      const data = response.data
      if (data) {
        currentLeaveRequest.value = data
        return data
      }
      throw new Error('No data returned')
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка завантаження запиту'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createLeaveRequest(data: CreateLeaveRequestRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post<ApiResponse<LeaveRequest>>(
        API_ROUTES.leaveRequests.store,
        data,
      )
      await fetchLeaveRequests()
      return response.data.data
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка створення запиту'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentLeaveRequest() {
    currentLeaveRequest.value = null
  }

  return {
    leaveRequests,
    currentLeaveRequest,
    isLoading,
    error,
    pagination,
    fetchLeaveRequests,
    fetchLeaveRequest,
    createLeaveRequest,
    clearError,
    clearCurrentLeaveRequest,
  }
})
