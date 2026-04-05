<script setup lang="ts">
import AuthForm from '@/components/auth/AuthForm.vue'
import AuthHeader from '@/components/auth/AuthHeader.vue'
import EmailVerificationForm from '@/components/auth/EmailVerificationForm.vue'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'
import FormToggle from '@/components/auth/FormToggle.vue'
import { ref } from 'vue'

const isLogin = ref(true)
const authStep = ref<'auth' | 'verify-email' | 'forgot-password' | 'reset-password'>('auth')
const verificationEmail = ref('')
const resetEmail = ref('')
const loginNotice = ref('')

const handleToggle = (newValue: boolean) => {
  isLogin.value = newValue
  authStep.value = 'auth'

  if (!newValue) {
    loginNotice.value = ''
  }
}

const handleRegisterSuccess = (email: string) => {
  verificationEmail.value = email
  authStep.value = 'verify-email'
}

const handleVerificationSuccess = () => {
  authStep.value = 'auth'
  isLogin.value = true
  loginNotice.value = 'Електронну пошту підтверджено. Ви можете увійти.'
}

const handleForgotPassword = () => {
  authStep.value = 'forgot-password'
}

const handleCodeSent = (email: string) => {
  resetEmail.value = email
  authStep.value = 'reset-password'
}

const handleResetSuccess = () => {
  authStep.value = 'auth'
  isLogin.value = true
  loginNotice.value = 'Пароль успішно скинуто. Ви можете увійти з новим паролем.'
}

const handleBackToAuth = () => {
  authStep.value = 'auth'
  isLogin.value = true
}

const handleClearLoginNotice = () => {
  loginNotice.value = ''
}
</script>
<template>
  <div class="app-container">
    <div class="app-wrapper">
      <AuthHeader
        :subtitle="
          authStep === 'verify-email'
            ? 'Підтвердьте вашу електронну пошту для завершення реєстрації'
            : authStep === 'forgot-password'
              ? 'Відновлення доступу до акаунту'
              : authStep === 'reset-password'
                ? 'Створіть новий пароль для вашого акаунту'
                : 'Керуйте робочим часом швидко та зручно'
        "
      />
      <div class="form-card">
        <template v-if="authStep === 'auth'">
          <FormToggle :is-login="isLogin" @toggle="handleToggle" />
          <AuthForm
            :is-login="isLogin"
            :login-notice="loginNotice"
            @register-success="handleRegisterSuccess"
            @email-not-verified="handleRegisterSuccess"
            @forgot-password="handleForgotPassword"
            @clear-login-notice="handleClearLoginNotice"
          />
        </template>
        <EmailVerificationForm
          v-else-if="authStep === 'verify-email'"
          :email="verificationEmail"
          @verified="handleVerificationSuccess"
          @back-to-auth="handleBackToAuth"
        />
        <ForgotPasswordForm
          v-else-if="authStep === 'forgot-password'"
          @code-sent="handleCodeSent"
          @back-to-auth="handleBackToAuth"
        />
        <ResetPasswordForm
          v-else-if="authStep === 'reset-password'"
          :email="resetEmail"
          @reset-success="handleResetSuccess"
          @back-to-auth="handleBackToAuth"
        />
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

@media (max-width: var(--bp-sm)) {
  .app-container {
    padding: 0.5rem;
  }

  .form-card {
    padding: 1.5rem;
  }
}
</style>
