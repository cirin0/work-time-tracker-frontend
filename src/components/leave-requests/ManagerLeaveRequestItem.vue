<script setup lang="ts">
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import { LeaveRequestStatus, LeaveRequestType } from '@/types/enums/enums.types'
import { formatDate } from '@/core/utils/date'

interface Props {
  leaveRequest: LeaveRequest
  isProcessing?: boolean
}

withDefaults(defineProps<Props>(), {
  isProcessing: false,
})

defineEmits<{
  approve: [id: number]
  reject: [id: number]
}>()

function getTypeLabel(type: LeaveRequestType): string {
  const labels: Record<LeaveRequestType, string> = {
    [LeaveRequestType.VACATION]: 'Відпустка',
    [LeaveRequestType.SICK]: 'Лікарняний',
    [LeaveRequestType.PERSONAL]: 'Особисті причини',
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
</script>

<template>
  <div class="manager-leave-request-item">
    <div class="request-header">
      <div class="request-info">
        <div class="employee-info">
          <span class="employee-name">{{ leaveRequest.user?.name || 'Невідомий' }}</span>
          <span class="employee-email">{{ leaveRequest.user?.email }}</span>
        </div>
        <div class="request-type">
          <span class="type-badge" :class="`type-${leaveRequest.type}`">
            {{ getTypeLabel(leaveRequest.type) }}
          </span>
        </div>
      </div>
      <div class="request-status" :class="`status-${leaveRequest.status}`">
        {{ getStatusLabel(leaveRequest.status) }}
      </div>
    </div>

    <div class="request-body">
      <div class="request-dates">
        <span class="dates-label">Період:</span>
        <span class="dates-value">
          {{ formatDate(leaveRequest.start_date) }} — {{ formatDate(leaveRequest.end_date) }}
        </span>
      </div>

      <div v-if="leaveRequest.reason" class="request-reason">
        <span class="reason-label">Причина:</span>
        <p class="reason-text">{{ leaveRequest.reason }}</p>
      </div>

      <div v-if="leaveRequest.manager_comment" class="manager-comments">
        <span class="comments-label">Коментар менеджера:</span>
        <p class="comments-text">{{ leaveRequest.manager_comment }}</p>
      </div>
    </div>

    <div v-if="leaveRequest.status === 'pending'" class="request-actions">
      <button
        @click="$emit('approve', leaveRequest.id)"
        class="btn-approve"
        :disabled="isProcessing"
      >
        ✓ Схвалити
      </button>
      <button @click="$emit('reject', leaveRequest.id)" class="btn-reject" :disabled="isProcessing">
        ✗ Відхилити
      </button>
    </div>

    <div class="request-footer">
      <span class="created-date">Створено: {{ formatDate(leaveRequest.created_at) }}</span>
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
}

.manager-leave-request-item:hover {
  border-color: #9333ea;
  box-shadow: 0 4px 6px rgba(147, 51, 234, 0.1);
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
  border-left: 3px solid #9333ea;
}

.request-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.btn-approve,
.btn-reject {
  flex: 1;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-approve {
  background: #d4edda;
  color: #155724;
}

.btn-approve:hover:not(:disabled) {
  background: #c3e6cb;
  transform: translateY(-1px);
}

.btn-reject {
  background: #f8d7da;
  color: #721c24;
}

.btn-reject:hover:not(:disabled) {
  background: #f1b0b7;
  transform: translateY(-1px);
}

.btn-approve:disabled,
.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.request-footer {
  font-size: 0.75rem;
  color: #9ca3af;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .request-header {
    flex-direction: column;
  }

  .request-actions {
    flex-direction: column;
  }
}
</style>
