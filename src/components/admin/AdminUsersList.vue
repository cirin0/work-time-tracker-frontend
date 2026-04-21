<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/enums/enums.types'
import type { User } from '@/types/interfaces/user.interface'
import type { WorkMode } from '@/types/enums/enums.types'
import { getAvatarUrl } from '@/core/utils/url'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Badge from '@/components/ui/Badge.vue'
import Pagination from '@/components/ui/Pagination.vue'
import AdminEditUserModal from '@/components/admin/AdminEditUserModal.vue'
import AdminChangeRoleModal from '@/components/admin/AdminChangeRoleModal.vue'
import AdminChangeWorkModeModal from '@/components/admin/AdminChangeWorkModeModal.vue'
import AdminResetPasswordModal from '@/components/admin/AdminResetPasswordModal.vue'
import PencilIcon from '@/icons/PencilIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'
import BriefcaseIcon from '@/icons/BriefcaseIcon.vue'
import KeyIcon from '@/icons/KeyIcon.vue'
import TrashIcon from '@/icons/TrashIcon.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const store = useAdminStore()
const authStore = useAuthStore()

const currentPage = ref(1)
const searchQuery = ref('')

const editModal = ref(false)
const roleModal = ref(false)
const workModeModal = ref(false)
const passwordModal = ref(false)
const activeUser = ref<User | null>(null)
const isSubmitting = ref(false)

const editModalRef = ref<InstanceType<typeof AdminEditUserModal> | null>(null)
const roleModalRef = ref<InstanceType<typeof AdminChangeRoleModal> | null>(null)
const workModeModalRef = ref<InstanceType<typeof AdminChangeWorkModeModal> | null>(null)
const passwordModalRef = ref<InstanceType<typeof AdminResetPasswordModal> | null>(null)

const filteredUsers = computed(() => {
  const currentUserId = authStore.currentUser?.id
  return store.users.filter((user) => (currentUserId ? user.id !== currentUserId : true))
})

const onSearchInput = (() => {
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      currentPage.value = 1
      store.fetchAllUsers(1, searchQuery.value)
    }, 300)
  }
})()

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Адмін',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.EMPLOYEE]: 'Співробітник',
}

const roleVariants: Record<UserRole, 'role-admin' | 'role-manager' | 'role-employee'> = {
  [UserRole.ADMIN]: 'role-admin',
  [UserRole.MANAGER]: 'role-manager',
  [UserRole.EMPLOYEE]: 'role-employee',
}

const workModeLabels: Record<WorkMode, string> = {
  remote: 'Дистанційно',
  office: 'В офісі',
  hybrid: 'Гібридний',
}

async function loadPage(page: number) {
  currentPage.value = page
  await store.fetchAllUsers(page, searchQuery.value)
}

function openEdit(user: User) {
  activeUser.value = user
  editModal.value = true
}

function openRoleChange(user: User) {
  activeUser.value = user
  roleModal.value = true
}

function openWorkModeChange(user: User) {
  activeUser.value = user
  workModeModal.value = true
}

function openPasswordReset(user: User) {
  activeUser.value = user
  passwordModal.value = true
}

async function handleEditSubmit(data: { name: string; email: string }) {
  if (!activeUser.value) return
  isSubmitting.value = true
  try {
    await store.updateUser(activeUser.value.id, data)
    editModal.value = false
  } catch (err: unknown) {
    const msg = extractMessage(err)
    editModalRef.value?.setError(msg || 'Помилка збереження')
  } finally {
    isSubmitting.value = false
  }
}

async function handleRoleSubmit(role: UserRole) {
  if (!activeUser.value) return
  isSubmitting.value = true
  try {
    await store.updateUserRole(activeUser.value.id, { role })
    roleModal.value = false
  } catch (err: unknown) {
    const msg = extractMessage(err)
    roleModalRef.value?.setError(msg || 'Помилка зміни ролі')
  } finally {
    isSubmitting.value = false
  }
}

async function handleWorkModeSubmit(workMode: WorkMode) {
  if (!activeUser.value) return
  isSubmitting.value = true
  try {
    await store.updateWorkMode(activeUser.value.id, { work_mode: workMode })
    workModeModal.value = false
  } catch (err: unknown) {
    const msg = extractMessage(err)
    workModeModalRef.value?.setError(msg || 'Помилка зміни режиму роботи')
  } finally {
    isSubmitting.value = false
  }
}

async function handlePasswordSubmit(data: { password: string; password_confirmation: string }) {
  if (!activeUser.value) return
  isSubmitting.value = true
  try {
    await store.resetPassword(activeUser.value.id, data)
    passwordModal.value = false
  } catch (err: unknown) {
    const msg = extractMessage(err)
    passwordModalRef.value?.setError(msg || 'Помилка скидання паролю')
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(user: User) {
  if (!confirm(`Ви впевнені, що хочете видалити "${user.name}"? Цю дію не можна скасувати.`)) {
    return
  }
  try {
    await store.deleteUser(user.id)
  } catch {
    alert('Помилка видалення користувача')
  }
}

function extractMessage(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    return (err as { response?: { data?: { message?: string } } }).response?.data?.message
  }
  return undefined
}

onMounted(() => loadPage(1))
</script>

<template>
  <div class="users-manager">
    <Card>
      <template #header>
        <h2>Користувачі системи</h2>
        <span v-if="store.pagination" class="total-badge">
          Всього: {{ store.pagination.total > 1 ? store.pagination.total : '-' }}
        </span>
      </template>

      <div class="search-bar">
        <div class="search-input-wrap">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Пошук за іменем або email..."
            class="search-input"
            @input="onSearchInput"
          />
          <div v-if="store.isLoading" class="search-spinner">
            <LoadingSpinner size="sm" />
          </div>
        </div>
      </div>

      <div v-if="store.error" class="error-alert">{{ store.error }}</div>

      <div v-if="store.isLoading" class="loading">Завантаження...</div>

      <div v-else>
        <div v-if="filteredUsers.length === 0" class="empty-state">Користувачів не знайдено</div>

        <div class="user-list">
          <div v-for="user in filteredUsers" :key="user.id" class="user-card">
            <div class="user-main">
              <Avatar
                :src="getAvatarUrl(user.avatar) || undefined"
                :alt="user.name"
                :fallback-text="user.name"
                size="medium"
              />

              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
                <div class="user-meta">
                  <Badge :variant="roleVariants[user.role]" :label="roleLabels[user.role]" />
                  <span v-if="user.work_mode" class="work-mode-text">
                    {{ workModeLabels[user.work_mode] }}
                  </span>
                  <span v-if="user.company" class="meta-text">{{ user.company.name }}</span>
                  <span v-if="user.manager" class="meta-text">{{ user.manager.name }}</span>
                </div>
              </div>
            </div>

            <div class="user-actions">
              <button class="action-btn" @click="openEdit(user)" title="Редагувати">
                <PencilIcon />
              </button>
              <button class="action-btn" @click="openRoleChange(user)" title="Роль">
                <UserIcon />
              </button>
              <button class="action-btn" @click="openWorkModeChange(user)" title="Режим">
                <BriefcaseIcon />
              </button>
              <button class="action-btn" @click="openPasswordReset(user)" title="Пароль">
                <KeyIcon />
              </button>
              <button class="action-btn danger" @click="handleDelete(user)" title="Видалити">
                <TrashIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="store.pagination && store.pagination.last_page > 1" class="pagination-wrapper">
        <Pagination :meta="store.pagination" @change-page="loadPage" />
      </div>
    </Card>

    <!-- Modals -->
    <AdminEditUserModal
      ref="editModalRef"
      :show-modal="editModal"
      :user="activeUser"
      :is-submitting="isSubmitting"
      @close="editModal = false"
      @submit="handleEditSubmit"
    />

    <AdminChangeRoleModal
      ref="roleModalRef"
      :show-modal="roleModal"
      :user="activeUser"
      :is-submitting="isSubmitting"
      @close="roleModal = false"
      @submit="handleRoleSubmit"
    />

    <AdminChangeWorkModeModal
      ref="workModeModalRef"
      :show-modal="workModeModal"
      :user="activeUser"
      :is-submitting="isSubmitting"
      @close="workModeModal = false"
      @submit="handleWorkModeSubmit"
    />

    <AdminResetPasswordModal
      ref="passwordModalRef"
      :show-modal="passwordModal"
      :user="activeUser"
      :is-submitting="isSubmitting"
      @close="passwordModal = false"
      @submit="handlePasswordSubmit"
    />
  </div>
</template>

<style scoped>
.users-manager {
  max-width: var(--container-max);
  margin: 0 auto;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

h2 {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.total-badge {
  background: var(--sand-light);
  color: var(--text);
  padding: 0.25rem 0.875rem;
  border-radius: 9999px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
}

.error-alert {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-family: var(--font-body);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  transition: box-shadow 0.15s;
  flex-wrap: wrap;
}

.user-card:hover {
  box-shadow: 0 2px 8px var(--shadow);
}

.user-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  flex: 1;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
}

.user-name {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.work-mode-text,
.meta-text {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.meta-text::before {
  content: '·';
  margin-right: 0.375rem;
}

.user-actions {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.375rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--text-muted);
}

.action-btn :deep(svg) {
  width: 1.125rem;
  height: 1.125rem;
}

.action-btn:hover {
  border-color: var(--accent-2);
  color: var(--accent-1);
  background: var(--surface-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.action-btn.danger {
  color: var(--error-text);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.05);
  border-color: var(--error-text);
  color: var(--error-text);
}

.pagination-wrapper {
  margin-top: 1.25rem;
}

@media (max-width: var(--bp-lg)) {
  .user-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 620px) {
  .user-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.875rem;
  }

  .user-main {
    width: 100%;
  }

  .user-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: var(--bp-sm)) {
  h2 {
    font-size: 1.1rem;
  }

  .user-card {
    padding: 0.875rem 1rem;
  }

  .user-actions {
    gap: 0.375rem;
  }
}
</style>
