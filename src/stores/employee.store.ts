import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import { downloadBlob } from '@/core/utils/download'
import { cacheInvalidation } from '@/core/cache/cacheInvalidation'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { TimeEntrySummary } from '@/types/interfaces/timeEntrySummary.interface'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'

export const useEmployeeStore = defineStore('employee', () => {
  // Time summary
  const timeSummary = ref<TimeEntrySummary | null>(null)
  const isLoadingSummary = ref(false)

  // Active time entry
  const activeEntry = ref<TimeEntry | null>(null)
  const isLoadingActiveEntry = ref(false)

  // Recent time entries
  const recentEntries = ref<TimeEntry[]>([])
  const entriesMeta = ref<PaginatedResponse<TimeEntry>['meta'] | null>(null)
  const isLoadingEntries = ref(false)

  // Errors
  const error = ref<string | null>(null)

  // Export
  const isExporting = ref(false)

  function extractErrorMessage(err: unknown): string | undefined {
    if (err && typeof err === 'object' && 'response' in err) {
      return (err as { response?: { data?: { message?: string } } }).response?.data?.message
    }
    return undefined
  }

  async function fetchTimeSummary() {
    isLoadingSummary.value = true
    try {
      const { data } = await apiClient.get<ApiResponse<TimeEntrySummary>>(
        API_ROUTES.timeEntries.summaryByCurrentUser,
      )
      if (data.data) {
        timeSummary.value = data.data
      }
    } catch (err: unknown) {
      console.error('Failed to load time summary:', extractErrorMessage(err) || err)
    } finally {
      isLoadingSummary.value = false
    }
  }

  async function fetchActiveEntry() {
    isLoadingActiveEntry.value = true
    try {
      const { data } = await apiClient.get<ApiResponse<TimeEntry | null>>(
        API_ROUTES.timeEntries.active,
      )
      activeEntry.value = data.data ?? null
    } catch (err: unknown) {
      console.error('Failed to load active entry:', extractErrorMessage(err) || err)
    } finally {
      isLoadingActiveEntry.value = false
    }
  }

  async function fetchTimeEntries(page = 1, perPage = 5) {
    isLoadingEntries.value = true
    try {
      const { data } = await apiClient.get<PaginatedResponse<TimeEntry>>(
        API_ROUTES.timeEntries.index,
        { params: { per_page: perPage, page } },
      )
      if (data?.data) {
        recentEntries.value = data.data
        entriesMeta.value = data.meta
      }
      return data.data
    } catch (err: unknown) {
      console.error('Failed to load time entries:', extractErrorMessage(err) || err)
      return null
    } finally {
      isLoadingEntries.value = false
    }
  }

  async function startWork(payload: { entry_type?: string; start_comment?: string }) {
    error.value = null
    try {
      const { data } = await apiClient.post<ApiResponse<TimeEntry>>(
        API_ROUTES.timeEntries.store,
        payload,
      )
      if (data.data) {
        activeEntry.value = data.data
      }
      cacheInvalidation.onTimeEntryChange()
      await fetchTimeSummary()
      return data.data
    } catch (err: unknown) {
      error.value = extractErrorMessage(err) || 'Помилка початку роботи'
      throw err
    }
  }

  async function stopWork(payload: { pin_code: string; stop_comment?: string }) {
    error.value = null
    try {
      const { data } = await apiClient.patch<ApiResponse<TimeEntry>>(
        API_ROUTES.timeEntries.stopActive,
        payload,
      )
      activeEntry.value = null
      cacheInvalidation.onTimeEntryChange()
      await fetchTimeSummary()
      return data.data
    } catch (err: unknown) {
      error.value = extractErrorMessage(err) || 'Помилка зупинки роботи'
      throw err
    }
  }

  async function exportTimeEntries(from?: string, to?: string) {
    isExporting.value = true
    error.value = null
    try {
      const response = await apiClient.get<Blob>(API_ROUTES.timeEntries.export, {
        params: { from, to },
        responseType: 'blob',
      })
      downloadBlob(response, 'time-entries.xlsx')
    } catch (err: unknown) {
      error.value = extractErrorMessage(err) || 'Помилка завантаження звіту'
      throw err
    } finally {
      isExporting.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    timeSummary.value = null
    activeEntry.value = null
    recentEntries.value = []
    entriesMeta.value = null
    isLoadingSummary.value = false
    isLoadingActiveEntry.value = false
    isLoadingEntries.value = false
    isExporting.value = false
    error.value = null
  }

  return {
    // State
    timeSummary,
    activeEntry,
    recentEntries,
    entriesMeta,
    isLoadingSummary,
    isLoadingActiveEntry,
    isLoadingEntries,
    isExporting,
    error,
    // Actions
    fetchTimeSummary,
    fetchActiveEntry,
    fetchTimeEntries,
    startWork,
    stopWork,
    exportTimeEntries,
    clearError,
    $reset,
  }
})
