<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import { formatTime } from '@/core/utils/date'
import { useWorkTimer } from '@/composables/useWorkTimer'

interface Props {
  activeEntry: TimeEntry | null
  isStarting?: boolean
  isStopping?: boolean
}

interface Emits {
  (event: 'start'): void
  (event: 'stop', pinCode: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showStopModal = ref(false)
const stopPinCode = ref('')

const startTime = computed(() => props.activeEntry?.start_time)
const { formattedTime } = useWorkTimer(startTime)

const entryTypeLabel = computed(() => {
  const typeMap: Record<string, string> = {
    remote: 'Віддалено',
    office: 'В офісі',
    gps: 'GPS',
    gps_qr: 'GPS + QR',
    manual: 'Вручну',
  }
  return props.activeEntry?.entry_type
    ? typeMap[props.activeEntry.entry_type] || props.activeEntry.entry_type
    : ''
})

function handleStart() {
  emit('start')
}

function openStopModal() {
  stopPinCode.value = ''
  showStopModal.value = true
}

function handleStop() {
  if (stopPinCode.value.length !== 4) return
  emit('stop', stopPinCode.value)
  showStopModal.value = false
  stopPinCode.value = ''
}
</script>

<template>
  <div class="active-session-card">
    <!-- Active Work Session -->
    <div v-if="activeEntry" class="session-active">
      <div class="session-header">
        <div class="status-indicator">
          <span class="pulse-dot"></span>
          <span class="status-text">Працюю зараз</span>
        </div>
        <button class="btn-stop" :disabled="isStopping" @click="openStopModal">
          <span class="btn-icon">⏹️</span>
          <span>{{ isStopping ? 'Завершую...' : 'Завершити' }}</span>
        </button>
      </div>

      <div class="session-details">
        <div class="detail-item">
          <span class="detail-label">Початок роботи</span>
          <span class="detail-value">{{ formatTime(activeEntry.start_time) }}</span>
        </div>

        <div class="detail-item highlight">
          <span class="detail-label">Відпрацьовано</span>
          <span class="detail-value large">{{ formattedTime }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Тип входу</span>
          <span class="detail-value">{{ entryTypeLabel }}</span>
        </div>
      </div>

      <div v-if="activeEntry.start_comment" class="session-comment">
        <p class="comment-label">Коментар:</p>
        <p class="comment-text">{{ activeEntry.start_comment }}</p>
      </div>
    </div>

    <!-- Start Work Button -->
    <div v-else class="session-idle">
      <div class="idle-content">
        <div class="idle-icon">▶️</div>
        <h3 class="idle-title">Готові почати роботу?</h3>
        <p class="idle-subtitle">Натисніть кнопку для початку відстеження робочого часу</p>
        <button class="btn-start" :disabled="isStarting" @click="handleStart">
          {{ isStarting ? 'Починаю...' : 'Почати роботу' }}
        </button>
      </div>
    </div>

    <!-- Stop Work Modal -->
    <div v-if="showStopModal" class="modal-overlay" @click.self="showStopModal = false">
      <div class="modal-content">
        <h3>Завершити роботу</h3>
        <p class="modal-description">Введіть ваш PIN-код для підтвердження</p>
        <input
          v-model="stopPinCode"
          type="password"
          maxlength="4"
          placeholder="0000"
          class="pin-input"
          @keyup.enter="handleStop"
        />
        <div class="modal-actions">
          <button class="btn-cancel" @click="showStopModal = false">Скасувати</button>
          <button
            class="btn-confirm"
            :disabled="stopPinCode.length !== 4 || isStopping"
            @click="handleStop"
          >
            {{ isStopping ? 'Завершую...' : 'Підтвердити' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-session-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Active Session */
.session-active {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 2rem;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pulse-dot {
  display: block;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.status-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-stop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-stop:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-stop:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

.session-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item.highlight {
  background: rgba(255, 255, 255, 0.15);
  padding: 1rem;
  border-radius: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.detail-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.detail-value.large {
  font-size: 2rem;
}

.session-comment {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
}

.comment-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.comment-text {
  font-size: 1rem;
  margin: 0;
}

/* Idle State */
.session-idle {
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.idle-content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.idle-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.idle-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.idle-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.btn-start {
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(34, 197, 94, 0.4);
}

.btn-start:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.modal-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.modal-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.pin-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 1.5rem;
}

.pin-input:focus {
  border-color: #2563eb;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel {
  padding: 0.625rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .session-active,
  .session-idle {
    padding: 1.5rem;
  }

  .session-details {
    grid-template-columns: 1fr;
  }

  .idle-icon {
    font-size: 3rem;
  }

  .idle-title {
    font-size: 1.5rem;
  }

  .btn-start {
    width: 100%;
  }
}
</style>
