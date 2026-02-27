export interface CreateCompanyRequest {
  name: string
  email?: string | null
  phone?: string | null
  description?: string | null
  address?: string | null
  manager_id?: number | null
  latitude?: number | null
  longitude?: number | null
  radius_meters?: number | null
}

export interface UpdateCompanyRequest {
  name?: string
  email?: string | null
  phone?: string | null
  description?: string | null
  address?: string | null
  manager_id?: number | null
  latitude?: number | null
  longitude?: number | null
  radius_meters?: number | null
}
