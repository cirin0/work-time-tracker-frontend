import type { BaseModel } from './base.model'
import type { UserBasic } from './userBasic.interface'

export interface Company extends BaseModel {
  name: string
  manager: UserBasic
  email: string | null
  phone: string | null
  address: string | null
  description: string | null
  logo: string | null
  latitude: string | null
  longitude: string | null
  radius_meters: number | null
  employees?: UserBasic[]
  employee_count?: number
}
