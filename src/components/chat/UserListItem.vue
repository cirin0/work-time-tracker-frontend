<script setup lang="ts">
import type { User } from '@/types/interfaces/user.interface'
import { computed } from 'vue'
import { getAvatarUrl } from '@/utils/url'

const props = defineProps<{
  user: User
  isActive: boolean
  unreadCount?: number
}>()

defineEmits<{
  select: []
}>()

const avatarUrl = computed(() => getAvatarUrl(props.user.avatar))
</script>

<template>
  <div
    class="user-item"
    :class="{ active: isActive, 'has-unread': unreadCount && unreadCount > 0 }"
    @click="$emit('select')"
  >
    <div class="user-avatar">
      <img :src="avatarUrl!" alt="User Avatar" v-if="avatarUrl" />
      <div v-else>{{ user.name.charAt(0).toUpperCase() }}</div>
    </div>
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
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.user-item.has-unread {
  background-color: #fef3c7;
  border-left: 3px solid #f59e0b;
}

.user-item.has-unread .user-name {
  font-weight: 600;
}

.user-item:hover {
  background-color: #f3f4f6;
}

.user-item.has-unread:hover {
  background-color: #fde68a;
}

.user-item.active {
  background-color: #eff6ff;
  border-left: 3px solid #2563eb;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
}
</style>
