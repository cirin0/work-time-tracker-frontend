<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiClient, API_ROUTES } from '@/core/api'
import { API_BASE_URL } from '@/core/api/client'

const isVisible = ref(false)
const downloadUrl = ref('')
const versionName = ref('')
const isLoading = ref(false)

const STORAGE_KEY = 'app_download_dismissed_version'

onMounted(async () => {
  try {
    const { data } = await apiClient.get(API_ROUTES.app.updateCheck)
    if (data && data.updateAvailable && data.downloadUrl) {
      let finalUrl = data.downloadUrl
      try {
        const urlObj = new URL(data.downloadUrl)
        const baseUrl = new URL(API_BASE_URL).origin
        finalUrl = `${baseUrl}${urlObj.pathname}`
      } catch {
        if (data.downloadUrl.startsWith('/')) {
          const baseUrl = API_BASE_URL.replace(/\/api$/, '')
          finalUrl = `${baseUrl}${data.downloadUrl}`
        }
      }

      downloadUrl.value = finalUrl
      versionName.value = data.versionName

      const dismissedVersion = localStorage.getItem(STORAGE_KEY)
      if (dismissedVersion !== data.versionName) {
        isVisible.value = true
      }
    }
  } catch (err) {
    console.error('Failed to check for app update:', err)
  }
})

function dismiss() {
  isVisible.value = false
  if (versionName.value) {
    localStorage.setItem(STORAGE_KEY, versionName.value)
  }
}

function handleDownload() {
  if (downloadUrl.value) {
    isLoading.value = true
    window.open(downloadUrl.value, '_blank')
    setTimeout(() => {
      isLoading.value = false
      dismiss()
    }, 1000)
  }
}
</script>

<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="app-download-popup">
      <button class="close-btn" @click="dismiss" aria-label="Закрити">×</button>
      <div class="popup-content">
        <div class="popup-icon">📱</div>
        <div class="popup-info">
          <h5>Додаток для Android</h5>
          <p>Встановіть наш мобільний додаток (v{{ versionName }}) для зручнішого трекінгу</p>
        </div>
      </div>
      <button class="btn-primary" @click="handleDownload" :disabled="isLoading">
        {{ isLoading ? 'Завантаження...' : 'Завантажити APK' }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.app-download-popup {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 320px;
  background: var(--surface);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border);
  padding: 1.25rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--sand-light);
  color: var(--text);
}

.popup-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.popup-icon {
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  border-radius: 0.75rem;
  color: white;
  flex-shrink: 0;
}

.popup-info h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.popup-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
