export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  me: {
    show: '/me',
    update: '/me',
    updateAvatar: '/me/avatar',
  },
  users: {
    index: '/users',
    show: (id: number | string) => `/users/${id}`,
    update: (id: number | string) => `/users/${id}`,
    delete: (id: number | string) => `/users/${id}`,
    updateAvatar: (id: number | string) => `/users/${id}/avatar`,
    updateRole: (id: number | string) => `/users/${id}/role`,
    getWorkSchedule: (id: number | string) => `/users/${id}/work-schedule`,
    updateWorkSchedule: (id: number | string) => `/users/${id}/work-schedule`,
  },
  messages: {
    index: (receiverId: number | string) => `/messages/${receiverId}`,
    store: '/messages',
  },
  companies: {
    index: '/companies',
    store: '/companies',
    showById: (id: number) => `/companies/${id}`,
    showByName: (name: string) => `/companies/name/${name}`,
    update: (id: number) => `/companies/${id}`,
    delete: (id: number) => `/companies/${id}`,
  },
  leaveRequests: {
    index: '/leave-requests',
    store: '/leave-requests',
    show: (id: number | string) => `/leave-requests/${id}`,
  },
  manager: {
    companies: {
      addEmployee: (companyId: number) => `/manager/companies/${companyId}/add-employee`,
      removeEmployee: (companyId: number) => `/manager/companies/${companyId}/remove-employee`,
      removeEmployeeById: (companyId: number, employeeId: number) =>
        `/manager/companies/${companyId}/remove-employee/${employeeId}`,
    },
    leaveRequests: {
      index: '/manager/leave-requests',
      approve: (leaveRequestId: number) => `/manager/leave-requests/${leaveRequestId}/approve`,
      reject: (leaveRequestId: number) => `/manager/leave-requests/${leaveRequestId}/reject`,
    },
  },
  workSchedules: {
    index: '/work-schedules',
    store: '/work-schedules',
    show: (id: number | string) => `/work-schedules/${id}`,
    update: (id: number | string) => `/work-schedules/${id}`,
    delete: (id: number | string) => `/work-schedules/${id}`,
  },
  timeEntries: {
    index: '/time-entries',
    store: '/time-entries',
    show: (id: number | string) => `/time-entries/${id}`,
    delete: (id: number | string) => `/time-entries/${id}`,
    active: '/time-entries/active',
    stopActive: '/time-entries/active/stop',
    summaryByCurrentUser: '/time-entries/summary/me',
  },
} as const
