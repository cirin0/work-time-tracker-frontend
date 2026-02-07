import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import type { RejectLeaveRequestRequest } from '@/types/requests/managerLeaveRequestRequest.interface'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'

export const useManagerLeaveRequestStore = defineStore('managerLeaveRequest', () => {
  const leaveRequests = ref<LeaveRequest[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLeaveRequests() {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get<ApiResponse<LeaveRequest[]>>(
        API_ROUTES.manager.leaveRequests.index,
      )
      leaveRequests.value = response.data.data || []
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

  async function approveLeaveRequest(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post<ApiResponse<LeaveRequest>>(
        API_ROUTES.manager.leaveRequests.approve(id),
      )
      const index = leaveRequests.value.findIndex((req) => req.id === id)
      if (index !== -1 && response.data.data) {
        leaveRequests.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка схвалення запиту'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function rejectLeaveRequest(id: number, data: RejectLeaveRequestRequest) {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post<ApiResponse<LeaveRequest>>(
        API_ROUTES.manager.leaveRequests.reject(id),
        data,
      )
      const index = leaveRequests.value.findIndex((req) => req.id === id)
      if (index !== -1 && response.data.data) {
        leaveRequests.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка відхилення запиту'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    leaveRequests,
    isLoading,
    error,
    fetchLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    clearError,
  }
})
