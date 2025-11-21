<script setup lang="ts">
import type { User } from '@/features/profile/lib/user.interface'
import { computed } from 'vue'
import { getAvatarUrl } from '@/utils/url'

const props = defineProps<{
  selectedUser: User | null
}>()

const avatarUrl = computed(() =>
  props.selectedUser?.avatar ? getAvatarUrl(props.selectedUser.avatar) : null,
)

const chatTitle = computed(() => {
  return props.selectedUser ? props.selectedUser.name : 'Виберіть користувача'
})
</script>

<template>
  <div class="chat-header">
    <div v-if="selectedUser" class="chat-user-info">
      <div class="chat-avatar">
        <img :src="avatarUrl!" alt="User Avatar" v-if="avatarUrl" />
        <div v-else>{{ selectedUser.name.charAt(0).toUpperCase() }}</div>
      </div>
      <div>
        <div class="chat-user-name">{{ selectedUser.name }}</div>
        <div class="chat-user-email">{{ selectedUser.email }}</div>
      </div>
    </div>
    <h2 v-else>{{ chatTitle }}</h2>
  </div>
</template>

<style scoped>
.chat-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.chat-user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.125rem;
}

.chat-user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #6b7280;
}
</style>
