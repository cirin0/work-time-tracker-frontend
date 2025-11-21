export const PROFILE_ROUTES = {
  index: '/users',
  show: (id: number | string) => `/users/${id}`,
  me: '/me',
} as const
