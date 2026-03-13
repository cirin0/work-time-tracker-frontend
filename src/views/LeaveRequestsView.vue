<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLeaveRequestStore } from '@/stores/leaveRequest.store'
import LeaveRequestsList from '@/components/leave-requests/LeaveRequestsList.vue'
import LeaveRequestForm from '@/components/leave-requests/LeaveRequestForm.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import type { CreateLeaveRequestRequest } from '@/types/requests/leaveRequestRequest.interface'
const leaveRequestStore = useLeaveRequestStore()
const showFormModal = ref(false)
const isSubmittingForm = ref(false)

onMounted(() => {
  loadLeaveRequests()
})

async function loadLeaveRequests(page = 1) {
  try {
    await leaveRequestStore.fetchLeaveRequests(page)
  } catch (error) {
    console.error('Failed to load leave requests:', error)
  }
}

async function handleCreateRequest(data: CreateLeaveRequestRequest) {
  isSubmittingForm.value = true
  try {
    await leaveRequestStore.createLeaveRequest(data)
    showFormModal.value = false
  } catch (error: unknown) {
    console.error('Failed to create leave request:', error)
  } finally {
    isSubmittingForm.value = false
  }
}

function handlePageChange(page: number) {
  loadLeaveRequests(page)
}
</script>

<template>
  <div class="leave-requests-view">
    <PageHeader
      title="Запити на відпустку"
      subtitle="Керування вашими запитами на відпустку"
      back-route="main"
    />

    <div class="content-section">
      <div class="section-header">
        <h2>Мої запити</h2>
        <button @click="showFormModal = true" class="btn-primary">+ Створити запит</button>
      </div>

      <LeaveRequestsList
        :leave-requests="leaveRequestStore.leaveRequests"
        :is-loading="leaveRequestStore.isLoading"
        :error="leaveRequestStore.error"
        :pagination="leaveRequestStore.pagination"
        @retry="loadLeaveRequests"
        @create="showFormModal = true"
        @page-change="handlePageChange"
      />
    </div>

    <LeaveRequestForm
      :show-form="showFormModal"
      :is-submitting="isSubmittingForm"
      @close="showFormModal = false"
      @submit="handleCreateRequest"
    />
  </div>
</template>

<style scoped>
.leave-requests-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.content-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
  font-size: 1rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);
}

@media (max-width: 768px) {
  .leave-requests-view {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
