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

type CompanyEmployeesPayload = Company['employees'] | Record<string, User>

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

  function normalizeEmployees(
    employees: CompanyEmployeesPayload | undefined,
  ): Company['employees'] {
    if (!employees) return []
    if (Array.isArray(employees)) return employees
    return Object.values(employees)
  }

  function setCompanyFromResponse(data: Company | undefined) {
    if (data) {
      company.value = {
        ...data,
        employees: normalizeEmployees(data.employees as CompanyEmployeesPayload | undefined),
      }
    }
    return data
  }

  async function fetchCompany() {
    return withLoading(async () => {
      const { data } = await apiClient.get<Company>(API_ROUTES.company.show)
      setCompanyFromResponse(data)
    }, 'Помилка завантаження компанії')
  }

  async function createCompany(payload: CreateCompanyRequest) {
    return request(async () => {
      const { data } = await apiClient.post<ApiResponse<Company>>(
        API_ROUTES.admin.company.store,
        payload,
      )
      setCompanyFromResponse(data.data)
      return data.data
    }, 'Помилка створення компанії')
  }

  async function updateCompany(payload: UpdateCompanyRequest) {
    return request(async () => {
      const { data } = await apiClient.patch<ApiResponse<Company>>(
        API_ROUTES.admin.company.update,
        payload,
      )
      return setCompanyFromResponse(data.data)
    }, 'Помилка оновлення компанії')
  }

  async function updateCompanyLogo(formData: FormData) {
    return request(async () => {
      const { data } = await apiClient.post<ApiResponse<Company>>(
        API_ROUTES.admin.company.updateLogo,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return setCompanyFromResponse(data.data)
    }, 'Помилка оновлення логотипу')
  }

  async function assignManager(managerId: number | string) {
    return request(async () => {
      const { data } = await apiClient.post<ApiResponse<Company>>(
        API_ROUTES.admin.company.assignManager,
        { manager_id: managerId },
      )
      return setCompanyFromResponse(data.data)
    }, 'Помилка призначення менеджера')
  }

  async function addEmployee(employee_id: number | string) {
    return request(async () => {
      await apiClient.post(API_ROUTES.admin.company.addEmployee, {
        employee_id: employee_id,
      })
      await fetchCompany()
    }, 'Помилка додавання співробітника')
  }

  async function removeEmployee(employee_id: number | string) {
    return request(async () => {
      await apiClient.delete(API_ROUTES.admin.company.removeEmployee, {
        data: { employee_id },
      })
      await fetchCompany()
    }, 'Помилка видалення співробітника')
  }

  async function deleteCompany() {
    return request(async () => {
      await apiClient.delete(API_ROUTES.admin.company.delete)
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
    fetchCompany,
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
