<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/enums/enums.types'
import type { User } from '@/types/interfaces/user.interface'
import { useEmployeeSearch } from '@/composables/useEmployeeSearch'
import Modal from '@/components/ui/Modal.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import ButtonMain from '@/components/ui/ButtonMain.vue'

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
const isOpen = ref(false)

const availableManagers = ref<User[]>([])

watch(
  () => props.show,
  async (v) => {
    isOpen.value = v
    if (v) {
      error.value = null
      selectedManagerId.value = null

      if (adminStore.users.length === 0) {
        await adminStore.fetchAllUsers(1)
      }

      const currentUserId = authStore.currentUser?.id
      availableManagers.value = adminStore.users.filter((user) => {
        if (user.id === currentUserId) return false
        return user.role === UserRole.MANAGER
      })
    }
  },
)

watch(isOpen, (open) => {
  if (!open && props.show) {
    emit('close')
  }
})

const { searchQuery, filteredEmployees: filteredManagers } = useEmployeeSearch(
  () => availableManagers.value,
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
  <Modal v-model="isOpen" title="Призначити менеджера" max-width="560px">
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
        <input v-model="selectedManagerId" type="radio" :value="user.id" class="radio-input" />
        <Avatar
          :src="user.avatar || undefined"
          :alt="user.name"
          :fallback-text="user.name"
          size="medium"
        />
        <div class="user-details">
          <div class="user-name">{{ user.name }}</div>
          <div class="user-email">{{ user.email }}</div>
          <div class="user-role">
            <Badge v-if="user.role === UserRole.MANAGER" variant="role-manager" label="Менеджер" />
            <Badge v-else variant="role-employee" label="Співробітник" />
          </div>
        </div>
        <div class="check-icon">✓</div>
      </label>
    </div>

    <template #footer>
      <ButtonMain variant="secondary" @click="emit('close')">Скасувати</ButtonMain>
      <ButtonMain
        variant="primary"
        :disabled="isSubmitting || !selectedManagerId"
        @click="onSubmit"
      >
        {{ isSubmitting ? 'Призначення...' : 'Призначити' }}
      </ButtonMain>
    </template>
  </Modal>
</template>

<style scoped>
.error-banner {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.search-field {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.625rem 0.875rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: var(--accent-2);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
  font-family: var(--font-body);
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: var(--surface);
}

.user-option:hover {
  border-color: var(--sand);
  background: var(--sand-light);
}

.user-option.selected {
  border-color: var(--accent-2);
  background: var(--sand-light);
}

.radio-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: var(--font-body);
  font-weight: 500;
  color: var(--text);
  font-size: 0.95rem;
}

.user-email {
  font-family: var(--font-body);
  font-size: 0.825rem;
  color: var(--text-muted);
  margin-top: 0.125rem;
}

.user-role {
  margin-top: 0.375rem;
}

.check-icon {
  font-size: 1.25rem;
  color: var(--accent-2);
  opacity: 0;
  transition: opacity 0.2s;
}

.user-option.selected .check-icon {
  opacity: 1;
}
</style>
