<script setup lang="ts">
import { ref, watch } from 'vue'
import InputField from '../ui/InputField.vue'
import type { AuthRequestData } from '@/types/requests/authRequest.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const props = defineProps<{
  isLogin: boolean
}>()

const emit = defineEmits<{
  registerSuccess: []
}>()

const formLogin = ref<AuthRequestData>({
  name: '',
  email: '',
  password: 'vasiu@test.com',
})
const authStore = useAuthStore()
const router = useRouter()

watch(
  () => authStore.getToken,
  () => {
    if (authStore.getToken) {
      router.push({ name: 'main' })
    }
  },
)

async function handleLogin() {
  await authStore.login(formLogin.value.email, formLogin.value.password)
  router.push({ name: 'main' })
}

async function handleRegister() {
  await authStore.register(formLogin.value.name, formLogin.value.email, formLogin.value.password)
  formLogin.value.password = ''
  emit('registerSuccess')
}

function handleFormSubmit(event: Event) {
  event.preventDefault()
  if (props.isLogin) {
    handleLogin()
  } else {
    handleRegister()
  }
}
</script>
<template>
  <div>
    1. main@test.com / vasiu@test.com <br />
    2. muko@test.com / visiu2@test.com
    <form @submit="handleFormSubmit">
      <InputField
        v-if="!isLogin"
        name="user-full-name"
        label="Name"
        type="text"
        v-model="formLogin.name"
        icon="user"
        placeholder="Enter your full name"
      />
      <InputField
        name="user-email"
        label="Email"
        type="email"
        v-model="formLogin.email"
        icon="email"
        placeholder="Enter your email"
      />
      <InputField
        name="user-password"
        label="Password"
        type="password"
        v-model="formLogin.password"
        icon="lock"
        placeholder="Enter your password"
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
