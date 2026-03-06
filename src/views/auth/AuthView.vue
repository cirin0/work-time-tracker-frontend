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
  background: var(--bg);
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 1rem;
  box-shadow: 0 2px 12px var(--shadow);
  padding: 2rem;
}

@media (max-width: 640px) {
  .app-container {
    padding: 0.5rem;
  }

  .form-card {
    padding: 1.5rem;
  }
}
</style>
