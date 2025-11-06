<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { client, API_ROUTES } from '@/config/api'
import type { User } from '@/types/interfaces/user.interface'
import type { Message, SendMessageRequest } from '@/types/interfaces/message.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import type { UserApiResponse } from '@/types/responses/user.api'
import { transformUserFromApi } from '@/types/responses/user.api'
import UserListItem from '@/components/chat/UserListItem.vue'
import MessageItem from '@/components/chat/MessageItem.vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import echo from '@/config/echo'
import { useChatStore } from '@/stores/chat.store'

const chatStore = useChatStore()
const users = ref<User[]>([])
const messages = ref<Message[]>([])
const selectedUser = ref<User | null>(null)
const newMessage = ref('')
const currentUser = ref<User | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)

onMounted(async () => {
  await loadCurrentUser()
  await loadUsers()
})

function handleIncomingMessage(e: {
  message: string
  user: { id: number; name: string; email: string }
}) {
  if (!currentUser.value) return

  const newMsg: Message = {
    id: Date.now(),
    sender_id: e.user.id,
    receiver_id: currentUser.value.id,
    message: e.message,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sender: e.user,
  }

  if (selectedUser.value) {
    const isFromSelectedUser = newMsg.sender_id === selectedUser.value.id
    const isToSelectedUser = newMsg.receiver_id === selectedUser.value.id

    if (isFromSelectedUser || isToSelectedUser) {
      messages.value.push(newMsg)
      // Очищаємо непрочитані якщо користувач активний
      chatStore.clearUnread(newMsg.sender_id)
      nextTick(() => {
        scrollToBottom()
      })
    } else if (newMsg.sender_id !== currentUser.value.id) {
      chatStore.incrementUnread(newMsg.sender_id)
    }
  } else if (newMsg.sender_id !== currentUser.value.id) {
    chatStore.incrementUnread(newMsg.sender_id)
  }
}

async function loadCurrentUser() {
  try {
    const { data } = await client().get<User>(API_ROUTES.me)
    currentUser.value = data

    if (currentUser.value) {
      const channel = echo.private(`chat.${currentUser.value.id}`)

      channel
        .listen(
          '.new-message',
          (e: { message: string; user: { id: number; name: string; email: string } }) => {
            handleIncomingMessage(e)
          },
        )
        .error((error: Error) => {
          console.error('Echo channel error:', error)
        })
    }
  } catch (error) {
    console.error('Failed to load current user:', error)
  }
}

async function loadUsers() {
  try {
    const { data } = await client().get<PaginatedResponse<UserApiResponse>>(API_ROUTES.users.index)
    users.value = data.data.map(transformUserFromApi).filter((u) => u.id !== currentUser.value?.id)
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

async function selectUser(user: User) {
  selectedUser.value = user
  messages.value = []
  chatStore.clearUnread(user.id)
  await loadMessages(user.id)
}

async function loadMessages(receiverId: number) {
  isLoading.value = true

  try {
    const { data } = await client().get<Message[]>(API_ROUTES.messages.index(receiverId))
    messages.value = data
    await nextTick()
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    isLoading.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedUser.value) return

  const messageText = newMessage.value.trim()
  newMessage.value = ''

  try {
    const payload: SendMessageRequest = {
      receiver_id: selectedUser.value.id,
      message: messageText,
    }

    const { data } = await client().post<Message>(API_ROUTES.messages.store, payload)
    messages.value.push(data)

    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
    newMessage.value = messageText
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const chatTitle = computed(() => {
  return selectedUser.value ? selectedUser.value.name : 'Виберіть користувача'
})

onUnmounted(() => {
  if (currentUser.value) {
    echo.leave(`chat.${currentUser.value.id}`)
  }
})
</script>

<template>
  <MainLayout>
    <div class="chat-container">
      <div class="users-sidebar">
        <div class="sidebar-header">
          <h2>Користувачі</h2>
        </div>
        <div class="users-list">
          <UserListItem
            v-for="user in users"
            :key="user.id"
            :user="user"
            :is-active="selectedUser?.id === user.id"
            :unread-count="chatStore.getUnreadCount(user.id)"
            @select="selectUser(user)"
          />
        </div>
      </div>

      <div class="chat-area">
        <div class="chat-header">
          <div v-if="selectedUser" class="chat-user-info">
            <div class="chat-avatar">
              {{ selectedUser.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="chat-user-name">{{ selectedUser.name }}</div>
              <div class="chat-user-email">{{ selectedUser.email }}</div>
            </div>
          </div>
          <h2 v-else>{{ chatTitle }}</h2>
        </div>

        <div v-if="selectedUser" class="messages-container" ref="messagesContainer">
          <div v-if="isLoading" class="loading">Завантаження...</div>
          <div v-else-if="messages.length === 0" class="no-messages">Почніть розмову</div>
          <MessageItem
            v-else
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :current-user-id="currentUser!.id"
          />
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">💬</div>
          <p>Виберіть користувача зі списку, щоб почати чат</p>
        </div>

        <div v-if="selectedUser" class="message-input-container">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Введіть повідомлення..."
            class="message-input"
          />
          <button @click="sendMessage" class="send-button" :disabled="!newMessage.trim()">
            Відправити
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 80px);
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.users-sidebar {
  width: 320px;
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

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

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

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: #f9fafb;
}

.loading,
.no-messages {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.message-input-container {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  background-color: white;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #2563eb;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
