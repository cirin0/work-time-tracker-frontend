<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import { LeaveRequestStatus, LeaveRequestType } from '@/types/enums/enums.types'
import { formatDate } from '@/core/utils/date'

interface Props {
  leaveRequest: LeaveRequest
}

const props = defineProps<Props>()

const router = useRouter()

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

function goToDetails() {
  router.push({ name: 'manager-leave-request-detail', params: { id: props.leaveRequest.id } })
}
</script>

<template>
  <div class="manager-leave-request-item" @click="goToDetails">
    <div class="request-header">
      <div class="request-info">
        <div class="employee-info">
          <span class="employee-name">{{ props.leaveRequest.user?.name || 'Невідомий' }}</span>
          <span class="employee-email">{{ props.leaveRequest.user?.email }}</span>
        </div>
        <div class="request-type">
          <span class="type-badge" :class="`type-${props.leaveRequest.type}`">
            {{ getTypeLabel(props.leaveRequest.type) }}
          </span>
        </div>
      </div>
      <div class="request-status" :class="`status-${props.leaveRequest.status}`">
        {{ getStatusLabel(props.leaveRequest.status) }}
      </div>
    </div>

    <div class="request-body">
      <div class="request-dates">
        <span class="dates-label">Період:</span>
        <span class="dates-value">
          {{ formatDate(props.leaveRequest.start_date) }} —
          {{ formatDate(props.leaveRequest.end_date) }}
        </span>
      </div>

      <div v-if="props.leaveRequest.reason" class="request-reason">
        <span class="reason-label">Причина:</span>
        <p class="reason-text">{{ props.leaveRequest.reason }}</p>
      </div>

      <div v-if="props.leaveRequest.manager_comment" class="manager-comments">
        <span class="comments-label">Коментар менеджера:</span>
        <p class="comments-text">{{ props.leaveRequest.manager_comment }}</p>
      </div>
    </div>

    <div class="request-footer">
      <span class="created-date">Створено: {{ formatDate(props.leaveRequest.created_at) }}</span>
      <span class="view-hint">Натисніть для перегляду деталей →</span>
    </div>
  </div>
</template>

<style scoped>
.manager-leave-request-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
  cursor: pointer;
}

.manager-leave-request-item:hover {
  border-color: var(--accent-2);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.15);
  transform: translateY(-2px);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  gap: 1rem;
}

.request-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.employee-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.employee-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.request-type {
  margin-top: 0.25rem;
}

.type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-vacation {
  background: #e3f2fd;
  color: #1565c0;
}

.type-sick {
  background: #fce4ec;
  color: #c2185b;
}

.type-personal {
  background: #f3e5f5;
  color: #7b1fa2;
}

.request-status {
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.request-body {
  margin-bottom: 1rem;
}

.request-dates {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.dates-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.dates-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.request-reason,
.manager-comments {
  margin-bottom: 0.75rem;
}

.reason-label,
.comments-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.reason-text,
.comments-text {
  margin: 0;
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.5;
}

.manager-comments {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border-left: 3px solid var(--accent-2);
}

.request-footer {
  font-size: 0.75rem;
  color: #9ca3af;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-hint {
  color: var(--accent-2);
  font-weight: 500;
  font-size: 0.8rem;
}

@media (max-width: var(--bp-md)) {
  .request-header {
    flex-direction: column;
  }

  .view-hint {
    display: none;
  }
}
</style>
