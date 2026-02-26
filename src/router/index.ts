import { useAuthStore } from '@/stores/auth.store'
import { createRouter, createWebHistory } from 'vue-router'
import { UserRole } from '@/types/enums/enums.types'

export const router = createRouter({
  routes: [
    {
      path: '/:pathMath(.*)*',
      name: 'NotFound',
      component: () => import('../views/NonFoundView.vue'),
    },
    {
      path: '/',
      name: 'main',
      component: () => import('../views/IndexView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/chat/ChatView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/leave-requests',
      name: 'leave-requests',
      component: () => import('../views/LeaveRequestsView.vue'),
      meta: { layout: 'main', requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminView.vue'),
      meta: {
        layout: 'main',
        requiresAuth: true,
        roles: [UserRole.ADMIN],
      },
    },
    {
      path: '/manager',
      name: 'manager',
      component: () => import('../views/manager/ManagerView.vue'),
      meta: {
        layout: 'main',
        requiresAuth: true,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    },
    {
      path: '/manager/leave-requests',
      name: 'manager-leave-requests',
      component: () => import('../views/manager/ManagerLeaveRequestsView.vue'),
      meta: {
        layout: 'main',
        requiresAuth: true,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    },
    {
      path: '/manager/employee/:id',
      name: 'employee-details',
      component: () => import('../views/employee/EmployeeDetailsView.vue'),
      meta: {
        layout: 'main',
        requiresAuth: true,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    },
    {
      path: '/manager/work-schedules',
      name: 'work-schedules',
      component: () => import('../views/WorkSchedulesView.vue'),
      meta: {
        layout: 'main',
        requiresAuth: true,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    },
    {
      path: '/manager/employees',
      name: 'manager-employees',
      component: () => import('../views/employee/EmployeesView.vue'),
      meta: {
        layout: 'main',
        requiresAuth: true,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    },
    {
      path: '/manager/statistics',
      name: 'manager-statistics',
      component: () => import('../views/manager/CompanyStatisticsView.vue'),
      meta: {
        layout: 'main',
        requiresAuth: true,
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    },
    {
      path: '/role-examples',
      name: 'role-examples',
      component: () => import('../views/RoleExampleView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/auth/AuthView.vue'),
      meta: { requiresAuth: false },
    },
  ],
  history: createWebHistory(),
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (authStore.isAuthenticated && to.name === 'auth') {
    return { name: 'main' }
  }

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      return { name: 'auth' }
    }

    if (!authStore.currentUser) {
      try {
        await authStore.getCurrentUser()
      } catch (error) {
        console.error('Failed to load user:', error)
        authStore.clearToken()
        return { name: 'auth' }
      }
    }

    const requiredRoles = to.meta.roles as UserRole[] | undefined
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = authStore.currentUser?.role
      if (!userRole || !requiredRoles.includes(userRole)) {
        console.warn(
          `Access denied. Required roles: ${requiredRoles.join(', ')}, user role: ${userRole}`,
        )
        return { name: 'main' }
      }
    }
  }
})
