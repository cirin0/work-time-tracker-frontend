<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/stores/auth.store'
import { getAvatarUrl } from '@/core/utils/url'
import { UserRole } from '@/types/enums/enums.types'
import type { User } from '@/types/interfaces/user.interface'

const props = defineProps<{
  show: boolean
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', managerId: number): void
}>()

const adminStore = useAdminStore()
const authStore = useAuthStore()

const selectedManagerId = ref<number | null>(null)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Filter users to show only employees/managers (exclude admins and current user)
const availableManagers = ref<User[]>([])

watch(
  () => props.show,
  async (v) => {
    if (v) {
      error.value = null
      selectedManagerId.value = null
      searchQuery.value = ''

      // Load all users
      if (adminStore.users.length === 0) {
        await adminStore.fetchAllUsers(1)
      }

      // Filter users
      const currentUserId = authStore.currentUser?.id
      availableManagers.value = adminStore.users.filter((user) => {
        // Exclude current admin
        if (user.id === currentUserId) return false
        // Only show managers and employees
        return user.role === UserRole.MANAGER || user.role === UserRole.EMPLOYEE
      })
    }
  },
)

const filteredManagers = ref<User[]>([])

watch(
  [() => availableManagers.value, () => searchQuery.value],
  ([managers, query]) => {
    if (!query.trim()) {
      filteredManagers.value = managers
    } else {
      const q = query.toLowerCase()
      filteredManagers.value = managers.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    }
  },
  { immediate: true },
)

function setError(msg: string) {
  error.value = msg
}

function onSubmit() {
  if (!selectedManagerId.value) {
    error.value = 'Оберіть менеджера зі списку'
    return
  }
  error.value = null
  emit('submit', selectedManagerId.value)
}

defineExpose({ setError })
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>Призначити менеджера</h3>
          <button class="btn-close" @click="emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <div v-if="error" class="error-banner">{{ error }}</div>

          <div class="search-field">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Пошук за ім'ям або email..."
              class="search-input"
            />
          </div>

          <div v-if="adminStore.isLoading" class="loading-state">Завантаження...</div>

          <div v-else-if="filteredManagers.length === 0" class="empty-state">
            <p v-if="searchQuery">Нічого не знайдено</p>
            <p v-else>Немає доступних користувачів для призначення</p>
          </div>

          <div v-else class="users-list">
            <label
              v-for="user in filteredManagers"
              :key="user.id"
              class="user-option"
              :class="{ selected: selectedManagerId === user.id }"
            >
              <input
                v-model="selectedManagerId"
                type="radio"
                :value="user.id"
                class="radio-input"
              />
              <div class="user-avatar">
                <img
                  v-if="user.avatar"
                  :src="getAvatarUrl(user.avatar) ?? undefined"
                  :alt="user.name"
                  class="avatar-img"
                />
                <span v-else class="avatar-placeholder">{{ user.name[0] }}</span>
              </div>
              <div class="user-details">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
                <div class="user-role">
                  <span v-if="user.role === UserRole.MANAGER" class="badge badge-manager">
                    Менеджер
                  </span>
                  <span v-else class="badge badge-employee">Співробітник</span>
                </div>
              </div>
              <div class="check-icon">✓</div>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="emit('close')">Скасувати</button>
            <button
              type="button"
              class="btn-submit"
              :disabled="isSubmitting || !selectedManagerId"
              @click="onSubmit"
            >
              {{ isSubmitting ? 'Призначення...' : 'Призначити' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.search-field {
  position: sticky;
  top: -1.5rem;
  background: white;
  z-index: 10;
  padding-bottom: 0.5rem;
}

.search-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.9rem;
  color: #111827;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: #2563eb;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.user-option:hover {
  border-color: #cbd5e1;
  background: #f9fafb;
}

.user-option.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.95rem;
}

.user-email {
  font-size: 0.825rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.user-role {
  margin-top: 0.375rem;
}

.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-manager {
  background: #dbeafe;
  color: #1e40af;
}

.badge-employee {
  background: #e0e7ff;
  color: #4338ca;
}

.check-icon {
  font-size: 1.25rem;
  color: #2563eb;
  opacity: 0;
  transition: opacity 0.2s;
}

.user-option.selected .check-icon {
  opacity: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-submit {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
