import type { BaseModel } from './base.model'

export interface AuditLog extends BaseModel {
  id: number
  user_id: number | null
  action: string
  model_type: string | null
  model_id: number | null
  model_name: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface AuditLogFilter {
  action?: string
  model_type?: string
  user_id?: number
  date_from?: string
  date_to?: string
}
