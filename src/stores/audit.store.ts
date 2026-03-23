import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { AuditLog, AuditLogFilter } from '@/types/interfaces/auditLog.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'

function extractMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    return (err as { response?: { data?: { message?: string } } }).response?.data?.message
  }
  return undefined
}

export const useAuditLogStore = defineStore('auditLog', () => {
  const logs = ref<AuditLog[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginatedResponse<AuditLog>['meta'] | null>(null)
  const filters = ref<AuditLogFilter>({})

  // Дії які доступні для фільтрування
  const availableActions = computed(() => ['created', 'updated', 'deleted', 'exported'])

  // Типи моделей які доступні для фільтрування
  const availableModelTypes = computed(() => [
    'App\\Models\\User',
    'App\\Models\\Company',
    'App\\Models\\WorkSchedule',
    'App\\Models\\TimeEntry',
    'App\\Models\\LeaveRequest',
    'App\\Models\\Message',
  ])

  async function fetchLogs(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get<PaginatedResponse<AuditLog>>(
        `${API_ROUTES.auditLogs.all}?page=${page}`,
      )
      logs.value = data.data
      pagination.value = data.meta
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка завантаження логів'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserLogs(page = 1) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get<PaginatedResponse<AuditLog>>(
        `${API_ROUTES.auditLogs.index}?page=${page}`,
      )
      logs.value = data.data
      pagination.value = data.meta
    } catch (err: unknown) {
      error.value = extractMessage(err) || 'Помилка завантаження логів'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function setFilters(newFilters: AuditLogFilter) {
    filters.value = newFilters
  }

  function clearFilters() {
    filters.value = {}
  }

  function reset() {
    logs.value = []
    pagination.value = null
    filters.value = {}
    error.value = null
  }

  return {
    logs,
    isLoading,
    error,
    pagination,
    filters,
    availableActions,
    availableModelTypes,
    fetchLogs,
    fetchUserLogs,
    setFilters,
    clearFilters,
    reset,
  }
})
