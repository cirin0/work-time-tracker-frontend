<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/users.store'
import { getAvatarUrl } from '@/core/utils/url'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const route = useRoute()
const store = useUsersStore()

onMounted(() => {
  const id = route.params.id as string
  store.fetchUserById(id)
})
</script>

<template>
  <div class="user-view">
    <PageHeader title="Профіль користувача" />

    <LoadingSpinner v-if="store.isLoadingUser" text="Завантаження..." />

    <div v-else-if="store.error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Помилка завантаження</h2>
      <p>{{ store.error }}</p>
      <button class="btn-primary" @click="store.fetchUserById(route.params.id as string)">
        Спробувати ще раз
      </button>
    </div>

    <div v-else-if="store.currentUser" class="user-card">
      <div class="user-header">
        <div class="avatar-wrapper">
          <img
            v-if="getAvatarUrl(store.currentUser.avatar)"
            :src="getAvatarUrl(store.currentUser.avatar)!"
            :alt="store.currentUser.name"
            class="avatar"
          />
          <div v-else class="avatar-placeholder">
            {{ store.currentUser.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="user-meta">
          <h2 class="user-name">{{ store.currentUser.name }}</h2>
          <p class="user-email">{{ store.currentUser.email }}</p>
          <div class="user-id-badge">ID: {{ store.currentUser.id }}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">👤</div>
          <div class="info-content">
            <span class="info-label">Ім'я</span>
            <span class="info-value">{{ store.currentUser.name }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">📧</div>
          <div class="info-content">
            <span class="info-label">Email</span>
            <a :href="`mailto:${store.currentUser.email}`" class="info-value link">
              {{ store.currentUser.email }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-view {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
}

.error-state {
  text-align: center;
  padding: 3rem;
  background: var(--surface);
  border-radius: 1rem;
  box-shadow: 0 2px 12px var(--shadow);
  border: 1px solid var(--border);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h2 {
  color: var(--error-text);
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.user-card {
  background: var(--surface);
  border-radius: 1rem;
  box-shadow: 0 2px 12px var(--shadow);
  border: 1px solid var(--border);
  overflow: hidden;
}

.user-header {
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  padding: 2.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--header-text);
}

.user-meta {
  flex: 1;
}

.user-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--header-text);
  margin: 0 0 0.25rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  margin: 0 0 0.75rem;
}

.user-id-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: var(--header-text);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.info-grid {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--sand-light);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}

.info-icon {
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  font-style: normal;
  flex-shrink: 0;
  font-weight: 700;
  color: var(--text-muted);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.95rem;
  color: var(--text);
  font-weight: 500;
}

.info-value.link {
  color: var(--accent-2);
  text-decoration: none;
  transition: color 0.2s ease;
}

.info-value.link:hover {
  text-decoration: underline;
}

.info-value.link:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
  border-radius: 0.25rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
  font-weight: 700;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
  filter: brightness(1.05);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .user-view {
    padding: 1rem;
  }

  .user-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
