import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/types/enums/enums.types'

export async function roleGuardMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()
  const requiredRoles = to.meta.roles as UserRole[] | undefined

  // Якщо роль не вказана, дозволяємо доступ
  if (!requiredRoles || requiredRoles.length === 0) {
    return next()
  }

  // Завантажуємо користувача, якщо ще не завантажено
  if (!authStore.currentUser) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      console.error('Failed to load user:', error)
      authStore.clearToken()
      return next({ name: 'auth' })
    }
  }

  const userRole = authStore.currentUser?.role

  // Перевіряємо, чи має користувач необхідну роль
  if (userRole && requiredRoles.includes(userRole)) {
    return next()
  }

  // Якщо немає доступу, перенаправляємо на головну сторінку
  console.warn(`Access denied. Required roles: ${requiredRoles.join(', ')}, user role: ${userRole}`)
  return next({ name: 'main' })
}
