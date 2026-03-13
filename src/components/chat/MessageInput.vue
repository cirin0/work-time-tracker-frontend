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
  border-top: 1px solid var(--border);
  display: flex;
  gap: 1rem;
  background-color: var(--surface);
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: var(--font-body);
  background-color: var(--surface);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: var(--accent-2);
}

.message-input::placeholder {
  color: var(--text-muted);
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  background: var(--accent-2-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
}

.send-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .message-input-container {
    padding: 1rem;
    gap: 0.75rem;
  }

  .message-input {
    font-size: 0.9375rem;
  }

  .send-button {
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
  }
}
</style>
