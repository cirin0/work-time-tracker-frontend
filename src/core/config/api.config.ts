export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  me: '/me',
  users: {
    index: '/users',
    show: (id: number | string) => `/users/${id}`,
    update: (id: number | string) => `/users/${id}`,
    delete: (id: number | string) => `/users/${id}`,
    updateAvatar: (id: number | string) => `/users/avatar/${id}`,
    updateRole: (id: number | string) => `/users/role/${id}`,
    getWorkSchedule: (id: number | string) => `/users/work-schedule/${id}`,
    updateWorkSchedule: (id: number | string) => `/users/work-schedule/${id}`,
  },
  messages: {
    index: (receiverId: number | string) => `/messages/${receiverId}`,
    store: '/messages',
  },
  companies: {
    showById: (id: number) => `/companies/${id}`,
    showByName: (name: string) => `/companies/name/${name}`,
    update: (id: number) => `/companies/${id}`,
    delete: (id: number) => `/companies/${id}`,
  },
  leaveRequests: {
    index: '/leave-requests',
    store: '/leave-requests',
    manager: {
      addEmployeeToCompany: (id: number) => `/companies/${id}/add-employee`,
      deleteEmployeeFromCompany: (id: number) => `/companies/${id}/remove-employee`,
      deleteEmployeeFromCompanyById: (id: number, employee_id: number) =>
        `/companies/${id}/remove-employee/${employee_id}`,
    },
  },
  workSchedule: {
    index: '/work-schedules',
    store: '/work-schedules',
    show: (id: number) => `/work-schedules/${id}`,
    update: (id: number) => `/work-schedules/${id}`,
    delete: (id: number) => `/work-schedules/${id}`,
  },
  timeEntries: {
    start: '/clock-in',
    stop: '/clock-out',
    index: '/time-entries',
    summaryByCurrentUser: '/me/time-summary',
  },
} as const
