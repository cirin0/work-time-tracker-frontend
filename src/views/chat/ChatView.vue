<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
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
  ensureUnreadUsersVisible,
  selectUser,
  sendMessage,
  handleIncomingMessage,
} = useChatLogic(currentUser)

const chatAreaRef = ref<InstanceType<typeof ChatArea> | null>(null)
const showMobileSidebar = ref(true)
const isMobileLayout = useMediaQuery('(max-width: 900px)')
const shouldShowSidebar = computed(() => !isMobileLayout.value || showMobileSidebar.value)
const shouldShowChatArea = computed(
  () => !isMobileLayout.value || !showMobileSidebar.value || Boolean(selectedUser.value),
)
const shouldShowBackButton = computed(
  () => isMobileLayout.value && Boolean(selectedUser.value) && !showMobileSidebar.value,
)

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
  const isInitialUsersLoaded = await loadUsers()

  if (isInitialUsersLoaded) {
    await ensureUnreadUsersVisible()
  }
})

async function handleSelectUser(user: typeof selectedUser.value) {
  await selectUser(user!)
  if (isMobileLayout.value) {
    showMobileSidebar.value = false
  }

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

function backToUserList() {
  showMobileSidebar.value = true
}
</script>

<template>
  <div class="chat-container">
    <ChatSidebar
      v-show="shouldShowSidebar"
      :users="sortedUsers"
      :selected-user-id="selectedUser?.id ?? null"
      :is-loading-users="isLoadingUsers"
      :has-more-users="hasMoreUsers"
      @select-user="handleSelectUser"
      @load-more="loadMoreUsers"
      class="chat-sidebar-wrapper"
    />

    <div v-show="shouldShowChatArea" class="chat-area-wrapper">
      <button v-if="shouldShowBackButton" @click="backToUserList" class="back-button">
        ← Назад до списку
      </button>
      <ChatArea
        ref="chatAreaRef"
        :selected-user="selectedUser"
        :messages="messages"
        :current-user-id="currentUser?.id ?? 0"
        :is-loading="isLoading"
        @send-message="handleSendMessage"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  background: var(--surface);
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  margin-bottom: 0.5rem;
}

.chat-sidebar-wrapper {
  flex-shrink: 0;
}

.chat-area-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.back-button {
  display: none;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--accent-2);
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  text-align: left;
}

.back-button:hover {
  background: var(--sand-light);
}

@media (max-width: var(--bp-lg)) {
  .chat-container {
    height: calc(100vh - 6rem);
  }

  .chat-sidebar-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: var(--surface);
  }

  .chat-area-wrapper {
    width: 100%;
  }

  .back-button {
    display: block;
  }
}

@media (max-width: var(--bp-sm)) {
  .chat-container {
    border-radius: 0.5rem;
    height: calc(100vh - 5rem);
  }

  .back-button {
    padding: 1rem;
    font-size: 0.9375rem;
  }
}
</style>
