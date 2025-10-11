export interface CreateCompanyRequest {
  name: string
  email?: string
  phone?: string
  logo?: string
  description?: string
  address?: string
  manager_id?: number
}

export interface UpdateCompanyRequest {
  name?: string
  email?: string
  phone?: string
  logo?: string
  description?: string
  address?: string
  manager_id?: number
}
