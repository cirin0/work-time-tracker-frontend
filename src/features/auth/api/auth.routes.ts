export const AUTH_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/me',
} as const

export const TOKEN_STORE_KEY = 'token-store'
