<script setup lang="ts">
import { isProduction } from '@/main'
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)
const errorInfo = ref<string | null>(null)

onErrorCaptured((err, instance, info) => {
  error.value = err
  errorInfo.value = info
  console.error('ErrorBoundary caught error:', err, info)

  return false
})

function reset() {
  error.value = null
  errorInfo.value = null
}

function reload() {
  window.location.reload()
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Щось пішло не так</h2>
      <p class="error-message">
        Вибачте, сталася неочікувана помилка. Спробуйте оновити сторінку або повернутися назад.
      </p>

      <details v-if="!isProduction" class="error-details">
        <summary>Деталі помилки (тільки для розробки)</summary>
        <pre class="error-stack">{{ error.message }}</pre>
        <pre v-if="errorInfo" class="error-info">{{ errorInfo }}</pre>
        <pre v-if="error.stack" class="error-stack">{{ error.stack }}</pre>
      </details>

      <div class="error-actions">
        <button @click="reset" class="btn-secondary">Спробувати ще раз</button>
        <button @click="reload" class="btn-primary">Оновити сторінку</button>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--error-bg);
  padding: 1rem;
}

.error-content {
  max-width: 600px;
  width: 100%;
  background: var(--surface);
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.error-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--error-text);
  margin-bottom: 0.75rem;
}

.error-message {
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.error-details {
  margin: 1.5rem 0;
  text-align: left;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.error-details summary:hover {
  color: var(--text);
}

.error-stack,
.error-info {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--accent-1);
  color: var(--bg);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  color: var(--header-text);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.btn-secondary {
  background: var(--sand-light);
  color: var(--text);
}

.btn-secondary:hover {
  background: var(--border);
}

@media (max-width: var(--bp-sm)) {
  .error-content {
    padding: 1.5rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions button {
    width: 100%;
  }
}
</style>
