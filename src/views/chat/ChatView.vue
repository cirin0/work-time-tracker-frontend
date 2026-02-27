<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import ChatSidebar from '@/components/chat/ChatSidebar.vue'
import ChatArea from '@/components/chat/ChatArea.vue'
import { useChatLogic } from '@/composables/useChatLogic.ts'
import { useChatWebSocket } from '@/composables/useChatWebSocket.ts'
import { useProfileStore } from '@/stores/profile.store.ts'

const profileStore = useProfileStore()

const currentUser = computed(() => profileStore.displayProfile)

const {
  sortedUsers,
  selectedUser,
  messages,
  isLoading,
  isLoadingUsers,
  hasMoreUsers,
  loadUsers,
  loadMoreUsers,
  selectUser,
  sendMessage,
  handleIncomingMessage,
} = useChatLogic(currentUser)

const chatAreaRef = ref<InstanceType<typeof ChatArea> | null>(null)

const { setupWebSocket } = useChatWebSocket(currentUser, (message) => {
  const shouldScroll = handleIncomingMessage(message)
  if (shouldScroll) {
    nextTick(() => {
      chatAreaRef.value?.scrollToBottom()
    })
  }
})

onMounted(async () => {
  setupWebSocket()
  await loadUsers()
})

async function handleSelectUser(user: typeof selectedUser.value) {
  await selectUser(user!)
  nextTick(() => {
    chatAreaRef.value?.scrollToBottom()
  })
}

async function handleSendMessage(messageText: string) {
  await sendMessage(messageText)
  nextTick(() => {
    chatAreaRef.value?.scrollToBottom()
  })
}
</script>

<template>
  <div class="chat-container">
    <ChatSidebar
      :users="sortedUsers"
      :selected-user-id="selectedUser?.id ?? null"
      :is-loading-users="isLoadingUsers"
      :has-more-users="hasMoreUsers"
      @select-user="handleSelectUser"
      @load-more="loadMoreUsers"
    />

    <ChatArea
      ref="chatAreaRef"
      :selected-user="selectedUser"
      :messages="messages"
      :current-user-id="currentUser?.id ?? 0"
      :is-loading="isLoading"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 8rem);
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
