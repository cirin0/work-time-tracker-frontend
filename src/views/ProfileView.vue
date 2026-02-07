<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { useProfileStore } from '@/stores/profile.store'
import { getAvatarUrl } from '@/core/utils/url'
import InputField from '@/components/ui/InputField.vue'

const store = useProfileStore()

const avatarUrl = ref<string | null>(null)

watch(
  () => [store.profile?.avatar, store.avatarTimestamp] as const,
  () => {
    avatarUrl.value = getAvatarUrl(store.profile?.avatar, store.avatarTimestamp)
  },
  { immediate: true },
)

const isEditMode = ref(false)
const editForm = ref({
  name: '',
  email: '',
})
const formError = ref<string | null>(null)

const avatarInput = ref<HTMLInputElement | null>(null)
const isUploadingAvatar = ref(false)

onMounted(() => {
  store.fetchProfile()
})

function openEditMode() {
  if (store.profile) {
    editForm.value = {
      name: store.profile.name,
      email: store.profile.email,
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
  if (!editForm.value.name.trim()) {
    formError.value = "Ім'я не може бути порожнім"
    return
  }

  if (!editForm.value.email.trim()) {
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
</script>

<template>
  <MainLayout>
    <div class="profile-page">
      <div class="page-header">
        <h1>Профіль</h1>
      </div>

      <div v-if="store.isLoading" class="loading">
        <p>Завантаження профілю...</p>
      </div>

      <div v-else-if="store.error" class="error-state">
        <h2>Помилка завантаження</h2>
        <p>{{ store.error }}</p>
        <button class="btn-primary" @click="store.fetchProfile()">Спробувати ще раз</button>
      </div>

      <div v-else-if="store.profile" class="profile-content">
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

        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <div class="avatar-container">
                <img
                  v-if="avatarUrl"
                  :key="`profile-${store.avatarTimestamp}`"
                  :src="avatarUrl"
                  alt="Аватар користувача"
                  class="avatar"
                />
                <div v-else class="avatar-placeholder">
                  <span>{{ store.profile?.name?.charAt(0).toUpperCase() || '?' }}</span>
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
              <h2 class="profile-name">{{ store.profile.name }}</h2>
              <p class="profile-email">{{ store.profile.email }}</p>
              <span class="role-badge" :class="`role-${store.profile.role}`">
                {{ store.profile.role }}
              </span>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-row">
              <span class="detail-label">Ім'я</span>
              <span class="detail-value">{{ store.profile.name }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ store.profile.email }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Роль</span>
              <span class="detail-value">{{ store.profile.role }}</span>
            </div>

            <div v-if="store.profile.manager" class="detail-row">
              <span class="detail-label">Менеджер</span>
              <span class="detail-value">{{ store.profile.manager.name }}</span>
            </div>

            <div v-if="store.profile.company" class="detail-row">
              <span class="detail-label">Компанія</span>
              <span class="detail-value">{{ store.profile.company.name }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Дата реєстрації</span>
              <span class="detail-value">{{
                new Date(store.profile.createdAt).toLocaleDateString('uk-UA')
              }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn-primary" @click="openEditMode">Редагувати профіль</button>
            <button class="btn-secondary">Змінити пароль</button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
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

.profile-actions {
  display: flex;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
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
}
</style>
