<script setup lang="ts">
const props = defineProps<{
  isLogin: boolean
}>()

const emit = defineEmits(['toggle'])

const buttonClass = (isLoginButton: boolean) => {
  return props.isLogin === isLoginButton ? 'active' : ''
}
</script>

<template>
  <div class="toggle-container">
    <button @click="emit('toggle', true)" class="toggle-button" :class="buttonClass(true)">
      Login
    </button>
    <button @click="emit('toggle', false)" class="toggle-button" :class="buttonClass(false)">
      Register
    </button>
  </div>
</template>

<style scoped>
.toggle-container {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.toggle-button {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid;
}

button:hover {
  background-color: #e5e7eb;
}

button.active {
  background: linear-gradient(to right, #2563eb, #9333ea);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
