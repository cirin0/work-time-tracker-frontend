<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLeaveRequestStore } from '@/stores/leaveRequest.store'
import { LeaveRequestStatus, LeaveRequestType } from '@/types/enums/enums.types'
import { formatDate } from '@/core/utils/date'
import { getAvatarUrl } from '@/core/utils/url'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const route = useRoute()
const leaveRequestStore = useLeaveRequestStore()

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

onMounted(() => {
  const id = route.params.id as string
  leaveRequestStore.fetchLeaveRequest(id)
})

onUnmounted(() => {
  leaveRequestStore.clearCurrentLeaveRequest()
})
</script>

<template>
  <div class="leave-request-detail-view">
    <PageHeader title="Деталі запиту на відпустку" back-route="leave-requests" />

    <LoadingSpinner v-if="leaveRequestStore.isLoading" text="Завантаження..." />

    <div v-else-if="leaveRequestStore.error" class="error-state">
      <div class="error-icon">!</div>
      <h2>Помилка завантаження</h2>
      <p>{{ leaveRequestStore.error }}</p>
      <button
        class="btn-primary"
        @click="leaveRequestStore.fetchLeaveRequest(route.params.id as string)"
      >
        Спробувати ще раз
      </button>
    </div>

    <div v-else-if="leaveRequestStore.currentLeaveRequest" class="detail-card">
      <div class="detail-header" :class="`header-${leaveRequestStore.currentLeaveRequest.status}`">
        <div class="header-top">
          <span class="type-badge" :class="`type-${leaveRequestStore.currentLeaveRequest.type}`">
            {{ getTypeLabel(leaveRequestStore.currentLeaveRequest.type) }}
          </span>
          <span
            class="status-badge"
            :class="`status-${leaveRequestStore.currentLeaveRequest.status}`"
          >
            {{ getStatusLabel(leaveRequestStore.currentLeaveRequest.status) }}
          </span>
        </div>
        <div class="header-dates">
          <span class="date-range">
            {{ formatDate(leaveRequestStore.currentLeaveRequest.start_date) }}
            —
            {{ formatDate(leaveRequestStore.currentLeaveRequest.end_date) }}
          </span>
        </div>
      </div>

      <div class="detail-body">
        <!-- User info -->
        <div v-if="leaveRequestStore.currentLeaveRequest.user" class="info-section">
          <h3 class="section-title">Заявник</h3>
          <div class="user-info">
            <div class="user-avatar">
              <img
                v-if="getAvatarUrl(leaveRequestStore.currentLeaveRequest.user.avatar)"
                :src="getAvatarUrl(leaveRequestStore.currentLeaveRequest.user.avatar)!"
                :alt="leaveRequestStore.currentLeaveRequest.user.name"
                class="avatar"
              />
              <div v-else class="avatar-placeholder">
                {{ leaveRequestStore.currentLeaveRequest.user.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="user-meta">
              <span class="user-name">{{ leaveRequestStore.currentLeaveRequest.user.name }}</span>
              <span class="user-email">{{ leaveRequestStore.currentLeaveRequest.user.email }}</span>
            </div>
          </div>
        </div>

        <!-- Reason -->
        <div v-if="leaveRequestStore.currentLeaveRequest.reason" class="info-section">
          <h3 class="section-title">Причина</h3>
          <p class="section-text">{{ leaveRequestStore.currentLeaveRequest.reason }}</p>
        </div>

        <!-- Manager comment -->
        <div v-if="leaveRequestStore.currentLeaveRequest.manager_comment" class="info-section">
          <h3 class="section-title">Коментар менеджера</h3>
          <div class="manager-comment-block">
            <div v-if="leaveRequestStore.currentLeaveRequest.processor" class="processor-info">
              <div class="processor-avatar">
                <img
                  v-if="getAvatarUrl(leaveRequestStore.currentLeaveRequest.processor.avatar)"
                  :src="getAvatarUrl(leaveRequestStore.currentLeaveRequest.processor.avatar)!"
                  :alt="leaveRequestStore.currentLeaveRequest.processor.name"
                  class="avatar-small"
                />
                <div v-else class="avatar-placeholder-small">
                  {{ leaveRequestStore.currentLeaveRequest.processor.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <span class="processor-name">
                {{ leaveRequestStore.currentLeaveRequest.processor.name }}
              </span>
            </div>
            <p class="section-text">{{ leaveRequestStore.currentLeaveRequest.manager_comment }}</p>
          </div>
        </div>

        <!-- Details grid -->
        <div class="info-section">
          <h3 class="section-title">Деталі</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">ID запиту</span>
              <span class="detail-value">#{{ leaveRequestStore.currentLeaveRequest.id }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Тип</span>
              <span class="detail-value">
                {{ getTypeLabel(leaveRequestStore.currentLeaveRequest.type) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Статус</span>
              <span class="detail-value">
                {{ getStatusLabel(leaveRequestStore.currentLeaveRequest.status) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата початку</span>
              <span class="detail-value">
                {{ formatDate(leaveRequestStore.currentLeaveRequest.start_date) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Дата кінця</span>
              <span class="detail-value">
                {{ formatDate(leaveRequestStore.currentLeaveRequest.end_date) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Створено</span>
              <span class="detail-value">
                {{ formatDate(leaveRequestStore.currentLeaveRequest.created_at) }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Оновлено</span>
              <span class="detail-value">
                {{ formatDate(leaveRequestStore.currentLeaveRequest.updated_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leave-request-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* Loading & Error */
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1rem;
}

.error-state h2 {
  color: #991b1b;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

/* Detail Card */
.detail-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.detail-header {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.header-approved {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.header-rejected {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.type-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.type-vacation {
  background: #dbeafe;
  color: #1d4ed8;
}

.type-sick {
  background: #fce7f3;
  color: #be185d;
}

.type-personal {
  background: #f3e8ff;
  color: #7c3aed;
}

.status-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
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

.header-dates {
  display: flex;
  align-items: center;
}

.date-range {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

/* Body */
.detail-body {
  padding: 1.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1.5rem;
}

.info-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.section-text {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* User info */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.user-email {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Manager comment */
.manager-comment-block {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 3px solid #2563eb;
}

.processor-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

.processor-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

/* Details grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1f2937;
}

@media (max-width: 640px) {
  .leave-request-detail-view {
    padding: 1rem;
  }

  .detail-header {
    padding: 1.5rem;
  }

  .detail-body {
    padding: 1rem 1.5rem 1.5rem;
  }

  .date-range {
    font-size: 1.25rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
