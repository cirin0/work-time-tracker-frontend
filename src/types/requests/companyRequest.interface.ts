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
  lateness_grace_minutes?: number
  overtime_threshold_hours?: number
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
  lateness_grace_minutes?: number
  overtime_threshold_hours?: number
}
