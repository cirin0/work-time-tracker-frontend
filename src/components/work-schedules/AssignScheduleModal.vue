<script setup lang="ts">
import { ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Avatar from '@/components/ui/Avatar.vue'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type { User } from '@/types/interfaces/user.interface'
import { useEmployeeSearch } from '@/composables/useEmployeeSearch'

interface Props {
  modelValue: boolean
  schedule: WorkSchedule | null
  employees: User[]
  isSaving?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  assign: [userId: number, scheduleId: number]
}>()

const selectedEmployeeId = ref<number | null>(null)

const { searchQuery, filteredEmployees } = useEmployeeSearch(() => props.employees)

function selectEmployee(id: number) {
  selectedEmployeeId.value = selectedEmployeeId.value === id ? null : id
}

function handleAssign() {
  if (!selectedEmployeeId.value || !props.schedule) return
  emit('assign', selectedEmployeeId.value, props.schedule.id)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="Призначити розклад"
    max-width="520px"
  >
    <div class="modal-content">
      <div v-if="schedule" class="schedule-preview">
        <span class="label">Розклад:</span>
        <span class="schedule-name">{{ schedule.name }}</span>
      </div>

      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Пошук співробітника..."
        />
      </div>

      <div class="employees-list">
        <div v-if="filteredEmployees.length === 0" class="empty">Співробітників не знайдено</div>
        <div
          v-for="emp in filteredEmployees"
          :key="emp.id"
          class="employee-item"
          :class="{ selected: selectedEmployeeId === emp.id }"
          @click="selectEmployee(emp.id)"
        >
          <Avatar :fallback-text="emp.name" size="small" />
          <div class="emp-info">
            <div class="emp-name-row">
              <span class="emp-name">{{ emp.name }}</span>
              <span class="emp-email">{{ emp.email }}</span>
            </div>
            <div v-if="emp.work_schedule" class="emp-current-schedule">
              Поточний: {{ emp.work_schedule.name }}
            </div>
          </div>
          <div v-if="selectedEmployeeId === emp.id" class="check-icon">✓</div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn-secondary" @click="close">Скасувати</button>
      <button class="btn-primary" :disabled="!selectedEmployeeId || isSaving" @click="handleAssign">
        <span v-if="isSaving">Призначення...</span>
        <span v-else>Призначити</span>
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--sand-light);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  border: 1.5px solid var(--border);
}

.label {
  color: var(--text-muted);
  font-weight: 500;
}

.schedule-name {
  font-weight: 600;
  color: var(--accent-2);
}

.search-input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--text);
  background: var(--surface);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 3px rgba(255, 155, 81, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 320px;
  overflow-y: auto;
}

.empty {
  text-align: center;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.9rem;
  padding: 2rem 0;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface);
  min-height: 44px;
}

.employee-item:hover {
  background: var(--sand-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow);
}

.employee-item.selected {
  background: var(--sand-light);
  border-color: var(--accent-2);
  border-width: 2px;
}

.emp-info {
  flex: 1;
  min-width: 0;
}

.emp-name-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.emp-name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}

.emp-email {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.emp-current-schedule {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.check-icon {
  color: var(--accent-2);
  font-weight: 700;
  font-size: 1.2rem;
}

.btn-secondary {
  padding: 0.6rem 1.25rem;
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.btn-secondary:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.btn-primary {
  padding: 0.6rem 1.5rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:not(:disabled):hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.4);
}

@media (max-width: var(--bp-sm)) {
  .employees-list {
    max-height: 240px;
  }

  .emp-email {
    font-size: 0.75rem;
  }
}
</style>
