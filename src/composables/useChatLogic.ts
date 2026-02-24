import { ref, computed, type ComputedRef } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import type { User } from '@/types/interfaces/user.interface'
import type { Message, SendMessageRequest } from '@/types/interfaces/message.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import { useChatStore } from '@/stores/chat.store'

export function useChatLogic(currentUser: ComputedRef<User | null>) {
  const chatStore = useChatStore()
  const users = ref<User[]>([])
  const messages = ref<Message[]>([])
  const selectedUser = ref<User | null>(null)
  const isLoading = ref(false)
  const isLoadingUsers = ref(false)
  const currentPage = ref(1)
  const hasMoreUsers = ref(true)

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

  async function loadUsers() {
    isLoadingUsers.value = true
    try {
      const { data } = await apiClient.get<PaginatedResponse<User>>(API_ROUTES.users.index, {
        params: {
          page: currentPage.value,
          per_page: 10,
        },
      })

      const newUsers = data.data.filter((u) => u.id !== currentUser.value?.id)

      users.value = [...users.value, ...newUsers]
      hasMoreUsers.value = data.meta.current_page < data.meta.last_page
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      isLoadingUsers.value = false
    }
  }

  async function loadMoreUsers() {
    if (isLoadingUsers.value || !hasMoreUsers.value) {
      return
    }

    currentPage.value++
    await loadUsers()
  }

  function resetUsers() {
    users.value = []
    currentPage.value = 1
    hasMoreUsers.value = true
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
    isLoading,
    isLoadingUsers,
    sortedUsers,
    hasMoreUsers,
    loadUsers,
    loadMoreUsers,
    resetUsers,
    loadMessages,
    selectUser,
    sendMessage,
    handleIncomingMessage,
  }
}
