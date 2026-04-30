export interface UpdateProfileRequest {
  name?: string
}

export interface RequestEmailChangeRequest {
  new_email: string
}

export interface VerifyEmailChangeRequest {
  new_email: string
  code: string
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
