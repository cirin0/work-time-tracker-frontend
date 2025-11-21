import { ref, computed } from 'vue'
import { apiClient, API_ROUTES } from '@/config/api'
import type { User } from '@/types/interfaces/user.interface'
import type { Message, SendMessageRequest } from '@/types/interfaces/message.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import type { UserApiResponse } from '@/types/responses/user.api'
import { transformUserFromApi } from '@/types/responses/user.api'
import { useChatStore } from '@/stores/chat.store'

export function useChatLogic() {
  const chatStore = useChatStore()
  const users = ref<User[]>([])
  const messages = ref<Message[]>([])
  const selectedUser = ref<User | null>(null)
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const isLoadingUsers = ref(false)

  const sortedUsers = computed(() => {
    return [...users.value].sort((a, b) => {
      const unreadA = chatStore.getUnreadCount(a.id)
      const unreadB = chatStore.getUnreadCount(b.id)
      const activityA = chatStore.getLastActivity(a.id)
      const activityB = chatStore.getLastActivity(b.id)

      if (unreadA > 0 && unreadB === 0) return -1
      if (unreadA === 0 && unreadB > 0) return 1

      return activityB - activityA
    })
  })

  async function loadCurrentUser() {
    try {
      const { data } = await apiClient.get<User>(API_ROUTES.me)
      currentUser.value = data
      return data
    } catch (error) {
      console.error('Failed to load current user:', error)
      throw error
    }
  }

  async function loadUsers() {
    isLoadingUsers.value = true
    try {
      const { data } = await apiClient.get<PaginatedResponse<UserApiResponse>>(
        API_ROUTES.users.index,
      )
      users.value = data.data
        .map(transformUserFromApi)
        .filter((u) => u.id !== currentUser.value?.id)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      isLoadingUsers.value = false
    }
  }

  async function loadMessages(receiverId: number) {
    isLoading.value = true

    try {
      const { data } = await apiClient.get<Message[]>(API_ROUTES.messages.index(receiverId))
      messages.value = data
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function selectUser(user: User) {
    selectedUser.value = user
    messages.value = []
    chatStore.clearUnread(user.id)
    chatStore.updateLastActivity(user.id)
    await loadMessages(user.id)
  }

  async function sendMessage(messageText: string) {
    if (!messageText.trim() || !selectedUser.value) return

    try {
      const payload: SendMessageRequest = {
        receiver_id: selectedUser.value.id,
        message: messageText,
      }

      const { data } = await apiClient.post<Message>(API_ROUTES.messages.store, payload)
      messages.value.push(data)
      chatStore.updateLastActivity(selectedUser.value.id)
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  function handleIncomingMessage(newMsg: Message) {
    if (!currentUser.value) return

    if (selectedUser.value) {
      const isFromSelectedUser = newMsg.sender_id === selectedUser.value.id
      const isToSelectedUser = newMsg.receiver_id === selectedUser.value.id

      if (isFromSelectedUser || isToSelectedUser) {
        messages.value.push(newMsg)
        chatStore.clearUnread(newMsg.sender_id)
        chatStore.updateLastActivity(newMsg.sender_id)
        return true
      } else if (newMsg.sender_id !== currentUser.value.id) {
        chatStore.incrementUnread(newMsg.sender_id)
      }
    } else if (newMsg.sender_id !== currentUser.value.id) {
      chatStore.incrementUnread(newMsg.sender_id)
    }

    return false
  }

  return {
    users,
    messages,
    selectedUser,
    currentUser,
    isLoading,
    isLoadingUsers,
    sortedUsers,
    loadCurrentUser,
    loadUsers,
    loadMessages,
    selectUser,
    sendMessage,
    handleIncomingMessage,
  }
}
