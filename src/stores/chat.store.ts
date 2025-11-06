import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UnreadMessages {
  [userId: number]: number
}

export const useChatStore = defineStore('chat', () => {
  const unreadMessages = ref<UnreadMessages>({})

  const totalUnread = computed(() => {
    return Object.values(unreadMessages.value).reduce((sum, count) => sum + count, 0)
  })

  function incrementUnread(userId: number) {
    if (!unreadMessages.value[userId]) {
      unreadMessages.value[userId] = 0
    }
    unreadMessages.value[userId]++
  }

  function clearUnread(userId: number) {
    unreadMessages.value[userId] = 0
  }

  function getUnreadCount(userId: number): number {
    return unreadMessages.value[userId] || 0
  }

  function resetAll() {
    unreadMessages.value = {}
  }

  return {
    unreadMessages,
    totalUnread,
    incrementUnread,
    clearUnread,
    getUnreadCount,
    resetAll,
  }
})
