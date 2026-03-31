<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { useChatStore } from '@/stores/chat.store'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { computed, ref, watch } from 'vue'
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

async function handleLogout() {
  await authStore.logout()
  profileStore.clearProfile()
  chatStore.resetAll()
  router.push({ name: 'auth' })
}

const isMenuOpen = ref(false)
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
watch(() => router.currentRoute.value.path, () => {
  isMenuOpen.value = false
})
</script>

<template>
  <header class="header">
    <div class="header-left">
      <h1>Work Time Tracker</h1>
    </div>

    <div class="header-menu" :class="{ 'is-open': isMenuOpen }">
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

      <div class="header-actions">
        <router-link v-if="profileRoute && currentProfile" :to="profileRoute" class="profile-link">
          <LogoProfile :user="currentProfile" />
        </router-link>

        <div v-else-if="authStore.isLoadingUser || profileStore.isLoading" class="profile-loading">
          Завантаження...
        </div>
        <div v-else class="profile-loading">Профіль</div>
        <button @click="handleLogout" class="logout-button">Вихід</button>
      </div>
    </div>

    <div class="mobile-actions">
      <button class="burger-btn" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
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

.burger-btn {
  display: none;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-menu {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  margin-left: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mobile-actions {
  display: none;
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
    padding: 0 1rem;
    height: 60px;
    flex-wrap: nowrap;
  }

  .mobile-actions {
    display: flex;
    align-items: center;
  }

  .burger-btn {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }
  .burger-btn span {
    width: 100%;
    height: 2px;
    background: var(--header-text);
    transition: all 0.3s ease;
    border-radius: 2px;
  }
  .burger-btn.is-active span:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }
  .burger-btn.is-active span:nth-child(2) {
    opacity: 0;
  }
  .burger-btn.is-active span:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }

  .header-left {
    min-width: 0;
  }

  .header h1 {
    font-size: 1.15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-menu {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--header-bg);
    flex-direction: column;
    align-items: stretch;
    padding: 1.5rem;
    margin-left: 0;
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    z-index: -1;
    border-bottom: 1px solid var(--border);
  }

  .header-menu.is-open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: 0.8rem;
    font-size: 1.05rem;
  }

  .chat-link {
    justify-content: center;
  }

  .header-actions {
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    justify-content: center;
  }

  .profile-link {
    justify-content: center;
  }

  .logout-button {
    width: 100%;
    padding: 0.7rem;
    font-size: 1rem;
    text-align: center;
  }
}
</style>
