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
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.toggle-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background-color: var(--sand-light);
  color: var(--text);
  border: 1.5px solid var(--border);
  cursor: pointer;
}

.toggle-button:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.toggle-button.active {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border-color: var(--accent-2);
  box-shadow: 0 2px 8px var(--shadow);
}

@media (max-width: 640px) {
  .toggle-button {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
  }
}
</style>
