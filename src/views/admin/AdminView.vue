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
import type { CreateCompanyRequest } from '@/types/requests/companyRequest.interface'

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
    // Load company data if exists
    const companyId = authStore.currentUser?.company?.id
    if (companyId) {
      await companyStore.fetchById(companyId)
    }

    // Load users to check if any managers exist
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
      // Fetch full company data to update store
      await companyStore.fetchById(company.id)
    }
  } catch {
    createModalRef.value?.setError(companyStore.error ?? 'Помилка створення компанії')
  } finally {
    isSubmittingCreate.value = false
  }
}

async function handleAssignManager(managerId: number) {
  const companyId = authStore.currentUser?.company?.id
  if (!companyId) return

  isSubmittingAssign.value = true
  try {
    await companyStore.assignManager(companyId, managerId)
    showAssignManagerModal.value = false
    // Refresh company data
    await companyStore.fetchById(companyId)
    // Refresh user list to update manager status
    await adminStore.fetchAllUsers(1)
    // Update auth store company reference
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
      <p class="subtitle">Управління системою</p>
    </div>

    <div v-if="!isAdmin" class="access-denied">
      <h2>Доступ заборонено</h2>
      <p>У вас немає прав для перегляду цієї сторінки</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- Loading state -->
      <div v-if="isLoadingInitialData" class="loading-state">
        <div class="spinner"></div>
        <p>Завантаження...</p>
      </div>

      <!-- Company not created notice -->
      <div v-else-if="!hasCompany" class="no-company-banner">
        <div class="banner-icon">🏢</div>
        <div class="banner-content">
          <h3>Компанія не створена</h3>
          <p>Для початку роботи системи спочатку створіть компанію</p>
        </div>
        <button class="btn-create-company" @click="showCreateModal = true">
          Створити компанію
        </button>
      </div>

      <!-- Company exists - show content -->
      <template v-else>
        <!-- No manager role in system -->
        <div v-if="!hasManager && !hasAnyManager" class="no-manager-role-banner">
          <div class="banner-icon">⚙️</div>
          <div class="banner-content">
            <h3>Створіть менеджера</h3>
            <p>
              Спочатку призначте роль "Менеджер" одному з користувачів у списку нижче, а потім
              зможете призначити його менеджером компанії
            </p>
          </div>
        </div>

        <!-- Manager exists but not assigned -->
        <div v-else-if="!hasManager && hasAnyManager" class="no-manager-banner">
          <div class="banner-icon">👤</div>
          <div class="banner-content">
            <h3>Менеджер не призначений</h3>
            <p>Призначте менеджера для управління компанією</p>
          </div>
          <button class="btn-assign-manager" @click="showAssignManagerModal = true">
            Призначити менеджера
          </button>
        </div>

        <!-- Quick actions - only when fully configured -->
        <div v-if="hasManager" class="quick-actions">
          <button class="quick-action-btn" @click="viewCompany">
            <span class="qa-icon">🏢</span>
            <span class="qa-label">Компанія</span>
          </button>
        </div>

        <!-- Main Layout -->
        <div class="two-column-layout">
          <div class="left-column">
            <div class="content-section">
              <div class="section-header"></div>
              <AdminUsersList />
            </div>
          </div>

          <div v-if="hasManager" class="right-column">
            <QRCodeDisplay />
          </div>
        </div>
      </template>
    </div>

    <!-- Create Company Modal -->
    <AdminCompanyCreateModal
      ref="createModalRef"
      :show="showCreateModal"
      :is-submitting="isSubmittingCreate"
      @close="showCreateModal = false"
      @submit="handleCreateSubmit"
    />

    <!-- Assign Manager Modal -->
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
}

.panel-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.access-denied {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.access-denied h2 {
  color: #dc2626;
  margin-bottom: 0.5rem;
}

/* No Company Banner */
.no-company-banner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
  border: 2px solid #dbeafe;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.banner-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.banner-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.375rem;
}

.banner-content p {
  color: #4b5563;
  font-size: 0.95rem;
}

.btn-create-company {
  padding: 0.75rem 1.75rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-create-company:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

/* No Manager Role Banner */
.no-manager-role-banner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #86efac;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.no-manager-role-banner .banner-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.no-manager-role-banner .banner-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 0.375rem;
}

.no-manager-role-banner .banner-content p {
  color: #15803d;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* No Manager Banner */
.no-manager-banner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.no-manager-banner .banner-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.no-manager-banner .banner-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.375rem;
}

.no-manager-banner .banner-content p {
  color: #78350f;
  font-size: 0.95rem;
}

.btn-assign-manager {
  padding: 0.75rem 1.75rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.btn-assign-manager:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.loading-state p {
  color: #6b7280;
  font-size: 0.95rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.quick-action-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.qa-icon {
  font-size: 1.1rem;
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

@media (max-width: 1100px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .right-column {
    order: -1;
  }
}

.left-column,
.right-column {
  min-width: 0;
}

.content-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}
</style>
