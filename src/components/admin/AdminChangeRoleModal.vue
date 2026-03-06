<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/types/interfaces/user.interface'
import { UserRole } from '@/types/enums/enums.types'
import Modal from '@/components/ui/Modal.vue'
import ButtonMain from '@/components/ui/ButtonMain.vue'

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
const isOpen = ref(false)

const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Адміністратор',
  [UserRole.MANAGER]: 'Менеджер',
  [UserRole.EMPLOYEE]: 'Співробітник',
}

watch(
  () => props.showModal,
  (open) => {
    isOpen.value = open
    if (open && props.user) {
      selectedRole.value = props.user.role
      generalError.value = ''
    }
  },
)

watch(isOpen, (open) => {
  if (!open && props.showModal) {
    emit('close')
  }
})

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
  <Modal v-model="isOpen" title="Змінити роль" max-width="420px">
    <div v-if="generalError" class="error-alert">{{ generalError }}</div>

    <form class="modal-form" @submit.prevent="handleSubmit">
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
    </form>

    <template #footer>
      <ButtonMain variant="secondary" @click="handleClose">Скасувати</ButtonMain>
      <ButtonMain variant="primary" type="submit" :disabled="isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? 'Збереження...' : 'Зберегти' }}
      </ButtonMain>
    </template>
  </Modal>
</template>

<style scoped>
.error-alert {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text);
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.form-select {
  padding: 0.625rem 0.875rem;
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text);
  background: var(--surface);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  border-color: var(--accent-2);
}
</style>
