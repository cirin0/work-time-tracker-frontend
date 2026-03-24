<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import { formatTime } from '@/core/utils/date'
import { useWorkTimer } from '@/composables/useWorkTimer'
import Card from '@/components/ui/Card.vue'
import Modal from '@/components/ui/Modal.vue'
import Badge from '@/components/ui/Badge.vue'

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
  <Card :no-padding="true" class="active-session-card">
    <!-- Active Work Session -->
    <div v-if="activeEntry" class="session-active">
      <div class="session-header">
        <div class="status-indicator">
          <span class="pulse-dot"></span>
          <span class="status-text">Працюю зараз</span>
        </div>
        <Badge variant="status-active" label="Активна" />
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

      <div class="session-actions">
        <button class="btn-stop" :disabled="isStopping" @click="openStopModal">
          <span class="btn-icon">⏹️</span>
          <span>{{ isStopping ? 'Завершую...' : 'Завершити' }}</span>
        </button>
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
  </Card>

  <!-- Stop Work Modal -->
  <Modal v-model="showStopModal" title="Завершити роботу">
    <p class="modal-description">Введіть ваш PIN-код для підтвердження</p>
    <input
      v-model="stopPinCode"
      type="password"
      maxlength="4"
      placeholder="0000"
      class="pin-input"
      @keyup.enter="handleStop"
    />
    <template #footer>
      <button class="btn-cancel" @click="showStopModal = false">Скасувати</button>
      <button
        class="btn-confirm"
        :disabled="stopPinCode.length !== 4 || isStopping"
        @click="handleStop"
      >
        {{ isStopping ? 'Завершую...' : 'Підтвердити' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
/* Active Session */
.session-active {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%);
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
  background: var(--accent-2);
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
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
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
  background: var(--sand-light);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.detail-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-muted);
}

.detail-value {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
}

.detail-value.large {
  font-size: 2rem;
  color: var(--accent-2);
}

.session-comment {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--sand-light);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.comment-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.25rem;
}

.comment-text {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
}

.session-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-stop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-stop:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.4);
}

.btn-stop:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

.session-idle {
  padding: 1rem;
  background: var(--sand-light);
}

.idle-content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.idle-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.idle-title {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.idle-subtitle {
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.btn-start {
  padding: 1rem 2.5rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 155, 81, 0.4);
}

.btn-start:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-description {
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.pin-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 1.5rem;
}

.pin-input:focus {
  border-color: var(--accent-2);
}

.btn-cancel {
  padding: 0.6rem 1.25rem;
  background: var(--sand-light);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.btn-confirm {
  padding: 0.6rem 1.25rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: var(--bp-md)) {
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
