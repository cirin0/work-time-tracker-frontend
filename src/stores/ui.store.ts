import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const activeRequests = ref(0)
  const loadingMessage = ref<string | null>(null)
  const meEndpointLoading = ref(false)

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
    meEndpointLoading.value = false
  }

  async function lockMeEndpoint<T>(fn: () => Promise<T>): Promise<T> {
    while (meEndpointLoading.value) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    meEndpointLoading.value = true
    try {
      return await fn()
    } finally {
      meEndpointLoading.value = false
    }
  }

  return {
    activeRequests,
    isLoading,
    loadingMessage,
    meEndpointLoading,
    startLoading,
    stopLoading,
    resetLoading,
    lockMeEndpoint,
  }
})
