<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useManagerStore } from '@/stores/manager.store.ts'
import ManagerLeaveRequestsList from '@/components/leave-requests/ManagerLeaveRequestsList.vue'
import RejectModal from '@/components/leave-requests/RejectModal.vue'
import Pagination from '@/components/ui/Pagination.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const managerStore = useManagerStore()

const showRejectModal = ref(false)
const rejectingRequestId = ref<number | null>(null)
const processingRequestId = ref<number | null>(null)
const currentPage = ref(1)
const perPage = 10

onMounted(() => {
  loadLeaveRequests()
})

async function loadLeaveRequests(page = 1) {
  currentPage.value = page
  try {
    await managerStore.fetchAllLeaveRequests(page, perPage)
  } catch (error) {
    console.error('Failed to load leave requests:', error)
  }
}

async function handleApprove(id: number) {
  if (!confirm('Ви впевнені, що хочете схвалити цей запит?')) {
    return
  }

  processingRequestId.value = id
  try {
    await managerStore.approveLeaveRequest(id)
    await loadLeaveRequests(currentPage.value)
  } catch (error) {
    console.error('Failed to approve leave request:', error)
    alert('Помилка при схваленні запиту')
  } finally {
    processingRequestId.value = null
  }
}

function handleRejectClick(id: number) {
  rejectingRequestId.value = id
  showRejectModal.value = true
}

async function handleRejectSubmit(comments: string) {
  if (!rejectingRequestId.value) return

  processingRequestId.value = rejectingRequestId.value
  try {
    await managerStore.rejectLeaveRequest(rejectingRequestId.value, {
      manager_comment: comments,
    })
    showRejectModal.value = false
    rejectingRequestId.value = null
    await loadLeaveRequests(currentPage.value)
  } catch (error) {
    console.error('Failed to reject leave request:', error)
    alert('Помилка при відхиленні запиту')
  } finally {
    processingRequestId.value = null
  }
}

function handlePageChange(page: number) {
  loadLeaveRequests(page)
}
</script>

<template>
  <div class="leave-requests-page">
    <PageHeader title="Всі запити на відпустку" back-route="manager" />

    <div class="content-section">
      <ManagerLeaveRequestsList
        :leave-requests="managerStore.allLeaveRequests"
        :is-loading="managerStore.isLoadingLeaveRequests"
        :error="managerStore.error"
        :processing-id="processingRequestId"
        @retry="loadLeaveRequests(currentPage)"
        @approve="handleApprove"
        @reject="handleRejectClick"
      />

      <Pagination
        v-if="managerStore.leaveRequestsPagination"
        :meta="managerStore.leaveRequestsPagination"
        @change-page="handlePageChange"
      />
    </div>

    <RejectModal
      :show-modal="showRejectModal"
      :is-submitting="processingRequestId !== null"
      @close="showRejectModal = false"
      @submit="handleRejectSubmit"
    />
  </div>
</template>

<style scoped>
.leave-requests-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.content-section {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
