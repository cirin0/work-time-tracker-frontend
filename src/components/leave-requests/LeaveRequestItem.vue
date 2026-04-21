<script setup lang="ts">
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import { LeaveRequestStatus, LeaveRequestType } from '@/types/enums/enums.types'
import { formatDate } from '@/core/utils/date'

interface Props {
  leaveRequest: LeaveRequest
}

defineProps<Props>()

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
</script>

<template>
  <router-link
    :to="{ name: 'leave-request-detail', params: { id: leaveRequest.id } }"
    class="leave-request-item"
  >
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

      <div v-if="leaveRequest.manager_comment" class="leave-request-comment">
        <span class="comment-label">Коментар менеджера:</span>
        <p class="comment-text">{{ leaveRequest.manager_comment }}</p>
      </div>
    </div>

    <div class="leave-request-footer">
      <span class="created-date">Створено: {{ formatDate(leaveRequest.created_at) }}</span>
    </div>
  </router-link>
</template>

<style scoped>
.leave-request-item {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
  cursor: pointer;
}

.leave-request-item:hover {
  box-shadow: 0 2px 8px var(--shadow);
  border-color: var(--accent-2);
}

.leave-request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
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
  background: var(--info-bg);
  color: var(--info-text);
  border: 1px solid var(--info-border);
}

.type-sick {
  background: var(--pink-bg);
  color: var(--pink-text);
  border: 1px solid var(--pink-border);
}

.type-personal {
  background: var(--purple-bg);
  color: var(--purple-text);
  border: 1px solid var(--purple-border);
}

.type-unpaid {
  background: var(--sand-light);
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.type-business_trip {
  background: var(--role-admin-bg);
  color: var(--role-admin-color);
  border: 1px solid var(--role-admin-border);
}

.leave-request-dates {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.date-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.leave-request-status {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 1px solid var(--warning-border);
}

.status-approved {
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.status-rejected {
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
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
  color: var(--text);
  margin-bottom: 6px;
}

.reason-text,
.comment-text {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
}

.leave-request-comment {
  background: var(--bg);
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid var(--accent-2);
}

.leave-request-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

@media (max-width: var(--bp-md)) {
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
