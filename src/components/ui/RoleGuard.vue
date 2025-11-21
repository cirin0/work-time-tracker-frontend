<script setup lang="ts">
import { computed } from 'vue'
import { UserRole } from '@/types/enums/enums.types'
import { useRoleGuard } from '@/composables/useRoleGuard'

/**
 * Компонент для умовного відображення контенту на основі ролі користувача
 *
 * Приклади використання:
 *
 * 1. Показати контент тільки адміністраторам:
 *    <RoleGuard :roles="[UserRole.ADMIN]">
 *      <button>Видалити всіх користувачів</button>
 *    </RoleGuard>
 *
 * 2. Показати контент адмінам та менеджерам:
 *    <RoleGuard :roles="[UserRole.ADMIN, UserRole.MANAGER]">
 *      <div>Статистика команди</div>
 *    </RoleGuard>
 *
 * 3. З fallback контентом:
 *    <RoleGuard :roles="[UserRole.ADMIN]">
 *      <template #default>Секретна інформація для адміна</template>
 *      <template #fallback>У вас немає доступу</template>
 *    </RoleGuard>
 */

interface Props {
  roles?: UserRole[]
  requireAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  requireAll: false,
})

const { hasAnyRole } = useRoleGuard()

const hasAccess = computed(() => {
  if (props.roles.length === 0) return true
  return hasAnyRole(props.roles)
})
</script>

<template>
  <div v-if="hasAccess" class="role-guard-content">
    <slot />
  </div>
  <div v-else-if="$slots.fallback" class="role-guard-fallback">
    <slot name="fallback" />
  </div>
</template>

<style scoped>
.role-guard-content {
  display: contents;
}

.role-guard-fallback {
  display: contents;
}
</style>
