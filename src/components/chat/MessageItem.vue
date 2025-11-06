<script setup lang="ts">
import type { Message } from '@/types/interfaces/message.interface'
import { useDateFormat } from '@vueuse/core'
import { computed } from 'vue'

const props = defineProps<{
  message: Message
  currentUserId: number
}>()

const isOwnMessage = computed(() => props.message.sender_id === props.currentUserId)

const formattedTime = useDateFormat(() => props.message.created_at, 'HH:mm')
</script>

<template>
  <div class="message-wrapper" :class="{ own: isOwnMessage }">
    <div class="message-bubble">
      <div class="message-text">{{ message.message }}</div>
      <div class="message-time">{{ formattedTime }}</div>
    </div>
  </div>
</template>

<style scoped>
.message-wrapper {
  display: flex;
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.own {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background-color: #f3f4f6;
  color: #1f2937;
}

.message-wrapper.own .message-bubble {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message-wrapper:not(.own) .message-bubble {
  border-bottom-left-radius: 0.25rem;
}

.message-text {
  word-wrap: break-word;
  line-height: 1.5;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  text-align: right;
}
</style>
