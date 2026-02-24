<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type { User } from '@/types/interfaces/user.interface'

interface Props {
  schedule: WorkSchedule | null
  employees: User[]
  isSaving?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  assign: [userId: number, scheduleId: number]
}>()

const searchQuery = ref('')
const selectedEmployeeId = ref<number | null>(null)

const filteredEmployees = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return props.employees
  return props.employees.filter(
    (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
  )
})

function selectEmployee(id: number) {
  selectedEmployeeId.value = selectedEmployeeId.value === id ? null : id
}

function handleAssign() {
  if (!selectedEmployeeId.value || !props.schedule) return
  emit('assign', selectedEmployeeId.value, props.schedule.id)
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="modal-header">
          <h3>Призначити розклад</h3>
          <button class="modal-close" @click="emit('close')">✕</button>
        </div>

        <div class="modal-body">
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
            <div v-if="filteredEmployees.length === 0" class="empty">
              Співробітників не знайдено
            </div>
            <div
              v-for="emp in filteredEmployees"
              :key="emp.id"
              class="employee-item"
              :class="{ selected: selectedEmployeeId === emp.id }"
              @click="selectEmployee(emp.id)"
            >
              <div class="emp-avatar">{{ emp.name.charAt(0).toUpperCase() }}</div>
              <div class="emp-info">
                <div class="emp-name">{{ emp.name }}</div>
                <div class="emp-email">{{ emp.email }}</div>
                <div v-if="emp.work_schedule" class="emp-current-schedule">
                  Поточний: {{ emp.work_schedule.name }}
                </div>
              </div>
              <div v-if="selectedEmployeeId === emp.id" class="check-icon">✓</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="emit('close')">Скасувати</button>
          <button
            class="btn-confirm"
            :disabled="!selectedEmployeeId || isSaving"
            @click="handleAssign"
          >
            <span v-if="isSaving">Призначення...</span>
            <span v-else>Призначити</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.15s;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #eff6ff;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.88rem;
}

.label {
  color: #6b7280;
}

.schedule-name {
  font-weight: 600;
  color: #1d4ed8;
}

.search-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.88rem;
  outline: none;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 280px;
  overflow-y: auto;
}

.empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
  padding: 1.5rem 0;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.employee-item:hover {
  background: #f9fafb;
}

.employee-item.selected {
  background: #eff6ff;
  border-color: #2563eb;
}

.emp-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.emp-info {
  flex: 1;
  min-width: 0;
}

.emp-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #1f2937;
}

.emp-email {
  font-size: 0.78rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.emp-current-schedule {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}

.check-icon {
  color: #2563eb;
  font-weight: 700;
  font-size: 1rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.55rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-confirm {
  padding: 0.55rem 1.5rem;
  background: linear-gradient(135deg, #2563eb, #9333ea);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm:not(:disabled):hover {
  opacity: 0.9;
}
</style>
