import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { Company } from '@/types/interfaces/company.interface'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'
import type { User } from '@/types/interfaces/user.interface'
import type {
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '@/types/requests/companyRequest.interface'

function extractMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    return (err as { response?: { data?: { message?: string } } }).response?.data?.message
  }
  return undefined
}

export const useCompanyStore = defineStore('company', () => {
  const company = ref<Company | null>(null)
  const companyUsers = ref<User[]>([])
  const isLoading = ref(false)
  const isLoadingUsers = ref(false)
  const error = ref<string | null>(null)

  async function withLoading<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
    isLoading.value = true
    error.value = null
    try {
      return await fn()
    } catch (err) {
      error.value = extractMessage(err) ?? fallback
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function request<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
    try {
      return await fn()
    } catch (err) {
      error.value = extractMessage(err) ?? fallback
      throw err
    }
  }

  function setCompanyFromResponse(data: Company | undefined) {
    if (data) company.value = data
    return data
  }

  async function fetchByName(name: string) {
    return withLoading(async () => {
      const { data } = await apiClient.get<Company>(API_ROUTES.companies.showByName(name))
      company.value = data
    }, 'Помилка завантаження компанії')
  }

  async function fetchById(id: number) {
    return withLoading(async () => {
      const { data } = await apiClient.get<Company>(API_ROUTES.companies.showById(id))
      company.value = data
    }, 'Помилка завантаження компанії')
  }

  async function fetchCompanyUsers(id: number | string) {
    isLoadingUsers.value = true
    try {
      const { data } = await apiClient.get<ApiResponse<User[]>>(
        API_ROUTES.admin.companies.getUsersByCompany(id),
      )
      companyUsers.value = data.data ?? []
    } catch (err) {
      error.value = extractMessage(err) ?? 'Помилка завантаження співробітників'
    } finally {
      isLoadingUsers.value = false
    }
  }

  async function createCompany(payload: CreateCompanyRequest) {
    return request(async () => {
      const { data } = await apiClient.post<ApiResponse<Company>>(
        API_ROUTES.admin.companies.store,
        payload,
      )
      return data.data
    }, 'Помилка створення компанії')
  }

  async function updateCompany(id: number | string, payload: UpdateCompanyRequest) {
    return request(async () => {
      const { data } = await apiClient.patch<ApiResponse<Company>>(
        API_ROUTES.admin.companies.update(id),
        payload,
      )
      return setCompanyFromResponse(data.data)
    }, 'Помилка оновлення компанії')
  }

  async function updateCompanyLogo(id: number | string, formData: FormData) {
    return request(async () => {
      const { data } = await apiClient.post<ApiResponse<Company>>(
        API_ROUTES.admin.companies.updateLogo(id),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return setCompanyFromResponse(data.data)
    }, 'Помилка оновлення логотипу')
  }

  async function assignManager(companyId: number | string, managerId: number | string) {
    return request(async () => {
      const { data } = await apiClient.post<ApiResponse<Company>>(
        API_ROUTES.admin.companies.assignManager(companyId),
        { manager_id: managerId },
      )
      return setCompanyFromResponse(data.data)
    }, 'Помилка призначення менеджера')
  }

  async function addEmployee(companyId: number | string, employee_id: number | string) {
    return request(async () => {
      await apiClient.post(API_ROUTES.admin.companies.addEmployee(companyId), {
        employee_id: employee_id,
      })
      await fetchCompanyUsers(companyId)
    }, 'Помилка додавання співробітника')
  }

  async function removeEmployee(companyId: number | string, employee_id: number | string) {
    return request(async () => {
      await apiClient.delete(API_ROUTES.admin.companies.removeEmployee(companyId), {
        data: { employee_id },
      })
      companyUsers.value = companyUsers.value.filter((u) => u.id !== Number(employee_id))
    }, 'Помилка видалення співробітника')
  }

  async function deleteCompany(id: number | string) {
    return request(async () => {
      await apiClient.delete(API_ROUTES.admin.companies.delete(id))
      company.value = null
    }, 'Помилка видалення компанії')
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    company.value = null
    companyUsers.value = []
    isLoading.value = false
    isLoadingUsers.value = false
    error.value = null
  }

  return {
    company,
    companyUsers,
    isLoading,
    isLoadingUsers,
    error,
    fetchByName,
    fetchById,
    fetchCompanyUsers,
    createCompany,
    updateCompany,
    updateCompanyLogo,
    assignManager,
    addEmployee,
    removeEmployee,
    deleteCompany,
    clearError,
    $reset,
  }
})
