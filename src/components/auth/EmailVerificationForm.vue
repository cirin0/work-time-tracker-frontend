<script setup lang="ts">
import { computed } from 'vue'
import InputField from '@/components/ui/InputField.vue'
import { useEmailVerificationForm } from '@/composables/useEmailVerificationForm'

const props = defineProps<{
  email: string
}>()

const emit = defineEmits<{
  verified: []
  backToAuth: []
}>()

const { generalError, successMessage, isVerifying, isResending, onVerifySubmit, resendCode } =
  useEmailVerificationForm(() => props.email)

const hasSuccess = computed(() => !!successMessage.value)

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  await onVerifySubmit(event)

  if (hasSuccess.value) {
    emit('verified')
  }
}
</script>

<template>
  <div>
    <div v-if="successMessage" class="success-alert">
      {{ successMessage }}
    </div>
    <div v-if="generalError" class="error-alert">
      {{ generalError }}
    </div>

    <p class="verification-hint">
      Введіть код із листа, який ми надіслали на вашу електронну пошту після реєстрації.
    </p>

    <form @submit="handleSubmit">
      <InputField
        name="email"
        label="Електронна пошта"
        type="email"
        icon="email"
        placeholder="Введіть електронну пошту"
      />
      <InputField
        name="code"
        label="Код підтвердження"
        type="text"
        icon="lock"
        placeholder="Введіть 6-значний код"
      />

      <button class="submit-button" type="submit" :disabled="isVerifying">
        {{ isVerifying ? 'Підтвердження...' : 'Підтвердити пошту' }}
      </button>

      <button class="secondary-button" type="button" :disabled="isResending" @click="resendCode">
        {{ isResending ? 'Надсилаємо...' : 'Надіслати код повторно' }}
      </button>

      <button class="link-button" type="button" @click="emit('backToAuth')">
        Повернутися до входу
      </button>
    </form>
  </div>
</template>

<style scoped>
.verification-hint {
  margin: 0 0 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.4;
  text-align: center;
}

.success-alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  border-radius: 0.5rem;
  color: var(--pin-ok-color);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
}

.error-alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
  color: var(--error-text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
}

.submit-button,
.secondary-button,
.link-button {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button {
  margin-top: 0.25rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
}

.submit-button:hover:not(:disabled) {
  background: var(--accent-2-hover);
}

.secondary-button {
  margin-top: 0.75rem;
  background: var(--sand-light);
  color: var(--text);
  border: 1px solid var(--border);
}

.secondary-button:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.link-button {
  margin-top: 0.75rem;
  background: transparent;
  color: var(--accent-2);
  border: none;
  text-decoration: underline;
}

.link-button:hover {
  color: var(--accent-2-hover);
}

.submit-button:disabled,
.secondary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .submit-button,
  .secondary-button,
  .link-button {
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }
}
</style>
