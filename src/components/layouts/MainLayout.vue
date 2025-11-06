<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const router = useRouter()

function handleLogout() {
  authStore.clearToken()
  router.push({ name: 'auth' })
}
const getCurrentUserId = computed(() => {
  return profileStore.profile?.id || ''
})
</script>

<template>
  <div class="main-layout">
    <header class="header">
      <div class="header-left">
        <h1>Work Time Tracker</h1>
        <nav class="nav-links">
          <router-link to="/" class="nav-link">Головна</router-link>
          <router-link :to="`/profile/${getCurrentUserId}`" class="nav-link">Профіль</router-link>
          <router-link to="/chat" class="nav-link">Чат</router-link>
        </nav>
      </div>
      <div>
        <button @click="handleLogout" class="logout-button">Вихід</button>
      </div>
    </header>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.logout-button {
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.content {
  flex: 1;
  padding: 1rem;
}
</style>
