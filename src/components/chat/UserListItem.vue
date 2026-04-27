<script setup lang="ts">
import type { User } from '@/types/interfaces/user.interface'
import { computed } from 'vue'
import { getAvatarUrl } from '@/core/utils/url'
import Avatar from '@/components/ui/Avatar.vue'

const props = defineProps<{
  user: User
  isActive: boolean
  unreadCount?: number
}>()

defineEmits<{
  select: []
}>()

const avatarUrl = computed(() => {
  return getAvatarUrl(props.user?.avatar) ?? undefined
})
</script>

<template>
  <div
    class="user-item"
    :class="{ active: isActive, 'has-unread': unreadCount && unreadCount > 0 }"
    @click="$emit('select')"
  >
    <Avatar :src="avatarUrl" :fallback-text="user.name" size="medium" />
    <div class="user-info">
      <div class="user-name">{{ user.name }}</div>
    </div>
    <div v-if="unreadCount && unreadCount > 0" class="unread-badge">
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </div>
  </div>
</template>

<style scoped>
.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.user-item.has-unread {
  background-color: var(--accent-2-alpha-10);
  border-left: 3px solid var(--accent-2);
}

.user-item.has-unread .user-name {
  font-weight: 600;
}

.user-item:hover {
  background-color: var(--sand-light);
}

.user-item.has-unread:hover {
  background-color: var(--accent-2-alpha-15);
}

.user-item.active {
  background-color: var(--sand-light);
  border-left: 3px solid var(--accent-1);
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-family: var(--font-body);
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 0.375rem;
  background: var(--error-text);
  color: var(--surface);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
  font-family: var(--font-mono);
}
</style>
