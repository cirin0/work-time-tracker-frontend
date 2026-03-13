<script setup lang="ts">
import { watch } from 'vue'
import InputField from '../ui/InputField.vue'
import { useAuthForm } from '@/composables/useAuthForm'

const props = defineProps<{
  isLogin: boolean
}>()

const emit = defineEmits<{
  registerSuccess: []
}>()

const { generalError, successMessage, onSubmit, resetFormState, clearErrors } = useAuthForm(
  () => props.isLogin,
)

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  await onSubmit(event)

  if (!props.isLogin && !generalError.value && successMessage.value) {
    emit('registerSuccess')
  }
}

const handleInputStart = () => {
  if (successMessage.value) {
    successMessage.value = ''
  }
}

watch(
  () => props.isLogin,
  (newValue, oldValue) => {
    if (oldValue === false && newValue === true) {
      resetFormState()
    } else {
      clearErrors()
      resetFormState()
    }
  },
)
</script>
<template>
  <div>
    <div v-if="successMessage" class="success-alert">
      {{ successMessage }}
    </div>
    <div v-if="generalError" class="error-alert">
      {{ generalError }}
    </div>
    <form @submit="handleSubmit">
      <InputField
        v-if="!isLogin"
        name="name"
        label="Name"
        type="text"
        icon="user"
        placeholder="Enter your full name"
        @focus="handleInputStart"
      />
      <InputField
        name="email"
        label="Email"
        type="email"
        icon="email"
        placeholder="Enter your email"
        @focus="handleInputStart"
      />
      <InputField
        name="password"
        label="Password"
        type="password"
        icon="lock"
        placeholder="Enter your password"
        @focus="handleInputStart"
      />
      <div v-if="isLogin" class="forgot-password">
        <a href="#" class="forgot-link">Forgot password?</a>
      </div>

      <button class="submit-button" type="submit">
        {{ isLogin ? 'Login' : 'Register' }}
      </button>
    </form>

    <p v-if="!isLogin" class="terms-text">By registering, you agree to our Terms of Service</p>
  </div>
</template>
<style scoped>
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

.forgot-password {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-link {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--accent-2);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--accent-2-hover);
}

.submit-button {
  width: 100%;
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

.submit-button:hover {
  background: var(--accent-2-hover);
  box-shadow: 0 4px 12px var(--shadow);
  transform: translateY(-1px);
}

.submit-button:active {
  transform: translateY(0);
}

.terms-text {
  text-align: center;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .submit-button {
    padding: 0.875rem 1rem;
    font-size: 1rem;
  }
}
</style>
