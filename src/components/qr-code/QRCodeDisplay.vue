<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import QRCode from 'qrcode'
import { apiClient, API_ROUTES } from '@/core/api'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'
import { formatDate } from '@/core/utils/date'
import Card from '@/components/ui/Card.vue'
import ButtonMain from '@/components/ui/ButtonMain.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

interface QRCodeData {
  qr_data: string
  expires_at: string
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const qrData = ref<string>('')
const expiresAt = ref<string>('')
const isLoading = ref(false)
const error = ref<string>('')
const refreshInterval = ref<number | null>(null)
const isCollapsed = ref(true)

async function renderQRCode() {
  if (!qrData.value || !canvasRef.value) return

  await nextTick()

  try {
    await QRCode.toCanvas(canvasRef.value, qrData.value, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
    })
  } catch (err) {
    console.error('Failed to render QR code:', err)
  }
}

async function fetchQRCode() {
  isLoading.value = true
  error.value = ''

  try {
    const { data } = await apiClient.get<ApiResponse<QRCodeData>>(API_ROUTES.qrCode.daily)

    if (data.data) {
      qrData.value = data.data.qr_data
      expiresAt.value = data.data.expires_at
      await renderQRCode()
    }
  } catch (err: unknown) {
    console.error('Failed to fetch QR code:', err)
    error.value =
      (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Помилка при завантаженні QR-коду'
  } finally {
    isLoading.value = false
  }
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function setupAutoRefresh() {
  refreshInterval.value = window.setInterval(
    () => {
      fetchQRCode()
    },
    60 * 60 * 1000,
  )
}

watch(isCollapsed, async (newValue) => {
  if (!newValue && qrData.value) {
    await nextTick()
    setTimeout(() => {
      renderQRCode()
    }, 10)
  }
})

onMounted(() => {
  fetchQRCode()
  setupAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<template>
  <Card no-padding>
    <template #header>
      <h3 class="card-title">QR-код для відмітки часу</h3>
      <div class="header-actions">
        <ButtonMain
          v-if="!isCollapsed"
          @click="fetchQRCode"
          :disabled="isLoading"
          class="btn-refresh"
        >
          {{ isLoading ? 'Завантаження...' : 'Оновити' }}
        </ButtonMain>
        <button
          @click="toggleCollapse"
          class="btn-toggle"
          :title="isCollapsed ? 'Показати' : 'Сховати'"
        >
          {{ isCollapsed ? '▼' : '▲' }}
        </button>
      </div>
    </template>

    <div v-if="error && !isCollapsed" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!isCollapsed" class="qr-content">
      <div class="qr-canvas-wrapper">
        <LoadingSpinner v-if="isLoading" text="Завантаження QR-коду..." />
        <canvas ref="canvasRef" v-show="!isLoading"></canvas>
      </div>

      <div v-if="expiresAt && !isLoading" class="qr-info">
        <p class="validity-info"><strong>Валідний до:</strong> {{ formatDate(expiresAt) }}</p>
        <p class="usage-info">
          Співробітники можуть використовувати цей QR-код для відмітки робочого часу
        </p>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.card-title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-refresh {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-toggle {
  padding: 0.5rem 0.75rem;
  background: var(--sand-light);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle:hover {
  background: var(--surface-hover);
  border-color: var(--accent-2);
}

.error-message {
  padding: 0.75rem 1rem;
  background: var(--error-bg);
  color: var(--error-text);
  border-radius: 0.5rem;
  border-left: 4px solid var(--error-border);
  font-family: var(--font-body);
  margin-bottom: 1rem;
}

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  border-radius: 0.5rem;
  padding: 1rem;
  width: 100%;
}

canvas {
  display: block;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px var(--shadow);
  background: var(--surface);
  width: 300px;
  height: 300px;
}

.qr-info {
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.validity-info {
  margin: 0 0 0.75rem;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--text);
}

.validity-info strong {
  font-family: var(--font-mono);
  color: var(--accent-2);
  font-weight: 600;
}

.usage-info {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .card-title {
    font-size: 1.125rem;
  }

  .qr-canvas-wrapper {
    min-height: 250px;
  }

  canvas {
    width: 250px;
    height: 250px;
  }

  .header-actions {
    gap: 0.25rem;
  }

  .btn-refresh {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .btn-toggle {
    padding: 0.5rem;
  }
}
</style>
