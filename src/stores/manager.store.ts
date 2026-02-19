import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { User } from '@/types/interfaces/user.interface'
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { TimeEntrySummary } from '@/types/interfaces/timeEntrySummary.interface'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import type { UserApiResponse } from '@/types/responses/user.api'
import { transformUserFromApi } from '@/types/responses/user.api'
import type { TimeEntryApiResponse } from '@/types/responses/timeEntry.api'
import { transformTimeEntryFromApi } from '@/types/responses/timeEntry.api'
import type { WorkScheduleWithUserResponse } from '@/types/responses/workSchedule.api'
import { transformWorkScheduleFromApi } from '@/types/responses/workSchedule.api'
import type { RejectLeaveRequestRequest } from '@/types/requests/managerLeaveRequestRequest.interface'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'
import type {
  CompanyStatistics,
  CompanyStatisticsResponse,
} from '@/types/responses/manager.interface'

export const useManagerStore = defineStore('manager', () => {
  // Employees
  const employees = ref<User[]>([])
  const isLoadingEmployees = ref(false)

  // Company Statistics
  const companyStats = ref<CompanyStatistics | null>(null)
  const isLoadingStats = ref(false)

  // Leave Requests
  const leaveRequests = ref<LeaveRequest[]>([])
  const allLeaveRequests = ref<LeaveRequest[]>([])
  const isLoadingLeaveRequests = ref(false)
  const leaveRequestsPagination = ref<PaginatedResponse<LeaveRequest>['meta'] | null>(null)

  // Selected Employee Details
  const selectedEmployee = ref<User | null>(null)
  const selectedEmployeeSummary = ref<TimeEntrySummary | null>(null)
  const selectedEmployeeTimeEntries = ref<TimeEntry[]>([])
  const selectedEmployeeWorkSchedule = ref<WorkSchedule | null>(null)
  const isLoadingEmployeeDetails = ref(false)

  // Errors
  const error = ref<string | null>(null)

  async function fetchEmployees() {
    isLoadingEmployees.value = true
    error.value = null
    try {
      const { data } = await apiClient.get<PaginatedResponse<UserApiResponse>>(
        API_ROUTES.manager.users.index,
      )
      employees.value = data.data.map(transformUserFromApi)
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка завантаження співробітників'
      console.error('Failed to load employees:', err)
      throw err
    } finally {
      isLoadingEmployees.value = false
    }
  }

  async function fetchCompanyStatistics() {
    isLoadingStats.value = true
    try {
      const { data } = await apiClient.get<CompanyStatisticsResponse>(API_ROUTES.manager.statistics)
      companyStats.value = data.data
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      console.error('Failed to load company statistics:', errorMessage || err)
      // Не кидаємо помилку для статистики, щоб не блокувати інші дані
    } finally {
      isLoadingStats.value = false
    }
  }

  async function fetchPendingLeaveRequests() {
    isLoadingLeaveRequests.value = true
    error.value = null
    try {
      const response = await apiClient.get<ApiResponse<LeaveRequest[]>>(
        API_ROUTES.manager.leaveRequests.pending,
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
      isLoadingLeaveRequests.value = false
    }
  }

  async function fetchAllLeaveRequests(page = 1, perPage = 10) {
    isLoadingLeaveRequests.value = true
    error.value = null
    try {
      const response = await apiClient.get<PaginatedResponse<LeaveRequest>>(
        `${API_ROUTES.manager.leaveRequests.index}?page=${page}&per_page=${perPage}`,
      )
      allLeaveRequests.value = response.data.data || []
      leaveRequestsPagination.value = response.data.meta
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка завантаження всіх запитів на відпустку'
      throw err
    } finally {
      isLoadingLeaveRequests.value = false
    }
  }

  async function approveLeaveRequest(id: number) {
    try {
      const response = await apiClient.post<ApiResponse<LeaveRequest>>(
        API_ROUTES.manager.leaveRequests.approve(id),
      )

      // Видаляємо з pending списку
      const pendingIndex = leaveRequests.value.findIndex((req) => req.id === id)
      if (pendingIndex !== -1) {
        leaveRequests.value.splice(pendingIndex, 1)
      }

      // Оновлюємо в повному списку якщо там є
      const allIndex = allLeaveRequests.value.findIndex((req) => req.id === id)
      if (allIndex !== -1 && response.data.data) {
        allLeaveRequests.value[allIndex] = response.data.data
      }

      return response.data.data
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка схвалення запиту'
      throw err
    }
  }

  async function rejectLeaveRequest(id: number, data: RejectLeaveRequestRequest) {
    try {
      const response = await apiClient.post<ApiResponse<LeaveRequest>>(
        API_ROUTES.manager.leaveRequests.reject(id),
        data,
      )

      // Видаляємо з pending списку
      const pendingIndex = leaveRequests.value.findIndex((req) => req.id === id)
      if (pendingIndex !== -1) {
        leaveRequests.value.splice(pendingIndex, 1)
      }

      // Оновлюємо в повному списку якщо там є
      const allIndex = allLeaveRequests.value.findIndex((req) => req.id === id)
      if (allIndex !== -1 && response.data.data) {
        allLeaveRequests.value[allIndex] = response.data.data
      }

      return response.data.data
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка відхилення запиту'
      throw err
    }
  }

  async function fetchEmployeeById(userId: number) {
    isLoadingEmployeeDetails.value = true
    error.value = null
    try {
      // Завжди робимо запит до API для отримання повних деталей співробітника
      const { data } = await apiClient.get<ApiResponse<UserApiResponse>>(
        API_ROUTES.manager.users.show(userId),
      )
      if (data.data) {
        selectedEmployee.value = transformUserFromApi(data.data)
      }
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      error.value = errorMessage || 'Помилка завантаження деталей співробітника'
      throw err
    } finally {
      isLoadingEmployeeDetails.value = false
    }
  }

  async function fetchEmployeeTimeSummary(userId: number) {
    try {
      const { data } = await apiClient.get<ApiResponse<TimeEntrySummary>>(
        API_ROUTES.manager.users.timeSummary(userId),
      )
      if (data.data) {
        selectedEmployeeSummary.value = data.data
      }
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      console.error('Failed to load employee time summary:', errorMessage || err)
      throw err
    }
  }

  async function fetchEmployeeTimeEntries(userId: number) {
    try {
      const { data } = await apiClient.get<ApiResponse<TimeEntryApiResponse[]>>(
        API_ROUTES.manager.users.timeEntries(userId),
      )
      if (data.data) {
        selectedEmployeeTimeEntries.value = data.data.map(transformTimeEntryFromApi)
      }
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      console.error('Failed to load employee time entries:', errorMessage || err)
      throw err
    }
  }

  async function fetchEmployeeWorkSchedule(userId: number) {
    try {
      const { data } = await apiClient.get<WorkScheduleWithUserResponse>(
        API_ROUTES.manager.users.workSchedule(userId),
      )
      if (data.work_schedule) {
        selectedEmployeeWorkSchedule.value = transformWorkScheduleFromApi(data.work_schedule)
      }
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      console.error('Failed to load employee work schedule:', errorMessage || err)
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    employees.value = []
    companyStats.value = null
    leaveRequests.value = []
    allLeaveRequests.value = []
    leaveRequestsPagination.value = null
    selectedEmployee.value = null
    selectedEmployeeSummary.value = null
    selectedEmployeeTimeEntries.value = []
    selectedEmployeeWorkSchedule.value = null
    isLoadingEmployees.value = false
    isLoadingStats.value = false
    isLoadingLeaveRequests.value = false
    isLoadingEmployeeDetails.value = false
    error.value = null
  }

  return {
    // State
    employees,
    companyStats,
    leaveRequests,
    allLeaveRequests,
    leaveRequestsPagination,
    selectedEmployee,
    selectedEmployeeSummary,
    selectedEmployeeTimeEntries,
    selectedEmployeeWorkSchedule,
    isLoadingEmployees,
    isLoadingStats,
    isLoadingLeaveRequests,
    isLoadingEmployeeDetails,
    error,
    // Actions
    fetchEmployees,
    fetchCompanyStatistics,
    fetchPendingLeaveRequests,
    fetchAllLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    fetchEmployeeById,
    fetchEmployeeTimeSummary,
    fetchEmployeeTimeEntries,
    fetchEmployeeWorkSchedule,
    clearError,
    $reset,
  }
})
