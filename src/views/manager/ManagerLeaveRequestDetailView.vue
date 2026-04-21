<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useManagerStore } from '@/stores/manager.store.ts'
import { useAuthStore } from '@/stores/auth.store.ts'
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface.ts'
import { LeaveRequestStatus, LeaveRequestType } from '@/types/enums/enums.types.ts'
import { formatDate } from '@/core/utils/date.ts'
import { getAvatarUrl } from '@/core/utils/url.ts'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import ApproveModal from '@/components/leave-requests/ApproveModal.vue'
import RejectModal from '@/components/leave-requests/RejectModal.vue'

import CalendarIcon from '@/icons/CalendarIcon.vue'
import DocumentTextIcon from '@/icons/DocumentTextIcon.vue'
import UserIcon from '@/icons/UserIcon.vue'
import CheckCircleIcon from '@/icons/CheckCircleIcon.vue'
import XCircleIcon from '@/icons/XCircleIcon.vue'

const route = useRoute()
const router = useRouter()
const managerStore = useManagerStore()
const authStore = useAuthStore()

const requestId = computed(() => Number(route.params.id))
const request = ref<LeaveRequest | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const showApproveModal = ref(false)
const isApproving = ref(false)
const approveModalRef = ref<InstanceType<typeof ApproveModal> | null>(null)

const showRejectModal = ref(false)
const isRejecting = ref(false)
const rejectModalRef = ref<InstanceType<typeof RejectModal> | null>(null)

const canManage = computed(() => {
  if (!request.value || request.value.status !== LeaveRequestStatus.PENDING) return false
  return (
    authStore.currentUser?.role === 'admin' ||
    authStore.currentUser?.id === request.value.company?.manager_id
  )
})

onMounted(loadRequestDetails)

async function loadRequestDetails() {
  isLoading.value = true
  error.value = null
  try {
    const data = await managerStore.fetchLeaveRequestById(requestId.value)
    if (data) {
      request.value = data
    } else {
      error.value = 'Запит не знайдено'
    }
  } catch (err) {
    console.error('Failed to load request details:', err)
    error.value = managerStore.error || 'Не вдалося завантажити деталі запиту'
  } finally {
    isLoading.value = false
  }
}

async function handleApprove(comment: string) {
  isApproving.value = true
  try {
    await managerStore.approveLeaveRequest(requestId.value, comment)
    showApproveModal.value = false
    await loadRequestDetails()
  } catch (err) {
    approveModalRef.value?.setError(managerStore.error || 'Помилка при схваленні запиту')
  } finally {
    isApproving.value = false
  }
}

async function handleReject(comment: string) {
  isRejecting.value = true
  try {
    await managerStore.rejectLeaveRequest(requestId.value, comment)
    showRejectModal.value = false
    await loadRequestDetails()
  } catch (err) {
    rejectModalRef.value?.setError(managerStore.error || 'Помилка при відхиленні запиту')
  } finally {
    isRejecting.value = false
  }
}

function getTypeLabel(type: LeaveRequestType): string {
  const labels: Record<LeaveRequestType, string> = {
    [LeaveRequestType.VACATION]: 'Відпустка',
    [LeaveRequestType.SICK]: 'Лікарняний',
    [LeaveRequestType.PERSONAL]: 'Особисті причини',
    [LeaveRequestType.UNPAID]: 'Неоплачувана відпустка',
    [LeaveRequestType.BUSINESS_TRIP]: 'Відрядження',
  }
  return labels[type] || type
}

function getStatusLabel(status: LeaveRequestStatus): string {
  const labels: Record<LeaveRequestStatus, string> = {
    [LeaveRequestStatus.PENDING]: 'Очікує розгляду',
    [LeaveRequestStatus.APPROVED]: 'Схвалено',
    [LeaveRequestStatus.REJECTED]: 'Відхилено',
  }
  return labels[status] || status
}

function getStatusVariant(status: LeaveRequestStatus) {
  switch (status) {
    case LeaveRequestStatus.APPROVED:
      return 'success'
    case LeaveRequestStatus.REJECTED:
      return 'danger'
    default:
      return 'active'
  }
}
</script>

<template>
  <div class="request-detail-page">
    <PageHeader title="Деталі запиту" back-route="manager" />

    <div v-if="isLoading" class="loading-wrapper">
      <LoadingSpinner text="Завантаження деталей запиту..." />
    </div>

    <div v-else-if="error" class="error-wrapper">
      <Card>
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button class="btn-primary" @click="loadRequestDetails">Спробувати знову</button>
        </div>
      </Card>
    </div>

    <div v-else-if="request" class="content-layout">
      <div class="cards-layout">
        <!-- Main Info Card -->
        <Card>
          <template #header>
            <div class="card-header-row">
              <div class="title-group">
                <span class="request-type">{{ getTypeLabel(request.type) }}</span>
                <span class="request-id">ID: #{{ request.id }}</span>
              </div>
              <Badge :variant="getStatusVariant(request.status)">
                {{ getStatusLabel(request.status) }}
              </Badge>
            </div>
          </template>

          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label-row">
                <CalendarIcon class="detail-icon" />
                <span class="detail-label">ПЕРІОД</span>
              </div>
              <div class="detail-value">
                {{ formatDate(request.start_date) }} — {{ formatDate(request.end_date) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label-row">
                <UserIcon class="detail-icon" />
                <span class="detail-label">СПІВРОБІТНИК</span>
              </div>
              <div class="user-row">
                <Avatar :src="getAvatarUrl(request.user?.avatar)" :name="request.user?.name" size="sm" />
                <div class="user-info">
                  <div class="user-name">{{ request.user?.name }}</div>
                  <div class="user-email">{{ request.user?.email }}</div>
                </div>
              </div>
            </div>

            <div class="detail-item full-width">
              <div class="detail-label-row">
                <DocumentTextIcon class="detail-icon" />
                <span class="detail-label">ПРИЧИНА ТА ОБҐРУНТУВАННЯ</span>
              </div>
              <p class="reason-text">{{ request.reason || 'Причина не вказана' }}</p>
            </div>
          </div>

          <template v-if="canManage" #footer>
            <div class="action-buttons">
              <button class="btn-reject" @click="showRejectModal = true">Відхилити</button>
              <button class="btn-approve" @click="showApproveModal = true">Схвалити запит</button>
            </div>
          </template>
        </Card>

        <!-- Status History / Management Card -->
        <Card v-if="request.status !== LeaveRequestStatus.PENDING">
          <template #header>
            <div class="card-header-row">
              <div class="title-group">
                <span class="request-type">Рішення менеджера</span>
              </div>
              <div class="status-icon">
                <CheckCircleIcon v-if="request.status === LeaveRequestStatus.APPROVED" class="icon-success" />
                <XCircleIcon v-else class="icon-danger" />
              </div>
            </div>
          </template>

          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label-row">
                <span class="detail-label">ОПРАЦЬОВАНО</span>
              </div>
              <div class="processor-row">
                <Avatar :name="request.processor?.name" size="xs" />
                <span class="processor-name">
                  {{ request.processor?.name }} ({{ formatDate(request.updated_at) }})
                </span>
              </div>
            </div>

            <div class="detail-item full-width">
              <div class="detail-label-row">
                <span class="detail-label">КОМЕНТАР МЕНЕДЖЕРА</span>
              </div>
              <p class="comment-text">{{ request.manager_comment || 'Без коментарів' }}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Modals -->
    <ApproveModal
      :show-modal="showApproveModal"
      :is-submitting="isApproving"
      ref="approveModalRef"
      @close="showApproveModal = false"
      @submit="handleApprove"
    />

    <RejectModal
      :show-modal="showRejectModal"
      :is-submitting="isRejecting"
      ref="rejectModalRef"
      @close="showRejectModal = false"
      @submit="handleReject"
    />
  </div>
</template>

<style scoped>
.request-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.loading-wrapper,
.error-wrapper {
  padding: 4rem 0;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-content p {
  color: var(--error-text);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0.5rem 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--accent-2);
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.processor-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.processor-name {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.reason-text {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.6;
}

.comment-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
}

.btn-approve,
.btn-reject {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-approve {
  background: var(--accent-2);
  color: var(--btn-on-accent);
}

.btn-approve:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-reject {
  background: var(--sand-light);
  color: var(--error-text);
  border: 1.5px solid var(--error-border);
}

.btn-reject:hover:not(:disabled) {
  background: var(--error-bg);
  transform: translateY(-1px);
}

.btn-approve:disabled,
.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cards-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.request-type {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  display: block;
  margin-bottom: 0.25rem;
}

.request-id {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.icon-success { color: var(--pin-ok-color); width: 2rem; height: 2rem; }
.icon-danger { color: var(--error-text); width: 2rem; height: 2rem; }

@media (max-width: var(--bp-md)) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
