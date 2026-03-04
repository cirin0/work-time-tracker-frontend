<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { getAvatarUrl } from '@/core/utils/url'
import { formatDate } from '@/core/utils/date'
import InputField from '@/components/ui/InputField.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  SetupPinCodeRequest,
  ChangePinCodeRequest,
} from '@/types/requests/profileRequest.interface'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const store = useProfileStore()
const router = useRouter()

const imageKey = ref(0)

watch(
  () => store.profile?.avatar,
  () => {
    imageKey.value++
  },
)

const avatarUrl = computed(() => getAvatarUrl(store.displayProfile?.avatar))

const managerAvatarUrl = computed(() => getAvatarUrl(store.displayProfile?.manager?.avatar))

const isEditMode = ref(false)
const editForm = ref<UpdateProfileRequest>({
  name: '',
  email: '',
})
const formError = ref<string | null>(null)

// Password change modal
const isPasswordModalOpen = ref(false)
const passwordForm = ref<ChangePasswordRequest>({
  current_password: '',
  new_password: '',
  code: '',
  new_password_confirmation: '',
})
const passwordError = ref<string | null>(null)

// PIN code modals
const isPinSetupModalOpen = ref(false)
const isPinChangeModalOpen = ref(false)
const pinSetupForm = ref<SetupPinCodeRequest>({
  pin_code: '',
})
const pinChangeForm = ref<ChangePinCodeRequest>({
  current_pin_code: '',
  new_pin_code: '',
})
const pinError = ref<string | null>(null)

const avatarInput = ref<HTMLInputElement | null>(null)
const isUploadingAvatar = ref(false)

function openEditMode() {
  if (store.displayProfile) {
    editForm.value = {
      name: store.displayProfile.name,
      email: store.displayProfile.email,
    }
  }
  formError.value = null
  isEditMode.value = true
}

function cancelEdit() {
  isEditMode.value = false
  formError.value = null
}

async function saveProfile() {
  if (!editForm.value.name?.trim()) {
    formError.value = "Ім'я не може бути порожнім"
    return
  }

  if (!editForm.value.email?.trim()) {
    formError.value = 'Email не може бути порожнім'
    return
  }

  try {
    await store.updateProfile(editForm.value)
    isEditMode.value = false
    formError.value = null
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Помилка оновлення профілю'
  }
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    formError.value = 'Будь ласка, виберіть файл зображення'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    formError.value = 'Розмір файлу не повинен перевищувати 5 МБ'
    return
  }

  isUploadingAvatar.value = true
  formError.value = null

  try {
    await store.updateAvatar(file)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'Помилка завантаження аватару'
  } finally {
    isUploadingAvatar.value = false
    if (input) input.value = ''
  }
}

// Password change functions
function openPasswordModal() {
  passwordForm.value = {
    current_password: '',
    new_password: '',
    code: '',
    new_password_confirmation: '',
  }
  passwordError.value = null
  isPasswordModalOpen.value = true
}

function cancelPasswordChange() {
  isPasswordModalOpen.value = false
  passwordError.value = null
}

async function changePassword() {
  if (!passwordForm.value.current_password) {
    passwordError.value = 'Введіть поточний пароль'
    return
  }

  if (!passwordForm.value.new_password) {
    passwordError.value = 'Введіть новий пароль'
    return
  }

  if (passwordForm.value.new_password.length < 8) {
    passwordError.value = 'Новий пароль повинен містити мінімум 8 символів'
    return
  }

  if (passwordForm.value.code && passwordForm.value.code.length !== 6) {
    passwordError.value = 'Код підтвердження повинен містить 6 символів'
    return
  }

  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    passwordError.value = 'Паролі не співпадають'
    return
  }

  try {
    await store.changePassword(passwordForm.value)
    isPasswordModalOpen.value = false
    passwordError.value = null
    alert('Пароль успішно змінено')
  } catch (error) {
    passwordError.value = error instanceof Error ? error.message : 'Помилка зміни пароля'
  }
}

function openPinSetupModal() {
  pinSetupForm.value = { pin_code: '' }
  pinError.value = null
  isPinSetupModalOpen.value = true
}

function openPinChangeModal() {
  pinChangeForm.value = {
    current_pin_code: '',
    new_pin_code: '',
  }
  pinError.value = null
  isPinChangeModalOpen.value = true
}

function cancelPinSetup() {
  isPinSetupModalOpen.value = false
  pinError.value = null
}

function cancelPinChange() {
  isPinChangeModalOpen.value = false
  pinError.value = null
}

async function setupPinCode() {
  if (!pinSetupForm.value.pin_code) {
    pinError.value = 'Введіть PIN код'
    return
  }

  if (pinSetupForm.value.pin_code.length !== 4) {
    pinError.value = 'PIN код повинен містити 4 цифри'
    return
  }

  try {
    await store.setupPinCode(pinSetupForm.value)
    isPinSetupModalOpen.value = false
    pinError.value = null
    alert('PIN код успішно налаштовано')
  } catch (error) {
    pinError.value = error instanceof Error ? error.message : 'Помилка налаштування PIN коду'
  }
}

async function changePinCode() {
  if (!pinChangeForm.value.current_pin_code) {
    pinError.value = 'Введіть поточний PIN код'
    return
  }

  if (!pinChangeForm.value.new_pin_code) {
    pinError.value = 'Введіть новий PIN код'
    return
  }

  if (pinChangeForm.value.new_pin_code.length !== 4) {
    pinError.value = 'Новий PIN код повинен містити 4 цифри'
    return
  }

  try {
    await store.changePinCode(pinChangeForm.value)
    isPinChangeModalOpen.value = false
    pinError.value = null
    alert('PIN код успішно змінено')
  } catch (error) {
    pinError.value = error instanceof Error ? error.message : 'Помилка зміни PIN коду'
  }
}

function getWorkModeLabel(mode?: string): string {
  const labels: Record<string, string> = {
    office: 'Офіс',
    remote: 'Віддалено',
    hybrid: 'Гібрид',
  }
  return mode ? labels[mode] || mode : 'Не вказано'
}
</script>

<template>
  <div class="profile-page">
    <PageHeader title="Профіль" />

    <LoadingSpinner v-if="store.isLoading" text="Завантаження..." />

    <div v-else-if="store.error" class="error-state">
      <h2>Помилка завантаження</h2>
      <p>{{ store.error }}</p>
      <button class="btn-primary" @click="store.fetchProfile()">Спробувати ще раз</button>
    </div>

    <div v-else-if="store.displayProfile" class="profile-content">
      <div v-if="isEditMode" class="modal-overlay" @click.self="cancelEdit">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Редагувати профіль</h2>
          </div>

          <div class="modal-body">
            <div v-if="formError" class="error-message">
              {{ formError }}
            </div>

            <div class="form-group">
              <InputField
                name="name"
                label="Ім'я"
                v-model="editForm.name"
                type="text"
                placeholder="Введіть ім'я"
              />
            </div>

            <div class="form-group">
              <InputField
                name="email"
                label="Email"
                v-model="editForm.email"
                type="email"
                placeholder="Введіть email"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="cancelEdit" :disabled="store.isSaving">
              Скасувати
            </button>
            <button class="btn-primary" @click="saveProfile" :disabled="store.isSaving">
              {{ store.isSaving ? 'Збереження...' : 'Зберегти' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="isPasswordModalOpen" class="modal-overlay" @click.self="cancelPasswordChange">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Зміна пароля</h2>
          </div>

          <div class="modal-body">
            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>

            <div class="form-group">
              <InputField
                name="code"
                label="Код підтвердження (якщо увімкнено 2FA)"
                v-model="passwordForm.code"
                type="text"
                placeholder="Введіть код підтвердження"
              />
            </div>

            <div class="form-group">
              <InputField
                name="current_password"
                label="Поточний пароль"
                v-model="passwordForm.current_password"
                type="password"
                placeholder="Введіть поточний пароль"
              />
            </div>

            <div class="form-group">
              <InputField
                name="new_password"
                label="Новий пароль"
                v-model="passwordForm.new_password"
                type="password"
                placeholder="Введіть новий пароль (мінімум 8 символів)"
              />
            </div>

            <div class="form-group">
              <InputField
                name="new_password_confirmation"
                label="Підтвердження пароля"
                v-model="passwordForm.new_password_confirmation"
                type="password"
                placeholder="Повторно введіть новий пароль"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="cancelPasswordChange" :disabled="store.isSaving">
              Скасувати
            </button>
            <button class="btn-primary" @click="changePassword" :disabled="store.isSaving">
              {{ store.isSaving ? 'Збереження...' : 'Змінити пароль' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Setup PIN Code Modal -->
      <div v-if="isPinSetupModalOpen" class="modal-overlay" @click.self="cancelPinSetup">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Налаштування PIN коду</h2>
          </div>

          <div class="modal-body">
            <div v-if="pinError" class="error-message">
              {{ pinError }}
            </div>

            <div class="form-group">
              <InputField
                name="pin_code"
                label="PIN код (4 цифри)"
                v-model="pinSetupForm.pin_code"
                type="password"
                placeholder="Введіть 4-значний PIN код"
                maxlength="4"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="cancelPinSetup" :disabled="store.isSaving">
              Скасувати
            </button>
            <button class="btn-primary" @click="setupPinCode" :disabled="store.isSaving">
              {{ store.isSaving ? 'Збереження...' : 'Налаштувати PIN' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Change PIN Code Modal -->
      <div v-if="isPinChangeModalOpen" class="modal-overlay" @click.self="cancelPinChange">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Зміна PIN коду</h2>
          </div>

          <div class="modal-body">
            <div v-if="pinError" class="error-message">
              {{ pinError }}
            </div>

            <div class="form-group">
              <InputField
                name="current_pin_code"
                label="Поточний PIN код"
                v-model="pinChangeForm.current_pin_code"
                type="password"
                placeholder="Введіть поточний PIN код"
                maxlength="4"
              />
            </div>

            <div class="form-group">
              <InputField
                name="new_pin_code"
                label="Новий PIN код"
                v-model="pinChangeForm.new_pin_code"
                type="password"
                placeholder="Введіть новий 4-значний PIN код"
                maxlength="4"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="cancelPinChange" :disabled="store.isSaving">
              Скасувати
            </button>
            <button class="btn-primary" @click="changePinCode" :disabled="store.isSaving">
              {{ store.isSaving ? 'Збереження...' : 'Змінити PIN' }}
            </button>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-container">
              <img
                v-if="avatarUrl"
                :key="`profile-${imageKey}`"
                :src="avatarUrl"
                alt="Аватар користувача"
                class="avatar"
              />
              <div v-else class="avatar-placeholder">
                <span>{{ store.displayProfile?.name?.charAt(0).toUpperCase() || '?' }}</span>
              </div>
              <div v-if="isUploadingAvatar" class="avatar-loading">
                <span>Завантаження...</span>
              </div>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarChange"
            />
            <button
              class="btn-secondary"
              @click="triggerAvatarUpload"
              :disabled="isUploadingAvatar"
            >
              {{ isUploadingAvatar ? 'Завантаження...' : 'Змінити фото' }}
            </button>
          </div>

          <div class="profile-info">
            <h2 class="profile-name">{{ store.displayProfile.name }}</h2>
            <p class="profile-email">{{ store.displayProfile.email }}</p>
            <span class="role-badge" :class="`role-${store.displayProfile.role}`">
              {{ store.displayProfile.role }}
            </span>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">Ім'я</span>
            <span class="detail-value">{{ store.displayProfile.name }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ store.displayProfile.email }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Роль</span>
            <span class="detail-value">{{ store.displayProfile.role }}</span>
          </div>

          <div v-if="store.displayProfile.work_mode" class="detail-row">
            <span class="detail-label">Режим роботи</span>
            <span class="detail-value">{{ getWorkModeLabel(store.displayProfile.work_mode) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">PIN код</span>
            <span class="detail-value">
              {{ store.displayProfile.has_pin_code ? '✓ Налаштовано' : '✗ Не налаштовано' }}
            </span>
          </div>

          <div v-if="store.displayProfile.manager" class="detail-row manager-row">
            <span class="detail-label">Менеджер</span>
            <div class="manager-info">
              <div class="manager-avatar-container">
                <img
                  v-if="managerAvatarUrl"
                  :src="managerAvatarUrl"
                  alt="Аватар менеджера"
                  class="manager-avatar"
                />
                <div v-else class="manager-avatar-placeholder">
                  <span>{{ store.displayProfile.manager.name.charAt(0).toUpperCase() }}</span>
                </div>
              </div>
              <div class="manager-details">
                <div class="manager-name">{{ store.displayProfile.manager.name }}</div>
                <div class="manager-email">{{ store.displayProfile.manager.email }}</div>
              </div>
            </div>
          </div>

          <div v-if="store.displayProfile.company" class="detail-row">
            <span class="detail-label">Компанія</span>
            <button class="company-link" @click="router.push({ name: 'company' })">
              🏢 {{ store.displayProfile.company.name }}
            </button>
          </div>

          <div v-if="store.displayProfile.work_schedule" class="detail-row">
            <span class="detail-label">Графік роботи</span>
            <span class="detail-value">{{ store.displayProfile.work_schedule.name }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Дата реєстрації</span>
            <span class="detail-value"> {{ formatDate(store.displayProfile.created_at) }}</span>
          </div>
        </div>

        <div class="profile-actions">
          <button class="btn-primary" @click="openEditMode">Редагувати профіль</button>
          <button class="btn-secondary" @click="openPasswordModal">Змінити пароль</button>
          <button
            v-if="!store.displayProfile.has_pin_code"
            class="btn-secondary"
            @click="openPinSetupModal"
          >
            Налаштувати PIN
          </button>
          <button
            v-if="store.displayProfile.has_pin_code"
            class="btn-secondary"
            @click="openPinChangeModal"
          >
            Змінити PIN
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  background: white;
  position: relative;
}

.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading p {
  color: #6b7280;
  font-size: 1.125rem;
}

.error-state {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.error-state h2 {
  color: #991b1b;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.error-state p {
  color: #7f1d1d;
  margin-bottom: 1rem;
}

.profile-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-card {
  padding: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder span {
  color: white;
  font-size: 3rem;
  font-weight: 700;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.profile-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.profile-email {
  color: #6b7280;
  font-size: 1.125rem;
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
  margin-top: 0.5rem;
}

.role-admin {
  background: #fef3c7;
  color: #92400e;
}

.role-manager {
  background: #dbeafe;
  color: #1e40af;
}

.role-employee {
  background: #d1fae5;
  color: #065f46;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.detail-row.manager-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.manager-avatar-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.manager-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.manager-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.manager-avatar-placeholder span {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
}

.manager-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.manager-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.manager-email {
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  color: #1f2937;
  font-size: 1rem;
}

.company-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.company-link:hover {
  background: #ddd6fe;
  transform: translateY(-1px);
}

.profile-actions {
  display: flex;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 1.5rem;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-actions {
    flex-direction: column;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .detail-row.manager-row {
    gap: 0.75rem;
  }

  .manager-info {
    width: 100%;
  }
}
</style>
