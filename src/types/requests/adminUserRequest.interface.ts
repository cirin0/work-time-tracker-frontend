export interface AdminUpdateUserRequest {
  name?: string
  email?: string
}

export interface AdminUpdateUserRoleRequest {
  role: 'employee' | 'manager' | 'admin'
}

export interface AdminUpdateWorkModeRequest {
  work_mode: 'remote' | 'office' | 'hybrid'
}

export interface AdminResetPasswordRequest {
  password: string
  password_confirmation: string
}
