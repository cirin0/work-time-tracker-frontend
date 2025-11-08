<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '@/types/interfaces/message.interface'
import MessageItem from './MessageItem.vue'

const props = defineProps<{
  messages: Message[]
  currentUserId: number
  isLoading: boolean
}>()

const messagesContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })
  },
)

defineExpose({
  scrollToBottom,
})
</script>

<template>
  <div class="messages-container" ref="messagesContainer">
    <div v-if="isLoading" class="loading">Завантаження...</div>
    <div v-else-if="messages.length === 0" class="no-messages">Почніть розмову</div>
    <MessageItem
      v-else
      v-for="message in messages"
      :key="message.id"
      :message="message"
      :current-user-id="currentUserId"
    />
  </div>
</template>

<style scoped>
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
</style>
