<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useCompanyStore } from '@/stores/company.store'
import { useAdminStore } from '@/stores/admin.store'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { UserRole } from '@/types/enums/enums.types'
import QRCodeDisplay from '@/components/qr-code/QRCodeDisplay.vue'
import AdminUsersList from '@/components/admin/AdminUsersList.vue'
import AdminCompanyCreateModal from '@/components/admin/AdminCompanyCreateModal.vue'
import AdminAssignManagerModal from '@/components/admin/AdminAssignManagerModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Card from '@/components/ui/Card.vue'
import ButtonMain from '@/components/ui/ButtonMain.vue'
import type { CreateCompanyRequest } from '@/types/requests/companyRequest.interface'
import BuildingIcon from '@/icons/BuildingIcon.vue'
import DocumentTextIcon from '@/icons/DocumentTextIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const adminStore = useAdminStore()
const { isAdmin } = useRoleGuard()

const showCreateModal = ref(false)
const isSubmittingCreate = ref(false)
const createModalRef = ref<InstanceType<typeof AdminCompanyCreateModal> | null>(null)

const showAssignManagerModal = ref(false)
const isSubmittingAssign = ref(false)
const assignManagerModalRef = ref<InstanceType<typeof AdminAssignManagerModal> | null>(null)

const isLoadingInitialData = ref(true)

const hasCompany = computed(() => !!authStore.currentUser?.company)
const hasManager = computed(() => !!companyStore.company?.manager)
const hasAnyManager = computed(() =>
  adminStore.users.some(
    (user) => user.role === UserRole.MANAGER && user.id !== authStore.currentUser?.id,
  ),
)

onMounted(async () => {
  isLoadingInitialData.value = true

  try {
    if (hasCompany.value) {
      await companyStore.fetchCompany()
    }

    await adminStore.fetchAllUsers(1)
  } finally {
    isLoadingInitialData.value = false
  }
})

function viewCompany() {
  router.push({ name: 'company' })
}

async function handleCreateSubmit(payload: CreateCompanyRequest) {
  isSubmittingCreate.value = true
  try {
    const company = await companyStore.createCompany(payload)

    if (company) {
      if (authStore.currentUser) {
        authStore.currentUser.company = company
      }
      showCreateModal.value = false
      await companyStore.fetchCompany()
    }
  } catch {
    createModalRef.value?.setError(companyStore.error ?? 'Помилка створення компанії')
  } finally {
    isSubmittingCreate.value = false
  }
}

async function handleAssignManager(managerId: number) {
  isSubmittingAssign.value = true
  try {
    await companyStore.assignManager(managerId)
    showAssignManagerModal.value = false
    await companyStore.fetchCompany()
    await adminStore.fetchAllUsers(1)
    if (authStore.currentUser && companyStore.company) {
      authStore.currentUser.company = companyStore.company
    }
  } catch {
    assignManagerModalRef.value?.setError(companyStore.error ?? 'Помилка призначення менеджера')
  } finally {
    isSubmittingAssign.value = false
  }
}
</script>

<template>
  <div class="admin-panel">
    <div class="panel-header">
      <h1>Панель адміністратора</h1>
    </div>

    <div v-if="!isAdmin" class="access-denied">
      <Card>
        <div class="denied-content">
          <h2>Доступ заборонено</h2>
          <p>У вас немає прав для перегляду цієї сторінки</p>
        </div>
      </Card>
    </div>

    <div v-else class="content-wrapper">
      <LoadingSpinner v-if="isLoadingInitialData" text="Завантаження..." />

      <template v-else-if="!hasCompany">
        <Card>
          <div class="info-card">
            <div class="info-icon"><BuildingIcon /></div>
            <div class="info-content">
              <h3>Компанія не створена</h3>
              <p>Для початку роботи системи спочатку створіть компанію</p>
            </div>
            <ButtonMain variant="primary" @click="showCreateModal = true">
              Створити компанію
            </ButtonMain>
          </div>
        </Card>
      </template>

      <!-- Company exists - show content -->
      <template v-else>
        <!-- No manager role in system -->
        <Card v-if="!hasManager && !hasAnyManager">
          <div class="info-card warning">
            <div class="info-icon"><UserIcon /></div>
            <div class="info-content">
              <h3>Створіть менеджера</h3>
              <p>
                Спочатку призначте роль "Менеджер" одному з користувачів у списку нижче, а потім
                зможете призначити його менеджером компанії
              </p>
            </div>
          </div>
        </Card>

        <!-- Manager exists but not assigned -->
        <Card v-else-if="!hasManager && hasAnyManager">
          <div class="info-card">
            <div class="info-icon"><UserIcon /></div>
            <div class="info-content">
              <h3>Менеджер не призначений</h3>
              <p>Призначте менеджера для управління компанією</p>
            </div>
            <ButtonMain variant="primary" @click="showAssignManagerModal = true">
              Призначити менеджера
            </ButtonMain>
          </div>
        </Card>

        <!-- Quick actions - only when fully configured -->
        <Card>
          <div class="quick-actions">
            <button class="quick-action-btn" @click="viewCompany">
              <span class="qa-icon"><BuildingIcon /></span>
              <span class="qa-label">Компанія</span>
            </button>
            <router-link :to="{ name: 'admin-audit-logs' }" class="quick-action-btn">
              <span class="qa-icon"><DocumentTextIcon /></span>
              <span class="qa-label">Журнал аудиту</span>
            </router-link>
          </div>
        </Card>

        <!-- Main Layout -->
        <div class="two-column-layout">
          <div class="left-column">
            <AdminUsersList />
          </div>

          <div v-if="hasManager" class="right-column">
            <QRCodeDisplay />
          </div>
        </div>
      </template>
    </div>

    <AdminCompanyCreateModal
      ref="createModalRef"
      :show="showCreateModal"
      :is-submitting="isSubmittingCreate"
      @close="showCreateModal = false"
      @submit="handleCreateSubmit"
    />

    <AdminAssignManagerModal
      ref="assignManagerModalRef"
      :show="showAssignManagerModal"
      :is-submitting="isSubmittingAssign"
      @close="showAssignManagerModal = false"
      @submit="handleAssignManager"
    />
  </div>
</template>

<style scoped>
.admin-panel {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
}

.panel-header h1 {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.access-denied {
  margin-bottom: 2rem;
}

.denied-content {
  text-align: center;
  padding: 2rem;
}

.denied-content h2 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--error-text);
  margin: 0 0 0.5rem 0;
}

.denied-content p {
  font-family: var(--font-body);
  color: var(--text-muted);
  margin: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Info Card */
.info-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
}

.info-card.warning {
  background: var(--sand-light);
  border-radius: 0.5rem;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.info-icon :deep(svg) {
  width: 2.5rem;
  height: 2.5rem;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-content h3 {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.375rem 0;
}

.info-content p {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.quick-action-btn:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.quick-action-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.qa-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
}

.qa-label {
  white-space: nowrap;
}

/* Main layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
  align-items: start;
}

.add-employee-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.id-input {
  flex: 1;
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  outline: none;
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.2s;
}

.id-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.1);
}

.id-input::placeholder {
  color: var(--text-muted);
}

.btn-add {
  padding: 0.6rem 1.25rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-add:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-error {
  color: var(--error-text);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.left-column,
.right-column {
  min-width: 0;
}

@media (max-width: 1024px) {
  .admin-panel {
    padding: 1.5rem;
  }

  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .right-column {
    order: -1;
  }

  .info-card {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
}

@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem;
  }

  .panel-header {
    margin-bottom: 1.5rem;
  }

  .panel-header h1 {
    font-size: 1.5rem;
  }

  .content-wrapper {
    gap: 1rem;
  }

  .info-card {
    padding: 1rem;
    gap: 1rem;
  }

  .info-content h3 {
    font-size: 1rem;
  }

  .info-content p {
    font-size: 0.875rem;
  }

  .quick-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .quick-action-btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  .two-column-layout {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .admin-panel {
    padding: 0.75rem;
  }

  .panel-header {
    margin-bottom: 1rem;
  }

  .panel-header h1 {
    font-size: 1.375rem;
  }

  .content-wrapper {
    gap: 0.875rem;
  }

  .info-card {
    padding: 0.875rem;
    gap: 0.875rem;
  }

  .info-icon {
    width: 2rem;
    height: 2rem;
  }

  .info-icon :deep(svg) {
    width: 2rem;
    height: 2rem;
  }

  .info-content h3 {
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .info-content p {
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .quick-action-btn {
    padding: 0.65rem 0.875rem;
    font-size: 0.875rem;
  }

  .qa-icon {
    width: 1rem;
    height: 1rem;
  }

  .denied-content {
    padding: 1.5rem 1rem;
  }

  .denied-content h2 {
    font-size: 1.125rem;
  }

  .denied-content p {
    font-size: 0.875rem;
  }
}
</style>
