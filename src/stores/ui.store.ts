import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const activeRequests = ref(0)
  const loadingMessage = ref<string | null>(null)

  const isLoading = computed(() => activeRequests.value > 0)

  function startLoading(message?: string) {
    activeRequests.value++
    if (message) {
      loadingMessage.value = message
    }
  }

  function stopLoading() {
    if (activeRequests.value > 0) {
      activeRequests.value--
    }
    if (activeRequests.value === 0) {
      loadingMessage.value = null
    }
  }

  function resetLoading() {
    activeRequests.value = 0
    loadingMessage.value = null
  }

  return {
    activeRequests,
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    resetLoading,
  }
})
