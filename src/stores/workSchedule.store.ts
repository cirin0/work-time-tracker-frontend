import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type {
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
  AssignWorkScheduleRequest,
} from '@/types/requests/workScheduleRequest.interface'

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    return (
      (err as { response?: { data?: { message?: string } } }).response?.data?.message || fallback
    )
  }
  return fallback
}

export const useWorkScheduleStore = defineStore('workSchedule', () => {
  const workSchedules = ref<WorkSchedule[]>([])
  const selectedSchedule = ref<WorkSchedule | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  async function fetchWorkSchedules() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await apiClient.get<WorkSchedule[]>(API_ROUTES.workSchedules.index)
      workSchedules.value = Array.isArray(data) ? data : (data as { data: WorkSchedule[] }).data
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Помилка завантаження розкладів')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchWorkSchedule(id: number) {
    try {
      const { data } = await apiClient.get<WorkSchedule>(API_ROUTES.workSchedules.show(id))
      selectedSchedule.value = data
      return data
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Помилка завантаження розкладу')
      throw err
    }
  }

  async function createWorkSchedule(payload: CreateWorkScheduleRequest): Promise<WorkSchedule> {
    isSaving.value = true
    error.value = null
    try {
      const { data } = await apiClient.post<WorkSchedule>(API_ROUTES.workSchedules.store, payload)
      const schedule = (data as { data?: WorkSchedule }).data ?? data
      workSchedules.value.push(schedule)
      return schedule
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Помилка створення розкладу')
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateWorkSchedule(
    id: number,
    payload: UpdateWorkScheduleRequest,
  ): Promise<WorkSchedule> {
    isSaving.value = true
    error.value = null
    try {
      const { data } = await apiClient.patch<WorkSchedule>(
        API_ROUTES.workSchedules.update(id),
        payload,
      )
      const schedule = (data as { data?: WorkSchedule }).data ?? data
      const idx = workSchedules.value.findIndex((s) => s.id === id)
      if (idx !== -1) workSchedules.value[idx] = schedule
      return schedule
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Помилка оновлення розкладу')
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteWorkSchedule(id: number) {
    error.value = null
    try {
      await apiClient.delete(API_ROUTES.workSchedules.delete(id))
      workSchedules.value = workSchedules.value.filter((s) => s.id !== id)
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Помилка видалення розкладу')
      throw err
    }
  }

  async function assignScheduleToEmployee(userId: number, payload: AssignWorkScheduleRequest) {
    isSaving.value = true
    error.value = null
    try {
      const { data } = await apiClient.patch(
        API_ROUTES.manager.users.updateWorkSchedule(userId),
        payload,
      )
      return data
    } catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Помилка призначення розкладу')
      throw err
    } finally {
      isSaving.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    workSchedules.value = []
    selectedSchedule.value = null
    isLoading.value = false
    isSaving.value = false
    error.value = null
  }

  return {
    workSchedules,
    selectedSchedule,
    isLoading,
    isSaving,
    error,
    fetchWorkSchedules,
    fetchWorkSchedule,
    createWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,
    assignScheduleToEmployee,
    clearError,
    $reset,
  }
})
