<template>
  <button class="button">
    <slot />
  </button>
</template>
<style scoped>
.button {
  padding: 0.75rem 1rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px var(--shadow);
  transition: all 0.2s ease;
}

.button:hover {
  background: var(--accent-2-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
}

.button:active {
  transform: translateY(0);
}

.button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: var(--bp-sm)) {
  .button {
    padding: 0.875rem 1rem;
  }
}
</style>
