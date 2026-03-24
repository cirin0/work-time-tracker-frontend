<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '@/types/interfaces/user.interface'
import type { Message } from '@/types/interfaces/message.interface'
import ChatHeader from './ChatHeader.vue'
import MessagesList from './MessagesList.vue'
import MessageInput from './MessageInput.vue'

defineProps<{
  selectedUser: User | null
  messages: Message[]
  currentUserId: number
  isLoading: boolean
}>()

const emit = defineEmits<{
  sendMessage: [message: string]
}>()

const messagesListRef = ref<InstanceType<typeof MessagesList> | null>(null)

function handleSendMessage(message: string) {
  emit('sendMessage', message)
}

defineExpose({
  scrollToBottom: () => messagesListRef.value?.scrollToBottom(),
})
</script>

<template>
  <div class="chat-area">
    <ChatHeader :selected-user="selectedUser" />

    <MessagesList
      v-if="selectedUser"
      ref="messagesListRef"
      :messages="messages"
      :current-user-id="currentUserId"
      :is-loading="isLoading"
    />

    <div v-else class="empty-state">
      <div class="empty-icon">💬</div>
      <p>Виберіть користувача зі списку, щоб почати чат</p>
    </div>

    <MessageInput v-if="selectedUser" @send="handleSendMessage" />
  </div>
</template>

<style scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-family: var(--font-body);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

@media (max-width: var(--bp-sm)) {
  .empty-state {
    padding: 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state p {
    font-size: 0.9375rem;
    text-align: center;
  }
}
</style>
