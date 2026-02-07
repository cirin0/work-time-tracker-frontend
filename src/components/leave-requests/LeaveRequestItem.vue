<template>
  <div class="leave-request-item">
    <div class="leave-request-header">
      <div class="leave-request-info">
        <div class="leave-request-type">
          <span class="type-badge" :class="`type-${leaveRequest.type}`">
            {{ getTypeLabel(leaveRequest.type) }}
          </span>
        </div>
        <div class="leave-request-dates">
          <span class="date-label">Період:</span>
          <span class="date-value">
            {{ formatDate(leaveRequest.start_date) }} - {{ formatDate(leaveRequest.end_date) }}
          </span>
        </div>
      </div>
      <div class="leave-request-status" :class="`status-${leaveRequest.status}`">
        {{ getStatusLabel(leaveRequest.status) }}
      </div>
    </div>

    <div class="leave-request-body">
      <div v-if="leaveRequest.reason" class="leave-request-reason">
        <span class="reason-label">Причина:</span>
        <p class="reason-text">{{ leaveRequest.reason }}</p>
      </div>

      <div v-if="leaveRequest.manager_comments" class="leave-request-comment">
        <span class="comment-label">Коментар менеджера:</span>
        <p class="comment-text">{{ leaveRequest.manager_comments }}</p>
      </div>
    </div>

    <div class="leave-request-footer">
      <span class="created-date">Створено: {{ formatDate(leaveRequest.created_at) }}</span>
      <span v-if="leaveRequest.updated_at !== leaveRequest.created_at" class="updated-date">
        Оновлено: {{ formatDate(leaveRequest.updated_at) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import { LeaveRequestStatus, LeaveRequestType } from '@/types/enums/enums.types'

interface Props {
  leaveRequest: LeaveRequest
}

defineProps<Props>()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

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

<style scoped>
.leave-request-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;
}

.leave-request-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.leave-request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
}

.leave-request-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.leave-request-type {
  margin-bottom: 4px;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
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

.leave-request-dates {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.date-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.leave-request-status {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
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

.leave-request-body {
  margin-bottom: 16px;
}

.leave-request-reason,
.leave-request-comment {
  margin-bottom: 12px;
}

.reason-label,
.comment-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.reason-text,
.comment-text {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.leave-request-comment {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.leave-request-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .leave-request-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .leave-request-footer {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
