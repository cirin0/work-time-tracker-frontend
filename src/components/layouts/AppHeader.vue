<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { useChatStore } from '@/stores/chat.store'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import LogoProfile from '../profile/LogoProfile.vue'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const chatStore = useChatStore()
const router = useRouter()
const { isAdmin, isManager } = useRoleGuard()

const currentProfile = computed(() => profileStore.displayProfile)

const profileRoute = computed(() => {
  const user = currentProfile.value
  if (!user?.id) return null
  return {
    name: 'profile',
  }
})

function handleLogout() {
  authStore.clearToken()
  profileStore.clearProfile()
  chatStore.resetAll()
  router.push({ name: 'auth' })
}
</script>

<template>
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
        <router-link v-if="isAdmin" :to="{ name: 'admin' }" class="nav-link">
          Панель адміністратора
        </router-link>
        <router-link v-if="isManager && !isAdmin" :to="{ name: 'manager' }" class="nav-link">
          Панель менеджера
        </router-link>
      </nav>
    </div>
    <div class="header-right">
      <router-link v-if="profileRoute && currentProfile" :to="profileRoute" class="profile-link">
        <LogoProfile :user="currentProfile" />
      </router-link>

      <div v-else-if="authStore.isLoadingUser || profileStore.isLoading" class="profile-loading">
        Завантаження...
      </div>
      <div v-else class="profile-loading">Профіль</div>
      <button @click="handleLogout" class="logout-button">Вихід</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 0 1.5rem;
  height: 68px;
  background: var(--header-bg);
  color: var(--header-text);
  box-shadow: var(--header-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
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
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--header-text);
  letter-spacing: 0.01em;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  color: var(--header-nav-text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;
  position: relative;
  font-size: 0.95rem;
}

.nav-link:hover {
  color: var(--accent-2);
  background: rgba(255, 155, 81, 0.1);
}

.nav-link.router-link-active {
  color: var(--accent-2);
  background: rgba(255, 155, 81, 0.15);
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
  color: var(--header-text);
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.profile-link:hover {
  background: rgba(255, 155, 81, 0.1);
}

.profile-loading {
  color: var(--header-nav-text);
  font-size: 0.875rem;
  padding: 1.22rem 0.5rem;
}

.logout-button {
  padding: 0.5rem 1.25rem;
  background: transparent;
  color: var(--accent-2);
  border: 1px solid rgba(255, 155, 81, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: rgba(255, 155, 81, 0.1);
  border-color: var(--accent-2);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    height: auto;
    padding: 1rem;
    gap: 1rem;
  }

  .header-left {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .header h1 {
    text-align: center;
  }

  .nav-links {
    width: 100%;
  }
}
</style>
