<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLeaveRequestStore } from '@/stores/leaveRequest.store'
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

const route = useRoute()
const leaveRequestStore = useLeaveRequestStore()
const managerStore = useManagerStore()
const { isManager, isAdmin } = useRoleGuard()

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const isProcessing = ref(false)
const approveModalRef = ref<InstanceType<typeof ApproveModal> | null>(null)
const rejectModalRef = ref<InstanceType<typeof RejectModal> | null>(null)

const canManage = computed(() => {
  return (
    (isManager.value || isAdmin.value) &&
    leaveRequestStore.currentLeaveRequest?.status === LeaveRequestStatus.PENDING
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

async function handleApproveSubmit(comments: string) {
  if (!leaveRequestStore.currentLeaveRequest) return
  isProcessing.value = true
  try {
    await managerStore.approveLeaveRequest(
      leaveRequestStore.currentLeaveRequest.id,
      comments ? { manager_comment: comments } : undefined,
    )
    showApproveModal.value = false
    await leaveRequestStore.fetchLeaveRequest(route.params.id as string)
  } catch (error) {
    approveModalRef.value?.setError(
      error instanceof Error ? error.message : 'Помилка схвалення запиту',
    )
  } finally {
    isProcessing.value = false
  }
}

async function handleRejectSubmit(comments: string) {
  if (!leaveRequestStore.currentLeaveRequest) return
  isProcessing.value = true
  try {
    await managerStore.rejectLeaveRequest(leaveRequestStore.currentLeaveRequest.id, {
      manager_comment: comments,
    })
    showRejectModal.value = false
    await leaveRequestStore.fetchLeaveRequest(route.params.id as string)
  } catch (error) {
    rejectModalRef.value?.setError(
      error instanceof Error ? error.message : 'Помилка відхилення запиту',
    )
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  leaveRequestStore.fetchLeaveRequest(route.params.id as string)
})

onUnmounted(() => {
  leaveRequestStore.clearCurrentLeaveRequest()
})
</script>

<template>
  <div class="detail-view">
    <PageHeader title="Деталі запиту на відпустку" back-route="leave-requests" />

    <LoadingSpinner v-if="leaveRequestStore.isLoading" text="Завантаження..." />

    <div v-else-if="leaveRequestStore.error" class="state-center">
      <p class="error-text">{{ leaveRequestStore.error }}</p>
      <button
        class="btn-primary"
        @click="leaveRequestStore.fetchLeaveRequest(route.params.id as string)"
      >
        Спробувати ще раз
      </button>
    </div>

    <template v-else-if="leaveRequestStore.currentLeaveRequest">
      <div class="cards-layout">
        <Card>
          <template #header>
            <div class="card-header-row">
              <div>
                <span class="request-type">{{
                  getTypeLabel(leaveRequestStore.currentLeaveRequest.type)
                }}</span>
                <span class="request-dates">
                  {{ formatDate(leaveRequestStore.currentLeaveRequest.start_date) }} —
                  {{ formatDate(leaveRequestStore.currentLeaveRequest.end_date) }}
                </span>
              </div>
              <span
                class="status-pill"
                :class="`status-${leaveRequestStore.currentLeaveRequest.status}`"
              >
                {{ getStatusLabel(leaveRequestStore.currentLeaveRequest.status) }}
              </span>
            </div>
          </template>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">ID запиту</span>
              <span class="detail-value">#{{ leaveRequestStore.currentLeaveRequest.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Тип</span>
              <span class="detail-value">{{
                getTypeLabel(leaveRequestStore.currentLeaveRequest.type)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата початку</span>
              <span class="detail-value">{{
                formatDate(leaveRequestStore.currentLeaveRequest.start_date)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата кінця</span>
              <span class="detail-value">{{
                formatDate(leaveRequestStore.currentLeaveRequest.end_date)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Статус</span>
              <span class="detail-value">{{
                getStatusLabel(leaveRequestStore.currentLeaveRequest.status)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Створено</span>
              <span class="detail-value">{{
                formatDate(leaveRequestStore.currentLeaveRequest.created_at)
              }}</span>
            </div>
          </div>

          <template v-if="leaveRequestStore.currentLeaveRequest.reason" #footer>
            <div class="request-reason">
              <span class="detail-label">Причина</span>
              <p class="reason-text">{{ leaveRequestStore.currentLeaveRequest.reason }}</p>
            </div>
          </template>
        </Card>

        <Card v-if="leaveRequestStore.currentLeaveRequest.user">
          <template #header><h2>Заявник</h2></template>
          <div class="user-row">
            <Avatar
              :src="getAvatarUrl(leaveRequestStore.currentLeaveRequest.user.avatar) || undefined"
              :fallback-text="leaveRequestStore.currentLeaveRequest.user.name"
              size="medium"
              bordered
            />
            <div>
              <div class="user-name">{{ leaveRequestStore.currentLeaveRequest.user.name }}</div>
              <div class="user-email">{{ leaveRequestStore.currentLeaveRequest.user.email }}</div>
            </div>
          </div>
        </Card>

        <Card v-if="leaveRequestStore.currentLeaveRequest.manager_comment">
          <template #header>
            <h2>Коментар менеджера</h2>
            <div v-if="leaveRequestStore.currentLeaveRequest.processor" class="processor-row">
              <Avatar
                :src="
                  getAvatarUrl(leaveRequestStore.currentLeaveRequest.processor.avatar) || undefined
                "
                :fallback-text="leaveRequestStore.currentLeaveRequest.processor.name"
                size="small"
              />
              <span class="processor-name">{{
                leaveRequestStore.currentLeaveRequest.processor.name
              }}</span>
            </div>
          </template>
          <p class="comment-text">{{ leaveRequestStore.currentLeaveRequest.manager_comment }}</p>
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
    </template>

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
.request-reason {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
