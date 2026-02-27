<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/types/interfaces/user.interface'
import { UserRole } from '@/types/enums/enums.types'

interface Props {
  showModal: boolean
  user: User | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  close: []
  submit: [role: UserRole]
}>()

const selectedRole = ref<UserRole>(UserRole.EMPLOYEE)
const generalError = ref('')

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Адміністратор',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.EMPLOYEE]: 'Співробітник',
}

watch(
  () => props.showModal,
  (open) => {
    if (open && props.user) {
      selectedRole.value = props.user.role
      generalError.value = ''
    }
  },
)

function handleSubmit() {
  emit('submit', selectedRole.value)
}

function handleClose() {
  emit('close')
}

defineExpose({
  setError: (msg: string) => {
    generalError.value = msg
  },
})
</script>

<template>
  <div v-if="showModal" class="modal-overlay" @click="handleClose">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>Змінити роль</h2>
        <button class="close-button" @click="handleClose">&times;</button>
      </div>

      <form class="modal-form" @submit.prevent="handleSubmit">
        <div v-if="generalError" class="error-alert">{{ generalError }}</div>

        <p class="user-name">
          Користувач: <strong>{{ user?.name }}</strong>
        </p>

        <div class="form-group">
          <label class="form-label">Роль</label>
          <select v-model="selectedRole" class="form-select">
            <option v-for="role in Object.values(UserRole)" :key="role" :value="role">
              {{ roleLabels[role] }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="handleClose">Скасувати</button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Збереження...' : 'Зберегти' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-alert {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.user-name {
  font-size: 0.9rem;
  color: #374151;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-select {
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  border-color: #2563eb;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.5rem 1.25rem;
  border: 1.5px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-submit {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
