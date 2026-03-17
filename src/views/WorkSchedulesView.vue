<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkScheduleStore } from '@/stores/workSchedule.store'
import { useManagerStore } from '@/stores/manager.store'
import WorkScheduleCard from '@/components/work-schedules/WorkScheduleCard.vue'
import WorkScheduleForm from '@/components/work-schedules/WorkScheduleForm.vue'
import AssignScheduleModal from '@/components/work-schedules/AssignScheduleModal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { WorkSchedule } from '@/types/interfaces/workSchedule.interface'
import type { CreateWorkScheduleRequest } from '@/types/requests/workScheduleRequest.interface'

const workScheduleStore = useWorkScheduleStore()
const managerStore = useManagerStore()

const panelMode = ref<'list' | 'create' | 'edit'>('list')
const editingSchedule = ref<WorkSchedule | null>(null)
const deletingId = ref<number | null>(null)

const showAssignModal = ref(false)
const assigningSchedule = ref<WorkSchedule | null>(null)

const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null)

function showNotification(type: 'success' | 'error', message: string) {
  notification.value = { type, message }
  setTimeout(() => (notification.value = null), 4000)
}

onMounted(async () => {
  await Promise.all([workScheduleStore.fetchWorkSchedules(), managerStore.fetchEmployees()])
})

function openCreate() {
  editingSchedule.value = null
  panelMode.value = 'create'
}

function openEdit(schedule: WorkSchedule) {
  editingSchedule.value = schedule
  panelMode.value = 'edit'
}

function cancelForm() {
  panelMode.value = 'list'
  editingSchedule.value = null
}

async function handleSubmit(payload: CreateWorkScheduleRequest) {
  try {
    if (panelMode.value === 'edit' && editingSchedule.value) {
      await workScheduleStore.updateWorkSchedule(editingSchedule.value.id, payload)
      showNotification('success', 'Розклад успішно оновлено')
    } else {
      await workScheduleStore.createWorkSchedule(payload)
      showNotification('success', 'Розклад успішно створено')
    }
    panelMode.value = 'list'
    editingSchedule.value = null
    // Refresh to get full daily_schedules
    await workScheduleStore.fetchWorkSchedules()
  } catch {
    showNotification('error', workScheduleStore.error ?? 'Помилка збереження розкладу')
  }
}

async function handleDelete(id: number) {
  if (!confirm('Ви впевнені, що хочете видалити цей розклад?')) return
  deletingId.value = id
  try {
    await workScheduleStore.deleteWorkSchedule(id)
    showNotification('success', 'Розклад видалено')
  } catch {
    showNotification('error', workScheduleStore.error ?? 'Помилка видалення')
  } finally {
    deletingId.value = null
  }
}

function openAssignModal(schedule: WorkSchedule) {
  assigningSchedule.value = schedule
  showAssignModal.value = true
}

async function handleAssign(userId: number, scheduleId: number) {
  try {
    await workScheduleStore.assignScheduleToEmployee(userId, { work_schedule_id: scheduleId })
    const emp = managerStore.employees.find((e) => e.id === userId)
    showNotification('success', `Розклад призначено співробітнику ${emp?.name ?? ''}`)
    showAssignModal.value = false
    // Refresh employees to get updated work_schedule field
    await managerStore.fetchEmployees()
  } catch {
    showNotification('error', workScheduleStore.error ?? 'Помилка призначення розкладу')
  }
}
</script>

<template>
  <div class="work-schedules-page">
    <Transition name="slide-down">
      <div v-if="notification" class="notification" :class="notification.type">
        {{ notification.message }}
      </div>
    </Transition>

    <PageHeader
      title="Робочі розклади"
      subtitle="Управління розкладами та змінами співробітників"
      back-route="manager"
    >
      <template v-if="panelMode === 'list'" #actions>
        <button class="btn-create" @click="openCreate">+ Новий розклад</button>
      </template>
    </PageHeader>

    <!-- Error banner -->
    <div v-if="workScheduleStore.error && panelMode === 'list'" class="error-banner">
      {{ workScheduleStore.error }}
      <button @click="workScheduleStore.clearError">✕</button>
    </div>

    <!-- Create / Edit Form -->
    <div v-if="panelMode !== 'list'" class="form-container">
      <div class="form-card">
        <h2 class="form-title">
          {{ panelMode === 'create' ? 'Новий розклад' : 'Редагування розкладу' }}
        </h2>
        <WorkScheduleForm
          :schedule="editingSchedule"
          :is-saving="workScheduleStore.isSaving"
          @submit="handleSubmit"
          @cancel="cancelForm"
        />
      </div>
    </div>

    <!-- Schedules List -->
    <div v-else>
      <LoadingSpinner v-if="workScheduleStore.isLoading" text="Завантаження розкладів..." />

      <div v-else-if="workScheduleStore.workSchedules.length === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <h3>Розкладів ще немає</h3>
        <p>Створіть перший робочий розклад для вашої команди</p>
        <button class="btn-create" @click="openCreate">+ Створити розклад</button>
      </div>

      <div v-else class="schedules-grid">
        <WorkScheduleCard
          v-for="schedule in workScheduleStore.workSchedules"
          :key="schedule.id"
          :schedule="schedule"
          :is-deleting="deletingId === schedule.id"
          @edit="openEdit"
          @delete="handleDelete"
          @assign="openAssignModal"
        />
      </div>
    </div>

    <!-- Assign Modal -->
    <AssignScheduleModal
      v-model="showAssignModal"
      :schedule="assigningSchedule"
      :employees="managerStore.employees"
      :is-saving="workScheduleStore.isSaving"
      @assign="handleAssign"
    />
  </div>
</template>

<style scoped>
.work-schedules-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

/* Notification */
.notification {
  position: fixed;
  top: 80px;
  right: 1.5rem;
  z-index: 500;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  max-width: 360px;
}

.notification.success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #15803d;
}

.notification.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Error banner */
.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: #dc2626;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.error-banner button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 0.85rem;
}

/* Form */
.form-container {
  display: flex;
  justify-content: center;
}

.form-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

/* Create button (used in header actions slot and empty state) */
.btn-create {
  padding: 0.65rem 1.5rem;
  background: var(--accent-2);
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.btn-create:hover {
  opacity: 0.9;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

/* Grid */
.schedules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 1.25rem;
}

@media (max-width: 600px) {
  .work-schedules-page {
    padding: 1rem;
  }

  .schedules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
