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
  background: #fef2f2;
}

.error-content {
  max-width: 600px;
  width: 100%;
  background: white;
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
  color: #dc2626;
  margin-bottom: 0.75rem;
}

.error-message {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.error-details {
  margin: 1.5rem 0;
  text-align: left;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.error-details summary:hover {
  color: #1f2937;
}

.error-stack,
.error-info {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #1f2937;
  color: #f3f4f6;
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
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
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
