<template>
  <button class="button">
    <slot />
  </button>
</template>
<style scoped>
.button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.button:hover {
  transform: scale(1.02);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>
