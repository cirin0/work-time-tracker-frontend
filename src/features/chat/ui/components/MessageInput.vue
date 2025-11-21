<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  send: [message: string]
}>()

const newMessage = ref('')

function handleSend() {
  if (!newMessage.value.trim()) return

  emit('send', newMessage.value.trim())
  newMessage.value = ''
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSend()
  }
}
</script>

<template>
  <div class="message-input-container">
    <input
      v-model="newMessage"
      @keyup="handleKeyUp"
      type="text"
      placeholder="Введіть повідомлення..."
      class="message-input"
    />
    <button @click="handleSend" class="send-button" :disabled="!newMessage.trim()">
      Відправити
    </button>
  </div>
</template>

<style scoped>
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
