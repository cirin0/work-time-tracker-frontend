import { computed, ref } from 'vue'
import { fetchCurrentUser } from '@/features/auth/api/auth.api'
import { fetchMessages, sendMessageRequest } from '../api/chat.api'
import { useChatStore } from '@/features/chat/model/chat.store'
import type { Message, SendMessageRequest } from './message.interface'
import type { User } from '@/features/profile/lib/user.interface'
import { fetchUsers } from '@/features/profile/api/profile.api'

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
      const data = await fetchCurrentUser()
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
      const fetchedUsers = await fetchUsers()
      users.value = fetchedUsers.filter((u) => u.id !== currentUser.value?.id)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      isLoadingUsers.value = false
    }
  }

  async function loadMessages(receiverId: number) {
    isLoading.value = true

    try {
      const data = await fetchMessages(receiverId)
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

      const data = await sendMessageRequest(payload)
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
