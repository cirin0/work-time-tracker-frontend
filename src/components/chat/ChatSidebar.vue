<script setup lang="ts">
import { ref, watch } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import type { User } from '@/types/interfaces/user.interface'
import UserListItem from './UserListItem.vue'
import { useChatStore } from '@/stores/chat.store'

const props = defineProps<{
  users: User[]
  selectedUserId: number | null
  isLoadingUsers: boolean
  hasMoreUsers: boolean
}>()

const emit = defineEmits<{
  selectUser: [user: User]
  loadMore: []
}>()

const chatStore = useChatStore()
const usersListRef = ref<HTMLElement | null>(null)
const canLoadMore = ref(false)

watch(
  () => props.users.length,
  (newLength, oldLength) => {
    if (newLength > 0 && oldLength === 0) {
      setTimeout(() => {
        canLoadMore.value = true
      }, 1000)
    }
  },
)

useInfiniteScroll(
  usersListRef,
  () => {
    if (canLoadMore.value && !props.isLoadingUsers && props.hasMoreUsers) {
      emit('loadMore')
    }
  },
  {
    distance: 50,
    interval: 1000,
  },
)
</script>

<template>
  <div class="users-sidebar">
    <div class="sidebar-header">
      <h2>Користувачі</h2>
    </div>
    <div ref="usersListRef" class="users-list">
      <div v-if="isLoadingUsers && users.length === 0" class="loading-state">Завантаження...</div>
      <UserListItem
        v-for="user in users"
        :key="user.id"
        :user="user"
        :is-active="selectedUserId === user.id"
        :unread-count="chatStore.getUnreadCount(user.id)"
        @select="emit('selectUser', user)"
      />
      <div v-if="isLoadingUsers && users.length > 0" class="loading-more">
        Завантаження більше...
      </div>
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
  min-height: 0;
}

.loading-state {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.3rem;
}

.loading-more {
  padding: 1rem 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
