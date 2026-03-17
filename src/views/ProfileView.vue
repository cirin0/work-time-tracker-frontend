<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile.store'
import { getAvatarUrl } from '@/core/utils/url'
import { formatDate } from '@/core/utils/date'
import InputField from '@/components/ui/InputField.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
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
const passwordSuccess = ref<string | null>(null)
const isRequestingPasswordCode = ref(false)
const passwordCodeCooldown = ref(0)

let passwordCodeTimer: ReturnType<typeof setInterval> | null = null

const isPasswordCodeButtonDisabled = computed(
  () => isRequestingPasswordCode.value || passwordCodeCooldown.value > 0 || store.isSaving,
)

const isPasswordSubmitDisabled = computed(() => store.isSaving || isRequestingPasswordCode.value)

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

function clearPasswordCodeTimer() {
  if (!passwordCodeTimer) return

  clearInterval(passwordCodeTimer)
  passwordCodeTimer = null
}

function startPasswordCodeCooldown(seconds = 60) {
  clearPasswordCodeTimer()
  passwordCodeCooldown.value = seconds

  passwordCodeTimer = setInterval(() => {
    if (passwordCodeCooldown.value <= 1) {
      passwordCodeCooldown.value = 0
      clearPasswordCodeTimer()
      return
    }

    passwordCodeCooldown.value -= 1
  }, 1000)
}

function openPasswordModal() {
  passwordForm.value = {
    current_password: '',
    new_password: '',
    code: '',
    new_password_confirmation: '',
  }
  passwordError.value = null
  passwordSuccess.value = null
  passwordCodeCooldown.value = 0
  clearPasswordCodeTimer()
  isPasswordModalOpen.value = true
}
function cancelPasswordChange() {
  isPasswordModalOpen.value = false
  passwordError.value = null
  passwordSuccess.value = null
  clearPasswordCodeTimer()
  passwordCodeCooldown.value = 0
}

async function requestPasswordCode() {
  passwordError.value = null
  passwordSuccess.value = null
  isRequestingPasswordCode.value = true

  try {
    await store.requestPasswordChangeCode()
    passwordSuccess.value = 'Код підтвердження надіслано на вашу електронну пошту.'
    startPasswordCodeCooldown()
  } catch (e) {
    passwordError.value =
      e instanceof Error && e.message ? e.message : 'Не вдалося надіслати код підтвердження'
  } finally {
    isRequestingPasswordCode.value = false
  }
}

async function changePassword() {
  passwordError.value = null
  passwordSuccess.value = null

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
  if (!passwordForm.value.code) {
    passwordError.value = 'Введіть код підтвердження'
    return
  }
  if (passwordForm.value.code.length !== 6) {
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
    passwordSuccess.value = null
    clearPasswordCodeTimer()
    passwordCodeCooldown.value = 0
    alert('Пароль успішно змінено')
  } catch (e) {
    passwordError.value = e instanceof Error ? e.message : 'Помилка зміни пароля'
  }
}

onUnmounted(() => {
  clearPasswordCodeTimer()
})

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
    <Modal v-model="isEditMode" title="Редагувати профіль">
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
      <template #footer>
        <button class="btn-secondary" @click="cancelEdit" :disabled="store.isSaving">
          Скасувати
        </button>
        <button class="btn-primary" @click="saveProfile" :disabled="store.isSaving">
          {{ store.isSaving ? 'Збереження...' : 'Зберегти' }}
        </button>
      </template>
    </Modal>

    <Modal v-model="isPasswordModalOpen" title="Зміна пароля">
      <div v-if="passwordSuccess" class="modal-success">{{ passwordSuccess }}</div>
      <div v-if="passwordError" class="modal-error">{{ passwordError }}</div>
      <div class="password-code-row">
        <div class="form-field password-code-field">
          <InputField
            name="code"
            label="Код підтвердження"
            v-model="passwordForm.code"
            type="text"
            icon="lock"
            placeholder="Введіть 6-значний код"
          />
        </div>
        <button
          class="btn-secondary btn-code"
          :disabled="isPasswordCodeButtonDisabled"
          @click="requestPasswordCode"
        >
          {{
            isRequestingPasswordCode
              ? 'Надсилання...'
              : passwordCodeCooldown > 0
                ? `Повторно через ${passwordCodeCooldown}с`
                : 'Надіслати код'
          }}
        </button>
      </div>
      <div class="form-field">
        <InputField
          name="current_password"
          label="Поточний пароль"
          v-model="passwordForm.current_password"
          type="password"
          icon="lock"
          placeholder="Поточний пароль"
        />
      </div>
      <div class="form-field">
        <InputField
          name="new_password"
          label="Новий пароль"
          v-model="passwordForm.new_password"
          type="password"
          icon="lock"
          placeholder="Мінімум 8 символів"
        />
      </div>
      <div class="form-field">
        <InputField
          name="new_password_confirmation"
          label="Підтвердження пароля"
          v-model="passwordForm.new_password_confirmation"
          type="password"
          icon="lock"
          placeholder="Повторіть новий пароль"
        />
      </div>
      <template #footer>
        <button
          class="btn-secondary"
          @click="cancelPasswordChange"
          :disabled="isPasswordSubmitDisabled"
        >
          Скасувати
        </button>
        <button class="btn-primary" @click="changePassword" :disabled="isPasswordSubmitDisabled">
          {{ store.isSaving ? 'Збереження...' : 'Змінити пароль' }}
        </button>
      </template>
    </Modal>

    <Modal v-model="isPinSetupModalOpen" title="Налаштування PIN коду">
      <div v-if="pinError" class="modal-error">{{ pinError }}</div>
      <div class="form-field">
        <InputField
          name="pin_code"
          label="PIN код (4 цифри)"
          v-model="pinSetupForm.pin_code"
          type="password"
          icon="lock"
          placeholder="0000"
          maxlength="4"
        />
      </div>
      <template #footer>
        <button class="btn-secondary" @click="cancelPinSetup" :disabled="store.isSaving">
          Скасувати
        </button>
        <button class="btn-primary" @click="setupPinCode" :disabled="store.isSaving">
          {{ store.isSaving ? 'Збереження...' : 'Налаштувати' }}
        </button>
      </template>
    </Modal>

    <Modal v-model="isPinChangeModalOpen" title="Зміна PIN коду">
      <div v-if="pinError" class="modal-error">{{ pinError }}</div>
      <div class="form-field">
        <InputField
          name="current_pin_code"
          label="Поточний PIN"
          v-model="pinChangeForm.current_pin_code"
          type="password"
          placeholder="0000"
          maxlength="4"
          icon="lock"
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
          icon="lock"
        />
      </div>
      <template #footer>
        <button class="btn-secondary" @click="cancelPinChange" :disabled="store.isSaving">
          Скасувати
        </button>
        <button class="btn-primary" @click="changePinCode" :disabled="store.isSaving">
          {{ store.isSaving ? 'Збереження...' : 'Змінити PIN' }}
        </button>
      </template>
    </Modal>

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
      <Card class="profile-sidebar">
        <div class="sidebar-avatar-wrap">
          <Avatar
            :src="avatarUrl || undefined"
            :fallback-text="store.displayProfile.name"
            size="large"
            bordered
            :key="imageKey"
          />
          <div v-if="isUploadingAvatar" class="avatar-uploading">...</div>
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
        <Badge
          :variant="`role-${store.displayProfile.role}` as any"
          :label="store.displayProfile.role"
        />

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
      </Card>

      <!-- Right Main -->
      <div class="profile-main">
        <Card>
          <template #header>
            <h2>Деталі профілю</h2>
            <button class="btn-primary" @click="openEditMode">Редагувати</button>
          </template>

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

          <template #footer>
            <div v-if="store.displayProfile.manager" class="manager-section">
              <div class="manager-label">Менеджер</div>
              <div class="manager-card">
                <Avatar
                  :src="managerAvatarUrl || undefined"
                  :fallback-text="store.displayProfile.manager.name"
                  size="medium"
                  bordered
                />
                <div>
                  <div class="manager-name">{{ store.displayProfile.manager.name }}</div>
                  <div class="manager-email">{{ store.displayProfile.manager.email }}</div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <Card class="security-card">
          <template #header>
            <h2>Безпека</h2>
          </template>
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
        </Card>
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
  text-align: center;
  position: sticky;
  top: 100px;
}
.sidebar-avatar-wrap {
  margin-bottom: 1.25rem;
  position: relative;
  display: flex;
  justify-content: center;
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
  width: 96px;
  height: 96px;
  margin: 0 auto;
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
.profile-main :deep(.card-header) h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 0;
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
  padding: 0;
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
.security-card :deep(.card-header) {
  background: transparent;
}
.security-card :deep(.card-body) {
  padding: 0;
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
.modal-success {
  background: rgba(74, 222, 128, 0.12);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: var(--pin-ok-color);
  padding: 0.65rem 0.875rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
.password-code-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.password-code-field {
  flex: 1;
}
.btn-code {
  margin-top: 1.75rem;
  padding: 0.9rem;
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
