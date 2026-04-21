<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useManagerStore } from '@/stores/manager.store'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { LeaveRequestStatus, LeaveRequestType } from '@/types/enums/enums.types'
import { formatDate } from '@/core/utils/date'
import { getAvatarUrl } from '@/core/utils/url'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Card from '@/components/ui/Card.vue'
import Avatar from '@/components/ui/Avatar.vue'
import ApproveModal from '@/components/leave-requests/ApproveModal.vue'
import RejectModal from '@/components/leave-requests/RejectModal.vue'
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'

const route = useRoute()
const managerStore = useManagerStore()
const { isManager, isAdmin } = useRoleGuard()

const currentLeaveRequest = ref<LeaveRequest | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const isProcessing = ref(false)
const approveModalRef = ref<InstanceType<typeof ApproveModal> | null>(null)
const rejectModalRef = ref<InstanceType<typeof RejectModal> | null>(null)

const canManage = computed(() => {
  return (
    (isManager.value || isAdmin.value) &&
    currentLeaveRequest.value?.status === LeaveRequestStatus.PENDING
  )
})

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

async function fetchLeaveRequest(id: string) {
  isLoading.value = true
  error.value = null
  try {
    currentLeaveRequest.value = await managerStore.fetchLeaveRequestById(id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Помилка завантаження запиту'
  } finally {
    isLoading.value = false
  }
}

async function handleApproveSubmit(comments: string) {
  if (!currentLeaveRequest.value) return
  isProcessing.value = true
  try {
    await managerStore.approveLeaveRequest(
      currentLeaveRequest.value.id,
      comments ? { manager_comment: comments } : undefined,
    )
    showApproveModal.value = false
    await fetchLeaveRequest(route.params.id as string)
  } catch (err) {
    approveModalRef.value?.setError(err instanceof Error ? err.message : 'Помилка схвалення запиту')
  } finally {
    isProcessing.value = false
  }
}

async function handleRejectSubmit(comments: string) {
  if (!currentLeaveRequest.value) return
  isProcessing.value = true
  try {
    await managerStore.rejectLeaveRequest(currentLeaveRequest.value.id, {
      manager_comment: comments,
    })
    showRejectModal.value = false
    await fetchLeaveRequest(route.params.id as string)
  } catch (err) {
    rejectModalRef.value?.setError(err instanceof Error ? err.message : 'Помилка відхилення запиту')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => fetchLeaveRequest(route.params.id as string))
onUnmounted(() => {
  currentLeaveRequest.value = null
})
</script>

<template>
  <div class="detail-view">
    <PageHeader title="Деталі запиту на відпустку" back-route="manager" />

    <LoadingSpinner v-if="isLoading" text="Завантаження..." />

    <div v-else-if="error" class="state-center">
      <p class="error-text">{{ error }}</p>
      <button class="btn-primary" @click="fetchLeaveRequest(route.params.id as string)">
        Спробувати ще раз
      </button>
    </div>

    <div v-else-if="currentLeaveRequest" class="cards-layout">
      <Card>
        <template #header>
          <div class="card-header-row">
            <div>
              <span class="request-type">{{ getTypeLabel(currentLeaveRequest.type) }}</span>
              <span class="request-dates">
                {{ formatDate(currentLeaveRequest.start_date) }} —
                {{ formatDate(currentLeaveRequest.end_date) }}
              </span>
            </div>
            <span class="status-pill" :class="`status-${currentLeaveRequest.status}`">
              {{ getStatusLabel(currentLeaveRequest.status) }}
            </span>
          </div>
        </template>

        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">ID запиту</span>
            <span class="detail-value">#{{ currentLeaveRequest.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Тип</span>
            <span class="detail-value">{{ getTypeLabel(currentLeaveRequest.type) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Дата початку</span>
            <span class="detail-value">{{ formatDate(currentLeaveRequest.start_date) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Дата кінця</span>
            <span class="detail-value">{{ formatDate(currentLeaveRequest.end_date) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Статус</span>
            <span class="detail-value">{{ getStatusLabel(currentLeaveRequest.status) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Створено</span>
            <span class="detail-value">{{ formatDate(currentLeaveRequest.created_at) }}</span>
          </div>
        </div>

        <template v-if="currentLeaveRequest.reason" #footer>
          <div class="request-reason">
            <span class="detail-label">Причина</span>
            <p class="reason-text">{{ currentLeaveRequest.reason }}</p>
          </div>
        </template>
      </Card>

      <Card v-if="currentLeaveRequest.user">
        <template #header><h2>Заявник</h2></template>
        <div class="user-row">
          <Avatar
            :src="getAvatarUrl(currentLeaveRequest.user.avatar) || undefined"
            :fallback-text="currentLeaveRequest.user.name"
            size="medium"
            bordered
          />
          <div>
            <div class="user-name">{{ currentLeaveRequest.user.name }}</div>
            <div class="user-email">{{ currentLeaveRequest.user.email }}</div>
          </div>
        </div>
      </Card>

      <Card v-if="currentLeaveRequest.manager_comment">
        <template #header>
          <h2>Коментар менеджера</h2>
          <div v-if="currentLeaveRequest.processor" class="processor-row">
            <Avatar
              :src="getAvatarUrl(currentLeaveRequest.processor.avatar) || undefined"
              :fallback-text="currentLeaveRequest.processor.name"
              size="small"
            />
            <span class="processor-name">{{ currentLeaveRequest.processor.name }}</span>
          </div>
        </template>
        <p class="comment-text">{{ currentLeaveRequest.manager_comment }}</p>
      </Card>

      <Card v-if="canManage" :no-padding="true">
        <div class="action-buttons">
          <button class="btn-approve" @click="showApproveModal = true" :disabled="isProcessing">
            ✓ Схвалити
          </button>
          <button class="btn-reject" @click="showRejectModal = true" :disabled="isProcessing">
            ✗ Відхилити
          </button>
        </div>
      </Card>
    </div>

    <ApproveModal
      ref="approveModalRef"
      :show-modal="showApproveModal"
      :is-submitting="isProcessing"
      @close="showApproveModal = false"
      @submit="handleApproveSubmit"
    />
    <RejectModal
      ref="rejectModalRef"
      :show-modal="showRejectModal"
      :is-submitting="isProcessing"
      @close="showRejectModal = false"
      @submit="handleRejectSubmit"
    />
  </div>
</template>

<style scoped>
.detail-view {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 2rem;
}
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 1rem;
}
.error-text {
  color: var(--error-text);
}
.btn-primary {
  padding: 0.6rem 1.25rem;
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}
.status-pill {
  display: inline-block;
  padding: 0.3rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}
.status-pending {
  background: #fef3c7;
  color: #92400e;
}
.status-approved {
  background: #d1fae5;
  color: #065f46;
}
.status-rejected {
  background: #fee2e2;
  color: #991b1b;
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
  color: #991b1b;
  border: 1.5px solid #fecaca;
}
.btn-reject:hover:not(:disabled) {
  background: #fee2e2;
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
.request-dates {
  font-size: 0.85rem;
  color: var(--text-muted);
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
.detail-grid .detail-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.detail-grid .detail-item:nth-last-child(-n + 2) {
  border-bottom: none;
}
.v1-reason {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .detail-view {
    padding: 1rem;
  }
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-grid .detail-item:nth-last-child(-n + 2) {
    border-bottom: 1px solid var(--border);
  }
  .detail-grid .detail-item:last-child {
    border-bottom: none;
  }
}
</style>
