<script setup lang="ts">
import AuthForm from '@/components/auth/AuthForm.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import FormToggle from '@/components/auth/FormToggle.vue'
import { ref } from 'vue'

const isLogin = ref(true)

const handleToggle = (newValue: boolean) => {
  isLogin.value = newValue
}

const handleRegisterSuccess = () => {
  isLogin.value = true
}
</script>
<template>
  <div class="app-container">
    <div class="app-wrapper">
      <AuthHeader subtitle="Track your productivity, boost your success" />
      <div class="form-card">
        <FormToggle :is-login="isLogin" @toggle="handleToggle" />
        <AuthForm :is-login="isLogin" @register-success="handleRegisterSuccess" />
      </div>
    </div>
  </div>
</template>
<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.app-wrapper {
  width: 100%;
  max-width: 28rem;
}
.form-card {
  background: white;
  border-radius: 1rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
}
</style>
