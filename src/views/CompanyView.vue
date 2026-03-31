<script setup lang="ts">
import { computed, ref } from 'vue'
import { getAvatarUrl } from '@/core/utils/url'
import { formatDate } from '@/core/utils/date'
import AdminCompanyEditModal from '@/components/admin/AdminCompanyEditModal.vue'
import { useCompanyView } from '@/composables/useCompanyView'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const {
  companyStore,
  company,
  companyId,
  logoUrl,
  isAdmin,
  showEditModal,
  isSubmittingEdit,
  editModalRef,
  isUploadingLogo,
  logoInputRef,
  employeeSearchQuery,
  selectedEmployee,
  employeeSearchResults,
  isAddingEmployee,
  addEmployeeError,
  addEmployeeSuccess,
  removeEmployeeError,
  logoUploadError,
  handleEditSubmit,
  triggerLogoUpload,
  handleLogoChange,
  onEmployeeSearchInput,
  selectEmployee,
  handleAddEmployee,
  handleRemoveEmployee,
  goToUser,
} = useCompanyView()

const employeeSearch = ref('')
const companyEmployees = computed(() => {
  const list = [...(company.value?.employees ?? [])]
  const manager = company.value?.manager
  if (manager && !list.some((e) => e.id === manager.id)) {
    list.unshift(manager)
  }
  return list
})
const filteredCompanyEmployees = computed(() => {
  const q = employeeSearch.value.toLowerCase().trim()
  if (!q) return companyEmployees.value
  return companyEmployees.value.filter(
    (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
  )
})
const managerId = computed(() => company.value?.manager?.id ?? null)
</script>

<template>
  <div class="company-view">
    <PageHeader title="Компанія" subtitle="Інформація про вашу компанію" />

    <LoadingSpinner v-if="companyStore.isLoading" text="Завантаження..." />

    <div v-else-if="!companyId" class="empty-state">
      <div class="empty-icon">🏢</div>
      <p>Ви не прикріплені до жодної компанії.</p>
    </div>

    <div v-else-if="!company" class="empty-state">
      <div class="empty-icon">⚠️</div>
      <p>Дані компанії не знайдені.</p>
      <button class="btn-primary" @click="companyId && companyStore.fetchById(companyId)">
        Спробувати знову
      </button>
    </div>

    <div v-else class="content">
      <!-- Company Hero Card -->
      <div class="company-card">
        <div class="company-hero">
          <div class="logo-column">
            <div class="logo-wrapper">
              <img v-if="logoUrl" :src="logoUrl" alt="Лого компанії" class="company-logo" />
              <div v-else class="logo-placeholder">
                {{ company.name.charAt(0).toUpperCase() }}
              </div>
              <button
                v-if="isAdmin"
                class="btn-logo-upload"
                :disabled="isUploadingLogo"
                title="Змінити логотип"
                @click="triggerLogoUpload"
              >
                {{ isUploadingLogo ? '⌛' : '📷' }}
              </button>
              <input
                ref="logoInputRef"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="handleLogoChange"
              />
            </div>
            <p v-if="logoUploadError" class="field-error">{{ logoUploadError }}</p>
          </div>

          <div class="company-title">
            <h2>{{ company.name }}</h2>
            <div class="company-badges">
              <span class="badge-employees"> 👥 {{ companyEmployees.length }} співробітників </span>
              <span v-if="company.work_schedules?.length" class="badge-schedules">
                📅 {{ company.work_schedules.length }} графік(ів)
              </span>
            </div>
            <p v-if="company.description" class="company-description">{{ company.description }}</p>
          </div>

          <button v-if="isAdmin" class="btn-edit" @click="showEditModal = true">
            ✏️ Редагувати
          </button>
        </div>

        <!-- Info Grid -->
        <div class="info-grid">
          <div v-if="company.manager" class="info-item">
            <span class="info-label">Менеджер</span>
            <div class="manager-chip">
              <div class="manager-avatar-sm">
                <img
                  v-if="getAvatarUrl(company.manager.avatar)"
                  :src="getAvatarUrl(company.manager.avatar)!"
                  :alt="company.manager.name"
                  class="manager-avatar-img"
                />
                <span v-else>{{ company.manager.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="manager-chip-info">
                <span class="manager-chip-name">{{ company.manager.name }}</span>
                <span class="manager-chip-email">{{ company.manager.email }}</span>
              </div>
            </div>
          </div>
          <div v-else class="info-item">
            <span class="info-label">Менеджер</span>
            <span class="info-value muted">Не призначено</span>
          </div>

          <div v-if="company.email" class="info-item">
            <span class="info-label">Email</span>
            <a :href="`mailto:${company.email}`" class="info-value link">{{ company.email }}</a>
          </div>

          <div v-if="company.phone" class="info-item">
            <span class="info-label">Телефон</span>
            <a :href="`tel:${company.phone}`" class="info-value link">{{ company.phone }}</a>
          </div>

          <div v-if="company.address" class="info-item">
            <span class="info-label">Адреса</span>
            <span class="info-value">{{ company.address }}</span>
          </div>

          <div v-if="company.radius_meters" class="info-item">
            <span class="info-label">Радіус офісу</span>
            <span class="info-value">{{ company.radius_meters }} м</span>
          </div>

          <div v-if="company.latitude && company.longitude" class="info-item">
            <span class="info-label">Координати</span>
            <a
              :href="`https://www.google.com/maps?q=${company.latitude},${company.longitude}`"
              target="_blank"
              rel="noopener noreferrer"
              class="info-value link"
            >
              {{ Number(company.latitude).toFixed(5) }},
              {{ Number(company.longitude).toFixed(5) }} 🗺️
            </a>
          </div>

          <div class="info-item">
            <span class="info-label">Дата створення</span>
            <span class="info-value">{{ formatDate(company.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Work Schedules -->
      <div v-if="company.work_schedules && company.work_schedules.length" class="section-card">
        <div class="section-header">
          <h3>Графіки роботи</h3>
          <span class="count-badge">{{ company.work_schedules.length }}</span>
        </div>
        <ul class="schedules-list">
          <li v-for="schedule in company.work_schedules" :key="schedule.id" class="schedule-item">
            <span class="schedule-icon">📅</span>
            <span class="schedule-name">{{ schedule.name }}</span>
          </li>
        </ul>
      </div>

      <!-- Employees Section (all roles) -->
      <div class="section-card">
        <div class="section-header">
          <h3>Співробітники</h3>
          <span class="count-badge">
            {{ employeeSearch ? `${filteredCompanyEmployees.length} / ${companyEmployees.length}` : companyEmployees.length }}
          </span>
        </div>

        <!-- Add Employee Form (Improved Autocomplete) -->
        <div v-if="isAdmin" class="add-employee-container">
          <div class="add-employee-form">
            <div class="employee-search-wrap">
              <input
                v-model="employeeSearchQuery"
                type="text"
                placeholder="Пошук користувачів (ім'я або email)..."
                class="id-input"
                @input="onEmployeeSearchInput"
                autocomplete="off"
              />
              <ul v-if="employeeSearchResults.length && !selectedEmployee" class="search-dropdown">
                <li
                  v-for="user in employeeSearchResults"
                  :key="user.id"
                  class="search-dropdown-item"
                  @click="selectEmployee(user)"
                >
                  <span class="dropdown-name">{{ user.name }}</span>
                  <span class="dropdown-email">{{ user.email }}</span>
                </li>
              </ul>
            </div>
            <button
              class="btn-add"
              :disabled="isAddingEmployee || !selectedEmployee"
              @click="handleAddEmployee"
            >
              {{ isAddingEmployee ? 'Зачекайте...' : '+ Додати' }}
            </button>
          </div>
          <p v-if="addEmployeeError" class="add-error">{{ addEmployeeError }}</p>
          <p v-if="addEmployeeSuccess" class="add-success">{{ addEmployeeSuccess }}</p>
        </div>

        <div class="search-employees">
          <div class="employee-search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="employeeSearch"
              type="text"
              placeholder="Пошук за іменем або email..."
              class="employee-search-input"
            />
            <button
              v-if="employeeSearch"
              class="search-clear-btn"
              title="Очистити пошук"
              @click="employeeSearch = ''"
            >
              ✕
            </button>
          </div>
        </div>

        <p v-if="removeEmployeeError" class="field-error">{{ removeEmployeeError }}</p>

        <div v-if="companyStore.isLoading" class="loading-inline">
          <div class="spinner-sm" />
          Завантаження списку...
        </div>
        <div v-else-if="companyEmployees.length === 0" class="empty-employees">
          Немає прикріплених співробітників
        </div>
        <div v-else-if="filteredCompanyEmployees.length === 0" class="empty-employees">
          <span class="empty-search-icon">🔍</span>
          <span>Співробітників за запитом <strong>"{{ employeeSearch }}"</strong> не знайдено</span>
        </div>
        <ul v-else class="employees-list">
          <li v-for="user in filteredCompanyEmployees" :key="user.id" class="employee-item">
            <div class="employee-avatar" @click="goToUser(user.id)">
              <img
                v-if="getAvatarUrl(user.avatar)"
                :src="getAvatarUrl(user.avatar)!"
                :alt="user.name"
                class="employee-avatar-img"
              />
              <span v-else>{{ user.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="employee-info" @click="goToUser(user.id)">
              <div class="employee-name-row">
                <span class="employee-name">{{ user.name }}</span>
                <span v-if="user.id === managerId" class="role-badge-manager">👔 Менеджер</span>
              </div>
              <span class="employee-email">{{ user.email }}</span>
            </div>
            <div class="employee-actions">
              <button class="btn-view" @click="goToUser(user.id)">Переглянути</button>
              <button
                v-if="isAdmin && user.id !== managerId"
                class="btn-remove"
                @click="handleRemoveEmployee(user.id)"
              >
                Видалити
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Edit Modal -->
    <AdminCompanyEditModal
      ref="editModalRef"
      :show="showEditModal"
      :company="company"
      :is-submitting="isSubmittingEdit"
      @close="showEditModal = false"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<style scoped>
.company-view {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 2rem;
}

/* ── States ── */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: var(--text-muted);
}
.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.spinner-sm {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--border);
  border-top-color: var(--accent-2);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 0.4rem;
}
/* ── Layout ── */
.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.company-card,
.section-card {
  background: var(--surface);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 12px var(--shadow);
  border: 1px solid var(--border);
}

/* ── Company hero ── */
.company-hero {
  display: flex;
  align-items: flex-start;
  gap: 1.75rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.logo-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.375rem;
  flex-shrink: 0;
}
.logo-wrapper {
  position: relative;
  flex-shrink: 0;
}

.company-logo {
  width: 96px;
  height: 96px;
  border-radius: 1.25rem;
  object-fit: cover;
  border: 2px solid var(--border);
}
.logo-placeholder {
  width: 96px;
  height: 96px;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  color: var(--header-text);
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-logo-upload {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.btn-logo-upload:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.btn-logo-upload:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}
.hidden-input {
  display: none;
}

.company-title {
  flex: 1;
  min-width: 200px;
}
.company-title h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.625rem;
}

.company-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.875rem;
}
.badge-employees,
.badge-schedules {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid transparent;
}
.badge-employees {
  background: var(--role-employee-bg);
  color: var(--role-employee-color);
  border-color: var(--role-employee-border);
}
.badge-schedules {
  background: var(--role-manager-bg);
  color: var(--role-manager-color);
  border-color: var(--role-manager-border);
}
.company-description {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.6;
}

.btn-edit {
  padding: 0.625rem 1.375rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  align-self: flex-start;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.btn-edit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
  filter: brightness(1.05);
}

.btn-edit:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}

/* ── Info grid ── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem;
  background: var(--sand-light);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}
.info-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.info-value {
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 500;
}
.info-value.muted {
  color: var(--text-muted);
  font-style: italic;
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

/* ── Manager chip ── */
.manager-chip {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-top: 0.1rem;
}
.manager-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--manager-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 700;
}
.manager-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.manager-chip-info {
  display: flex;
  flex-direction: column;
}
.manager-chip-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}
.manager-chip-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ── Section ── */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.section-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
}
.count-badge {
  background: var(--sand-light);
  color: var(--accent-1);
  border: 1px solid var(--border);
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
}

/* ── Work schedules ── */
.schedules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.schedule-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--sand-light);
  border: 1px solid var(--border);
  border-radius: 0.625rem;
  font-size: 0.875rem;
  color: var(--text);
  font-weight: 500;
}

/* ── Employee search (Current list) ── */
.search-employees {
  margin-bottom: 0.875rem;
}
.employee-search-box {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 0.85rem;
  font-size: 0.85rem;
  pointer-events: none;
  opacity: 0.5;
}
.employee-search-input {
  width: 100%;
  padding: 0.6rem 2.5rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 0.625rem;
  font-size: 0.9rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.employee-search-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.1);
}
.search-clear-btn {
  position: absolute;
  right: 0.6rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  border-radius: 50%;
  line-height: 1;
  transition: color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-clear-btn:hover {
  color: var(--text);
  background: var(--surface-hover);
}
.empty-search-icon {
  display: block;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.4;
}

/* ── Add Employee (Autocomplete) ── */
.add-employee-container {
  background: var(--surface-hover);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
}

.add-employee-form {
  display: flex;
  gap: 0.75rem;
  position: relative;
}

.employee-search-wrap {
  flex: 1;
  position: relative;
}

.id-input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
  outline: none;
  background: var(--surface);
  color: var(--text);
  transition: all 0.2s;
}

.id-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 3px rgba(255, 155, 81, 0.2);
}

.btn-add {
  padding: 0 1.5rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
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
  filter: grayscale(0.5);
  cursor: not-allowed;
}

/* Dropdown */
.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.search-dropdown-item {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: background 0.2s;
}

.search-dropdown-item:hover {
  background: rgba(255, 155, 81, 0.08);
}

.dropdown-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
}

.dropdown-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.add-error {
  color: var(--error-text);
  font-size: 0.8rem;
  margin: 0.5rem 0 0 0;
}

.add-success {
  color: #10b981;
  font-size: 0.8rem;
  margin: 0.5rem 0 0 0;
}

.id-input:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-2) 25%, transparent);
}

.btn-add {
  padding: 0.625rem 1.375rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.btn-add:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
  filter: brightness(1.05);
}

.btn-add:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}
.btn-add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── Employees list ── */
.field-error {
  color: var(--error-text);
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}
.loading-inline {
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 1.5rem 0;
  display: flex;
  align-items: center;
}
.empty-employees {
  color: var(--text-muted);
  font-size: 0.9rem;
  padding: 2rem 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}

.employees-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.employee-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}
.employee-item:hover {
  border-color: var(--accent-2);
  box-shadow: 0 2px 8px var(--shadow);
}

.employee-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--header-text);
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
}
.employee-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.employee-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.employee-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}
.employee-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.role-badge-manager {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--role-manager-bg);
  color: var(--role-manager-color);
  border: 1px solid var(--role-manager-border);
  white-space: nowrap;
}
.employee-email {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.employee-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-view {
  padding: 0.375rem 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--accent-1);
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}
.btn-view:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.btn-view:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}
.btn-remove {
  padding: 0.375rem 0.875rem;
  background: var(--surface);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  border-radius: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}
.btn-remove:hover {
  background: var(--error-bg);
  transform: translateY(-1px);
}

.btn-remove:focus-visible {
  outline: 2px solid var(--error-text);
  outline-offset: 3px;
}

.btn-primary {
  margin-top: 1rem;
  padding: 0.625rem 1.5rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
  filter: brightness(1.05);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 3px;
}

@media (max-width: var(--bp-md)) {
  .company-view {
    padding: 1rem;
  }
  .company-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
  .employee-item {
    flex-wrap: wrap;
  }
  .employee-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
