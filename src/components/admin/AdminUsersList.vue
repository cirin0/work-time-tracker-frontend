<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/stores/auth.store'
import { getAvatarUrl } from '@/core/utils/url'
import { UserRole } from '@/types/enums/enums.types'
import type { User } from '@/types/interfaces/user.interface'
import type { WorkMode } from '@/types/enums/enums.types'
import Pagination from '@/components/ui/Pagination.vue'
import AdminEditUserModal from '@/components/admin/AdminEditUserModal.vue'
import AdminChangeRoleModal from '@/components/admin/AdminChangeRoleModal.vue'
import AdminChangeWorkModeModal from '@/components/admin/AdminChangeWorkModeModal.vue'
import AdminResetPasswordModal from '@/components/admin/AdminResetPasswordModal.vue'

const store = useAdminStore()
const authStore = useAuthStore()

const currentPage = ref(1)

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
  if (!currentUserId) return store.users
  return store.users.filter((user) => user.id !== currentUserId)
})

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Адмін',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.EMPLOYEE]: 'Співробітник',
}

const workModeLabels: Record<WorkMode, string> = {
  remote: 'Дистанційно',
  office: 'В офісі',
  hybrid: 'Гібридний',
}

async function loadPage(page: number) {
  currentPage.value = page
  await store.fetchAllUsers(page)
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
    <div class="section-header">
      <h2>Працівники компанії</h2>
      <span v-if="store.pagination" class="total-badge">
        Всього: {{ store.pagination.total > 1 ? store.pagination.total : '-' }}
      </span>
    </div>

    <div v-if="store.error" class="error-alert">{{ store.error }}</div>

    <div v-if="store.isLoading" class="loading">Завантаження...</div>

    <div v-else>
      <div v-if="filteredUsers.length === 0" class="empty-state">Користувачів не знайдено</div>

      <div class="user-list">
        <div v-for="user in filteredUsers" :key="user.id" class="user-card">
          <div class="user-main">
            <img
              v-if="user.avatar"
              :src="getAvatarUrl(user.avatar) ?? undefined"
              class="avatar"
              :alt="user.name"
            />
            <div v-else class="avatar-placeholder">{{ user.name[0] }}</div>

            <div class="user-info">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-email">{{ user.email }}</div>
              <div class="user-meta">
                <span class="badge" :class="`badge-${user.role}`">
                  {{ roleLabels[user.role] }}
                </span>
                <span v-if="user.work_mode" class="badge badge-mode">
                  {{ workModeLabels[user.work_mode] }}
                </span>
                <span v-if="user.company" class="meta-text">{{ user.company.name }}</span>
                <span v-if="user.manager" class="meta-text">{{ user.manager.name }}</span>
              </div>
            </div>
          </div>

          <div class="user-actions">
            <button class="btn-action btn-edit" @click="openEdit(user)">Редагувати</button>
            <button class="btn-action btn-role" @click="openRoleChange(user)">Роль</button>
            <button class="btn-action btn-mode" @click="openWorkModeChange(user)">Режим</button>
            <button class="btn-action btn-password" @click="openPasswordReset(user)">Пароль</button>
            <button class="btn-action btn-delete" @click="handleDelete(user)">Видалити</button>
          </div>
        </div>
      </div>
    </div>

    <Pagination
      v-if="store.pagination && store.pagination.last_page > 1"
      :meta="store.pagination"
      @change-page="loadPage"
    />

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
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.total-badge {
  background: #ede9fe;
  color: #6d28d9;
  padding: 0.2rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.error-alert {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
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
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  transition: box-shadow 0.15s;
  flex-wrap: wrap;
}

.user-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  flex-shrink: 0;
  text-transform: uppercase;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.125rem;
}

.meta-text {
  font-size: 0.75rem;
  color: #9ca3af;
}

.meta-text::before {
  content: '·';
  margin-right: 0.375rem;
}

.badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-admin {
  background: #fef3c7;
  color: #92400e;
}

.badge-manager {
  background: #dbeafe;
  color: #1e40af;
}

.badge-employee {
  background: #d1fae5;
  color: #065f46;
}

.badge-mode {
  background: #f3f4f6;
  color: #374151;
  text-transform: none;
  font-weight: 500;
  font-size: 0.7rem;
}

.user-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  flex-shrink: 0;
}

.btn-action {
  padding: 0.3rem 0.7rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}
.btn-edit:hover {
  background: #bfdbfe;
}

.btn-role {
  background: #fef3c7;
  color: #92400e;
}
.btn-role:hover {
  background: #fde68a;
}

.btn-mode {
  background: #d1fae5;
  color: #065f46;
}
.btn-mode:hover {
  background: #a7f3d0;
}

.btn-password {
  background: #ede9fe;
  color: #5b21b6;
}
.btn-password:hover {
  background: #ddd6fe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}
.btn-delete:hover {
  background: #fecaca;
}
</style>
