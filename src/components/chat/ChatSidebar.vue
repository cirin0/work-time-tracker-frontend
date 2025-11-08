<script setup lang="ts">
import type { User } from '@/types/interfaces/user.interface'
import UserListItem from './UserListItem.vue'
import { useChatStore } from '@/stores/chat.store'

defineProps<{
  users: User[]
  selectedUserId: number | null
}>()

const emit = defineEmits<{
  selectUser: [user: User]
}>()

const chatStore = useChatStore()
</script>

<template>
  <div class="users-sidebar">
    <div class="sidebar-header">
      <h2>Користувачі</h2>
    </div>
    <div class="users-list">
      <UserListItem
        v-for="user in users"
        :key="user.id"
        :user="user"
        :is-active="selectedUserId === user.id"
        :unread-count="chatStore.getUnreadCount(user.id)"
        @select="emit('selectUser', user)"
      />
    </div>
  </div>
</template>

<style scoped>
.users-sidebar {
  width: 18rem;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.users-list {
  flex: 1;
  overflow-y: auto;
}
</style>
