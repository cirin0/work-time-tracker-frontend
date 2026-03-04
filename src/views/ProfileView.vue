<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { getAvatarUrl } from '@/core/utils/url'
import { formatDate } from '@/core/utils/date'
import InputField from '@/components/ui/InputField.vue'
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  SetupPinCodeRequest,
  ChangePinCodeRequest,
} from '@/types/requests/profileRequest.interface'

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

onMounted(() => {
  if (!store.displayProfile) store.fetchProfile()
})

const isEditMode = ref(false)
const editForm = ref<UpdateProfileRequest>({ name: '', email: '' })
const formError = ref<string | null>(null)

const isPasswordModalOpen = ref(false)
const passwordForm = ref<ChangePasswordRequest>({
  current_password: '',
  new_password: '',
  code: '',
  new_password_confirmation: '',
})
const passwordError = ref<string | null>(null)

const isPinSetupModalOpen = ref(false)
const isPinChangeModalOpen = ref(false)
const pinSetupForm = ref<SetupPinCodeRequest>({ pin_code: '' })
const pinChangeForm = ref<ChangePinCodeRequest>({ current_pin_code: '', new_pin_code: '' })
const pinError = ref<string | null>(null)

const avatarInput = ref<HTMLInputElement | null>(null)
const isUploadingAvatar = ref(false)

function openEditMode() {
  if (store.displayProfile) {
    editForm.value = { name: store.displayProfile.name, email: store.displayProfile.email }
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
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Помилка оновлення профілю'
  }
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
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Помилка завантаження аватару'
  } finally {
    isUploadingAvatar.value = false
    if (input) input.value = ''
  }
}

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
    passwordError.value = 'Код підтвердження повинен містити 6 символів'
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
  } catch (e) {
    passwordError.value = e instanceof Error ? e.message : 'Помилка зміни пароля'
  }
}

function openPinSetupModal() {
  pinSetupForm.value = { pin_code: '' }
  pinError.value = null
  isPinSetupModalOpen.value = true
}
function openPinChangeModal() {
  pinChangeForm.value = { current_pin_code: '', new_pin_code: '' }
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
  if (!pinSetupForm.value.pin_code || pinSetupForm.value.pin_code.length !== 4) {
    pinError.value = 'PIN код повинен містити 4 цифри'
    return
  }
  try {
    await store.setupPinCode(pinSetupForm.value)
    isPinSetupModalOpen.value = false
    pinError.value = null
    alert('PIN код успішно налаштовано')
  } catch (e) {
    pinError.value = e instanceof Error ? e.message : 'Помилка налаштування PIN коду'
  }
}

async function changePinCode() {
  if (!pinChangeForm.value.current_pin_code) {
    pinError.value = 'Введіть поточний PIN код'
    return
  }
  if (!pinChangeForm.value.new_pin_code || pinChangeForm.value.new_pin_code.length !== 4) {
    pinError.value = 'Новий PIN код повинен містити 4 цифри'
    return
  }
  try {
    await store.changePinCode(pinChangeForm.value)
    isPinChangeModalOpen.value = false
    pinError.value = null
    alert('PIN код успішно змінено')
  } catch (e) {
    pinError.value = e instanceof Error ? e.message : 'Помилка зміни PIN коду'
  }
}

function getWorkModeLabel(mode?: string): string {
  const labels: Record<string, string> = { office: 'Офіс', remote: 'Віддалено', hybrid: 'Гібрид' }
  return mode ? labels[mode] || mode : 'Не вказано'
}
</script>

<template>
  <div class="profile-page">
    <!-- Modals -->
    <div v-if="isEditMode" class="modal-overlay" @click.self="cancelEdit">
      <div class="modal">
        <div class="modal-header"><h2>Редагувати профіль</h2></div>
        <div class="modal-body">
          <div v-if="formError" class="modal-error">{{ formError }}</div>
          <div class="form-field">
            <InputField
              name="name"
              label="Ім'я"
              v-model="editForm.name"
              type="text"
              placeholder="Введіть ім'я"
            />
          </div>
          <div class="form-field">
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
      <div class="modal">
        <div class="modal-header"><h2>Зміна пароля</h2></div>
        <div class="modal-body">
          <div v-if="passwordError" class="modal-error">{{ passwordError }}</div>
          <div class="form-field">
            <InputField
              name="code"
              label="Код підтвердження (якщо увімкнено 2FA)"
              v-model="passwordForm.code"
              type="text"
              placeholder="Введіть код підтвердження"
            />
          </div>
          <div class="form-field">
            <InputField
              name="current_password"
              label="Поточний пароль"
              v-model="passwordForm.current_password"
              type="password"
              placeholder="Поточний пароль"
            />
          </div>
          <div class="form-field">
            <InputField
              name="new_password"
              label="Новий пароль"
              v-model="passwordForm.new_password"
              type="password"
              placeholder="Мінімум 8 символів"
            />
          </div>
          <div class="form-field">
            <InputField
              name="new_password_confirmation"
              label="Підтвердження пароля"
              v-model="passwordForm.new_password_confirmation"
              type="password"
              placeholder="Повторіть новий пароль"
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

    <div v-if="isPinSetupModalOpen" class="modal-overlay" @click.self="cancelPinSetup">
      <div class="modal">
        <div class="modal-header"><h2>Налаштування PIN коду</h2></div>
        <div class="modal-body">
          <div v-if="pinError" class="modal-error">{{ pinError }}</div>
          <div class="form-field">
            <InputField
              name="pin_code"
              label="PIN код (4 цифри)"
              v-model="pinSetupForm.pin_code"
              type="password"
              placeholder="0000"
              maxlength="4"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelPinSetup" :disabled="store.isSaving">
            Скасувати
          </button>
          <button class="btn-primary" @click="setupPinCode" :disabled="store.isSaving">
            {{ store.isSaving ? 'Збереження...' : 'Налаштувати' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isPinChangeModalOpen" class="modal-overlay" @click.self="cancelPinChange">
      <div class="modal">
        <div class="modal-header"><h2>Зміна PIN коду</h2></div>
        <div class="modal-body">
          <div v-if="pinError" class="modal-error">{{ pinError }}</div>
          <div class="form-field">
            <InputField
              name="current_pin_code"
              label="Поточний PIN"
              v-model="pinChangeForm.current_pin_code"
              type="password"
              placeholder="0000"
              maxlength="4"
            />
          </div>
          <div class="form-field">
            <InputField
              name="new_pin_code"
              label="Новий PIN"
              v-model="pinChangeForm.new_pin_code"
              type="password"
              placeholder="0000"
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

    <!-- Page content -->
    <div v-if="store.isLoading" class="state-center">
      <div class="spinner"></div>
      <p>Завантаження...</p>
    </div>

    <div v-else-if="store.error" class="state-center">
      <p class="error-text">{{ store.error }}</p>
      <button class="btn-primary" @click="store.fetchProfile()">Повторити</button>
    </div>

    <div v-else-if="store.displayProfile" class="profile-layout">
      <!-- Left Sidebar -->
      <aside class="profile-sidebar">
        <div class="sidebar-avatar-wrap">
          <div class="sidebar-avatar">
            <img
              v-if="avatarUrl"
              :key="imageKey"
              :src="avatarUrl"
              alt="avatar"
              class="avatar-img"
            />
            <div v-else class="avatar-fallback">
              {{ store.displayProfile.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div v-if="isUploadingAvatar" class="avatar-uploading">...</div>
          </div>
        </div>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleAvatarChange"
        />

        <h2 class="sidebar-name">{{ store.displayProfile.name }}</h2>
        <p class="sidebar-email">{{ store.displayProfile.email }}</p>
        <span class="role-chip" :class="`role-${store.displayProfile.role}`">{{
          store.displayProfile.role
        }}</span>

        <div class="sidebar-divider"></div>

        <div class="sidebar-meta">
          <div class="meta-item">
            <span class="meta-icon">&#128336;</span>
            <div>
              <div class="meta-label">Зареєстрований</div>
              <div class="meta-value">{{ formatDate(store.displayProfile.created_at) }}</div>
            </div>
          </div>
          <div v-if="store.displayProfile.work_mode" class="meta-item">
            <span class="meta-icon">&#127968;</span>
            <div>
              <div class="meta-label">Режим роботи</div>
              <div class="meta-value">{{ getWorkModeLabel(store.displayProfile.work_mode) }}</div>
            </div>
          </div>
          <div v-if="store.displayProfile.work_schedule" class="meta-item">
            <span class="meta-icon">&#128197;</span>
            <div>
              <div class="meta-label">Графік</div>
              <div class="meta-value">{{ store.displayProfile.work_schedule.name }}</div>
            </div>
          </div>
          <div class="meta-item">
            <span class="meta-icon">&#128274;</span>
            <div>
              <div class="meta-label">PIN код</div>
              <div class="meta-value" :class="{ 'pin-ok': store.displayProfile.has_pin_code }">
                {{ store.displayProfile.has_pin_code ? 'Налаштовано' : 'Не налаштовано' }}
              </div>
            </div>
          </div>
        </div>

        <button
          class="sidebar-photo-btn"
          @click="avatarInput?.click()"
          :disabled="isUploadingAvatar"
        >
          {{ isUploadingAvatar ? 'Завантаження...' : 'Змінити фото' }}
        </button>
      </aside>

      <!-- Right Main -->
      <div class="profile-main">
        <div class="main-card">
          <div class="main-card-header">
            <h2>Деталі профілю</h2>
            <button class="btn-primary" @click="openEditMode">Редагувати</button>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Повне ім'я</span>
              <span class="detail-value">{{ store.displayProfile.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email адреса</span>
              <span class="detail-value">{{ store.displayProfile.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Роль в системі</span>
              <span class="detail-value">{{ store.displayProfile.role }}</span>
            </div>
            <div v-if="store.displayProfile.company" class="detail-item">
              <span class="detail-label">Компанія</span>
              <button class="company-link" @click="router.push({ name: 'company' })">
                {{ store.displayProfile.company.name }}
              </button>
            </div>
          </div>

          <div v-if="store.displayProfile.manager" class="manager-section">
            <div class="manager-label">Безпосередній менеджер</div>
            <div class="manager-card">
              <div class="manager-avatar-wrap">
                <img
                  v-if="managerAvatarUrl"
                  :src="managerAvatarUrl"
                  alt="avatar"
                  class="manager-avatar-img"
                />
                <div v-else class="manager-avatar">
                  {{ store.displayProfile.manager.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div>
                <div class="manager-name">{{ store.displayProfile.manager.name }}</div>
                <div class="manager-email">{{ store.displayProfile.manager.email }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="main-card security-card">
          <div class="main-card-header">
            <h2>Безпека</h2>
          </div>
          <div class="security-actions">
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">Пароль облікового запису</div>
                <div class="security-desc">Регулярно змінюйте пароль для безпеки</div>
              </div>
              <button class="btn-secondary" @click="openPasswordModal">Змінити пароль</button>
            </div>
            <div class="security-divider"></div>
            <div class="security-item">
              <div class="security-info">
                <div class="security-title">PIN код для входу</div>
                <div class="security-desc">
                  {{
                    store.displayProfile.has_pin_code
                      ? 'PIN активний — захищає швидкий вхід'
                      : 'PIN не встановлено'
                  }}
                </div>
              </div>
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
    </div>
  </div>
</template>

<style scoped>
/* ── Page wrapper ───────────────────────────────────────────────────────── */
.profile-page {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1.5rem 3rem;
}

/* ── Loading / error states ─────────────────────────────────────────────── */
.state-center {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);
}
.error-text {
  color: var(--error-text);
  margin-bottom: 1rem;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent-2);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Two-column layout ──────────────────────────────────────────────────── */
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* ── Sidebar ────────────────────────────────────────────────────────────── */
.profile-sidebar {
  background: var(--sidebar-bg);
  border-radius: 1rem;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px var(--shadow);
  padding: 2rem 1.5rem;
  text-align: center;
  position: sticky;
  top: 100px;
}
.sidebar-avatar-wrap {
  margin-bottom: 1.25rem;
}
.sidebar-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  box-shadow:
    0 0 0 3px rgba(255, 155, 81, 0.3),
    0 4px 16px var(--shadow);
  position: relative;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--avatar-gradient-from), var(--avatar-gradient-to));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-2);
  font-size: 2.5rem;
  font-weight: 700;
}
.avatar-uploading {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  border-radius: 50%;
}
.sidebar-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.3rem;
}
.sidebar-email {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}
.role-chip {
  display: inline-block;
  padding: 0.25rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.role-admin {
  background: var(--role-admin-bg);
  color: var(--role-admin-color);
  border: 1px solid var(--role-admin-border);
}
.role-manager {
  background: var(--role-manager-bg);
  color: var(--role-manager-color);
  border: 1px solid var(--role-manager-border);
}
.role-employee {
  background: var(--role-employee-bg);
  color: var(--role-employee-color);
  border: 1px solid var(--role-employee-border);
}
.sidebar-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.25rem 0;
}
.sidebar-meta {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.meta-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.meta-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.1rem;
}
.meta-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}
.pin-ok {
  color: var(--pin-ok-color);
}
.sidebar-photo-btn {
  display: block;
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.6rem 1rem;
  background: var(--sand-light);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.sidebar-photo-btn:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
  background: var(--sand);
}
.sidebar-photo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Main cards ─────────────────────────────────────────────────────────── */
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.main-card {
  background: var(--surface);
  border-radius: 1rem;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px var(--shadow);
  overflow: hidden;
}
.main-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid var(--border);
  background: var(--sand-light);
}
.main-card-header h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.detail-grid {
  padding: 1.5rem 1.75rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
.detail-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.detail-item:nth-last-child(-n + 2) {
  border-bottom: none;
}
.detail-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
}
.company-link {
  padding: 0.25rem 0.75rem;
  background: var(--company-link-bg);
  border: 1px solid var(--company-link-border);
  border-radius: 0.375rem;
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}
.company-link:hover {
  background: var(--accent-2);
  border-color: var(--accent-2);
  color: var(--btn-on-accent);
}

/* ── Manager section ────────────────────────────────────────────────────── */
.manager-section {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid var(--border);
  background: var(--sand-light);
}
.manager-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}
.manager-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.manager-avatar-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--accent-2);
}
.manager-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.manager-avatar {
  width: 100%;
  height: 100%;
  background: var(--manager-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-2);
  font-weight: 700;
  font-size: 1.1rem;
}
.manager-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
}
.manager-email {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* ── Security card ──────────────────────────────────────────────────────── */
.security-card .main-card-header {
  background: transparent;
}
.security-actions {
  padding: 0.5rem 0;
}
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.75rem;
  gap: 1rem;
}
.security-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.2rem;
}
.security-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}
.security-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 0;
}

/* ── Buttons ────────────────────────────────────────────────────────────── */
.btn-primary {
  padding: 0.6rem 1.25rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.4);
}
.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn-secondary {
  padding: 0.6rem 1.25rem;
  background: var(--sand-light);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-secondary:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
}
.btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ── Modals ─────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}
.modal {
  background: var(--surface);
  border-radius: 1rem;
  border-top: 4px solid var(--accent-2);
  box-shadow: var(--modal-shadow);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}
.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}
.modal-body {
  padding: 1.5rem;
}
.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
.form-field {
  margin-bottom: 1.25rem;
}
.modal-error {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  padding: 0.65rem 0.875rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  .profile-sidebar {
    position: static;
  }
}
@media (max-width: 640px) {
  .profile-page {
    padding: 0 1rem 2rem;
    margin-top: 1rem;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-item:nth-last-child(-n + 2) {
    border-bottom: 1px solid var(--border);
  }
  .detail-item:last-child {
    border-bottom: none;
  }
  .security-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
