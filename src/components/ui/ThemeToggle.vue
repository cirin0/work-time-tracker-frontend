<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)
</script>

<template>
  <button
    @click="toggleDark()"
    class="theme-toggle"
    :title="isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'"
    aria-label="Переключити тему"
  >
    <!-- Sun Icon (shown in dark mode) -->
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <!-- Moon Icon (shown in light mode) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid rgba(255, 155, 81, 0.3);
  border-radius: 0.5rem;
  color: var(--header-nav-text);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.theme-toggle:hover {
  background: rgba(255, 155, 81, 0.1);
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.theme-toggle svg {
  display: block;
}

@media (max-width: 768px) {
  .theme-toggle {
    width: 100%;
    height: 44px;
    margin-bottom: 0.5rem;
  }
}
</style>
