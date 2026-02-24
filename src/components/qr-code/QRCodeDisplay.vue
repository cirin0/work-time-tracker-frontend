<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import QRCode from 'qrcode'
import { apiClient, API_ROUTES } from '@/core/api'
import type { ApiResponse } from '@/types/responses/apiResponse.interface'
import { formatDate } from '@/core/utils/date'

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
  <div class="qr-code-container">
    <div class="qr-header">
      <h3>QR-код для відмітки часу</h3>
      <div class="header-actions">
        <button @click="fetchQRCode" class="btn-refresh" :disabled="isLoading" v-if="!isCollapsed">
          {{ isLoading ? 'Завантаження...' : 'Оновити' }}
        </button>
        <button
          @click="toggleCollapse"
          class="btn-toggle"
          :title="isCollapsed ? 'Показати' : 'Сховати'"
        >
          {{ isCollapsed ? '▼' : '▲' }}
        </button>
      </div>
    </div>

    <div v-if="error && !isCollapsed" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="!isCollapsed" class="qr-content">
      <div class="qr-canvas-wrapper">
        <div v-if="isLoading" class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <canvas ref="canvasRef" v-show="!isLoading"></canvas>
      </div>

      <div v-if="expiresAt && !isLoading" class="qr-info">
        <p class="validity-info"><strong>Валідний до:</strong> {{ formatDate(expiresAt) }}</p>
        <p class="usage-info">
          Співробітники можуть використовувати цей QR-код для відмітки робочого часу
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-code-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.qr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qr-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-toggle {
  padding: 8px 12px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-toggle:hover {
  background: #e5e7eb;
}

.btn-refresh {
  padding: 8px 16px;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 12px 16px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
}

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: 10px;
}

.qr-canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
}

canvas {
  display: block;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  width: 300px;
  height: 300px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.qr-info {
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.validity-info {
  margin: 0 0 12px;
  font-size: 1rem;
  color: #1f2937;
}

.validity-info strong {
  color: #2563eb;
}

.usage-info {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}
</style>
