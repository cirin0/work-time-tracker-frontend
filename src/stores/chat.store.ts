import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UnreadMessages {
  [userId: number]: number
}

interface LastActivity {
  [userId: number]: number
}

export const useChatStore = defineStore('chat', () => {
  const unreadMessages = ref<UnreadMessages>({})
  const lastActivity = ref<LastActivity>({})

  const totalUnread = computed(() => {
    return Object.values(unreadMessages.value).reduce((sum, count) => sum + count, 0)
  })

  function incrementUnread(userId: number) {
    if (!unreadMessages.value[userId]) {
      unreadMessages.value[userId] = 0
    }
    unreadMessages.value[userId]++
    updateLastActivity(userId)
  }

  function clearUnread(userId: number) {
    unreadMessages.value[userId] = 0
  }

  function getUnreadCount(userId: number): number {
    return unreadMessages.value[userId] || 0
  }

  function updateLastActivity(userId: number) {
    lastActivity.value[userId] = Date.now()
  }

  function getLastActivity(userId: number): number {
    return lastActivity.value[userId] || 0
  }

  function resetAll() {
    unreadMessages.value = {}
    lastActivity.value = {}
  }

  return {
    unreadMessages,
    lastActivity,
    totalUnread,
    incrementUnread,
    clearUnread,
    getUnreadCount,
    updateLastActivity,
    getLastActivity,
    resetAll,
  }
})
