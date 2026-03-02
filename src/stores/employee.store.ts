import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import type { TimeEntrySummary } from '@/types/interfaces/timeEntrySummary.interface'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'

export const useEmployeeStore = defineStore('employee', () => {
  // Time summary
  const timeSummary = ref<TimeEntrySummary | null>(null)
  const isLoadingSummary = ref(false)

  // Active time entry
  const activeEntry = ref<TimeEntry | null>(null)
  const isLoadingActiveEntry = ref(false)

  // Errors
  const error = ref<string | null>(null)

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

  async function startWork(payload: { entry_type: string; start_comment?: string }) {
    error.value = null
    try {
      const { data } = await apiClient.post<ApiResponse<TimeEntry>>(
        API_ROUTES.timeEntries.store,
        payload,
      )
      if (data.data) {
        activeEntry.value = data.data
      }
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
      await fetchTimeSummary()
      return data.data
    } catch (err: unknown) {
      error.value = extractErrorMessage(err) || 'Помилка зупинки роботи'
      throw err
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    timeSummary.value = null
    activeEntry.value = null
    isLoadingSummary.value = false
    isLoadingActiveEntry.value = false
    error.value = null
  }

  return {
    // State
    timeSummary,
    activeEntry,
    isLoadingSummary,
    isLoadingActiveEntry,
    error,
    // Actions
    fetchTimeSummary,
    fetchActiveEntry,
    startWork,
    stopWork,
    clearError,
    $reset,
  }
})
