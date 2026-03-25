<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { useProfileStore } from '@/stores/profile.store'
import { useAuthStore } from '@/stores/auth.store'

const profileStore = useProfileStore()
const authStore = useAuthStore()

const isOpen = ref(false)
const skipped = ref(false)
const digits = ref(['', '', '', ''])
const digitRefs = ref<(HTMLInputElement | null)[]>([])
const error = ref<string | null>(null)
const success = ref(false)

const pinCode = computed(() => digits.value.join(''))
const isComplete = computed(() => pinCode.value.length === 4 && /^\d{4}$/.test(pinCode.value))

watch(
  () => authStore.currentUser,
  (user) => {
    if (user && user.has_pin_code === false && !skipped.value && !success.value) {
      isOpen.value = true
    }
  },
  { immediate: true },
)

watch(isOpen, (open) => {
  if (open) {
    digits.value = ['', '', '', '']
    error.value = null
    nextTick(() => digitRefs.value[0]?.focus())
  }
})

function handleBeforeInput(event: InputEvent) {
  if (event.data && !/^\d$/.test(event.data)) {
    event.preventDefault()
  }
}

function handleDigitInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '')

  digits.value[index] = value.slice(-1)
  error.value = null

  if (value && index < 3) {
    nextTick(() => digitRefs.value[index + 1]?.focus())
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    nextTick(() => digitRefs.value[index - 1]?.focus())
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 4)

  for (let i = 0; i < 4; i++) {
    digits.value[i] = pasted[i] || ''
  }

  const focusIndex = Math.min(pasted.length, 3)
  nextTick(() => digitRefs.value[focusIndex]?.focus())
}

async function handleSetup() {
  error.value = null

  if (!isComplete.value) {
    error.value = 'PIN код повинен містити 4 цифри'
    return
  }

  try {
    await profileStore.setupPinCode({ pin_code: pinCode.value })
    success.value = true
    isOpen.value = false

    if (authStore.currentUser) {
      authStore.currentUser.has_pin_code = true
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Помилка налаштування PIN коду'
  }
}

function handleSkip() {
  skipped.value = true
  isOpen.value = false
}
</script>

<template>
  <Modal v-model="isOpen" title="Налаштування PIN коду" :close-on-overlay="false">
    <div class="pin-setup-content">
      <div class="pin-setup-icon">🔐</div>
      <p class="pin-setup-description">
        Для швидкого та безпечного завершення робочого дня встановіть 4-значний PIN код.
      </p>

      <div v-if="error" class="pin-setup-error">{{ error }}</div>

      <div class="pin-digits">
        <input
          v-for="(_, index) in 4"
          :key="index"
          :ref="(el) => (digitRefs[index] = el as HTMLInputElement)"
          type="tel"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="1"
          class="pin-digit-input"
          :class="{ filled: digits[index] }"
          :value="digits[index]"
          @beforeinput="handleBeforeInput"
          @input="handleDigitInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste"
        />
      </div>
    </div>

    <template #footer>
      <button class="btn-skip" @click="handleSkip" :disabled="profileStore.isSaving">
        Пропустити
      </button>
      <button
        class="btn-setup"
        @click="handleSetup"
        :disabled="profileStore.isSaving || !isComplete"
      >
        {{ profileStore.isSaving ? 'Збереження...' : 'Встановити PIN' }}
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.pin-setup-content {
  text-align: center;
}

.pin-setup-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.pin-setup-description {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0 0 1.25rem;
}

.pin-setup-error {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
  color: var(--error-text);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 500;
}

.pin-digits {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.pin-digit-input {
  width: 3.5rem;
  height: 3.5rem;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.2s ease;
  caret-color: var(--accent-2);
  -webkit-text-security: disc;
}

.pin-digit-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.15);
}

.pin-digit-input.filled {
  border-color: var(--accent-2);
  background: rgba(255, 155, 81, 0.05);
}

.btn-skip,
.btn-setup {
  padding: 0.6rem 1.25rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-skip {
  background: var(--sand-light);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.btn-skip:hover:not(:disabled) {
  border-color: var(--text-muted);
  color: var(--text);
}

.btn-setup {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  box-shadow: 0 2px 8px var(--shadow);
}

.btn-setup:hover:not(:disabled) {
  background: var(--accent-2-hover);
  box-shadow: 0 4px 12px var(--shadow);
  transform: translateY(-1px);
}

.btn-setup:active {
  transform: translateY(0);
}

.btn-skip:disabled,
.btn-setup:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
