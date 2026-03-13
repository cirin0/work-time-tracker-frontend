export interface UpdateProfileRequest {
  name?: string
  email?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  code: string
  new_password_confirmation: string
}

export interface SetupPinCodeRequest {
  pin_code: string
}

export interface ChangePinCodeRequest {
  current_pin_code: string
  new_pin_code: string
}
