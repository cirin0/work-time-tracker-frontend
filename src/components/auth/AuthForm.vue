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
    1. main@test.com / vasiu@test.com <br />
    2. muko@test.com / visiu2@test.com
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
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 0.5rem;
  color: #065f46;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-alert {
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
}

.forgot-password {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-link {
  font-size: 0.875rem;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  color: #1d4ed8;
}

.submit-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.submit-button:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
}

.terms-text {
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 1rem;
}
</style>
