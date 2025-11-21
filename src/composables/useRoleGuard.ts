import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/enums/enums.types'

export function useRoleGuard() {
  const authStore = useAuthStore()

  const currentUser = computed(() => authStore.currentUser)
  const userRole = computed(() => currentUser.value?.role)

  const isAdmin = computed(() => userRole.value === UserRole.ADMIN)
  const isManager = computed(() => userRole.value === UserRole.MANAGER)
  const isEmployee = computed(() => userRole.value === UserRole.EMPLOYEE)

  function hasRole(role: UserRole): boolean {
    return userRole.value === role
  }

  function hasAnyRole(roles: UserRole[]): boolean {
    return userRole.value ? roles.includes(userRole.value) : false
  }

  /**
   * Перевірка, чи може користувач редагувати іншого користувача
   * Адмін може редагувати всіх
   * Менеджер може редагувати своїх підлеглих
   * Співробітник може редагувати тільки себе
   */
  function canEditUser(userId: number): boolean {
    if (!currentUser.value) return false

    if (isAdmin.value) return true

    if (isManager.value) {
      // Тут можна додати логіку перевірки, чи є користувач підлеглим
      // Наприклад: return user.manager_id === currentUser.value.id
      return true // Спрощена версія
    }

    return currentUser.value.id === userId
  }

  return {
    currentUser,
    userRole,
    isAdmin,
    isManager,
    isEmployee,
    hasRole,
    hasAnyRole,
    canEditUser,
  }
}
