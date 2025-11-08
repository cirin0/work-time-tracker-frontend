<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { useChatStore } from '@/stores/chat.store'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LogoProfile from '../profile/LogoProfile.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const chatStore = useChatStore()
const router = useRouter()

const profileRoute = computed(() => {
  const user = profileStore.profile
  if (!user?.id) return null
  return {
    name: 'profile',
    params: { id: user.id },
  }
})

function handleLogout() {
  authStore.clearToken()
  profileStore.clearCache()
  chatStore.resetAll()
  router.push({ name: 'auth' })
}

onMounted(async () => {
  if (authStore.getToken) {
    await profileStore.fetchProfile()
  }
})
</script>

<template>
  <div class="main-layout">
    <header class="header">
      <div class="header-left">
        <h1>Work Time Tracker</h1>
        <nav class="nav-links">
          <router-link to="/" class="nav-link">Головна</router-link>
          <router-link :to="{ name: 'chat' }" class="nav-link chat-link">
            Чат
            <span v-if="chatStore.totalUnread > 0" class="unread-indicator">
              {{ chatStore.totalUnread > 99 ? '99+' : chatStore.totalUnread }}
            </span>
          </router-link>
        </nav>
      </div>
      <div class="header-right">
        <router-link
          v-if="profileRoute && profileStore.profile"
          :to="profileRoute"
          class="profile-link"
        >
          <LogoProfile :user="profileStore.profile" />
        </router-link>

        <div v-else class="profile-loading">Завантаження...</div>
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

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.chat-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unread-indicator {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
  }
}

.profile-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.profile-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.profile-loading {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  padding: 1.22rem 0.5rem;
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
