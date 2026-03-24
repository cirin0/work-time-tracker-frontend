<script setup lang="ts">
import type { User } from '@/types/interfaces/user.interface'
import { computed } from 'vue'
import { getAvatarUrl } from '@/core/utils/url'
import Avatar from '@/components/ui/Avatar.vue'

const props = defineProps<{
  selectedUser: User | null
}>()

const avatarUrl = computed(() => {
  return getAvatarUrl(props.selectedUser?.avatar) ?? undefined
})

const chatTitle = computed(() => {
  return props.selectedUser ? props.selectedUser.name : 'Виберіть користувача'
})
</script>

<template>
  <div class="chat-header">
    <div v-if="selectedUser" class="chat-user-info">
      <Avatar :src="avatarUrl" :fallback-text="selectedUser.name" size="medium" />
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
  border-bottom: 1px solid var(--border);
  background-color: var(--surface);
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-user-name {
  font-weight: 600;
  font-family: var(--font-heading);
  color: var(--text);
  font-size: 1.125rem;
}

.chat-user-email {
  font-size: 0.875rem;
  font-family: var(--font-body);
  color: var(--text-muted);
}

.chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  font-family: var(--font-heading);
  color: var(--text-muted);
}

@media (max-width: var(--bp-sm)) {
  .chat-header {
    padding: 1rem;
  }

  .chat-user-name {
    font-size: 1rem;
  }

  .chat-user-email {
    font-size: 0.8125rem;
  }

  .chat-header h2 {
    font-size: 1.125rem;
  }
}
</style>
