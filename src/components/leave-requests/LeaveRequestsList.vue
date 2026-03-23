<script setup lang="ts">
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import LeaveRequestItem from './LeaveRequestItem.vue'
import Pagination from '@/components/ui/Pagination.vue'

interface Props {
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  error: string | null
  pagination: PaginatedResponse<LeaveRequest>['meta'] | null
}

defineProps<Props>()

defineEmits<{
  retry: []
  create: []
  'page-change': [page: number]
}>()
</script>

<template>
  <div class="leave-requests-list">
    <div v-if="isLoading" class="loading-state">
      <p>Завантаження запитів...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">Спробувати знову</button>
    </div>

    <div v-else-if="leaveRequests.length === 0" class="empty-state">
      <p>У вас поки немає запитів на відпустку</p>
      <button @click="$emit('create')" class="create-button">Створити запит</button>
    </div>

    <div v-else class="requests-container">
      <LeaveRequestItem
        v-for="request in leaveRequests"
        :key="request.id"
        :leave-request="request"
      />

      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="pagination-wrapper">
        <Pagination :meta="pagination" @change-page="$emit('page-change', $event)" />
      </div>
      <div v-if="pagination && pagination.total > 0" class="pagination-info">
        Показано {{ pagination.last_page === 1 ? pagination.total : leaveRequests.length }} з
        {{ pagination.total }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.leave-requests-list {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state p {
  font-size: 16px;
  color: #666;
}

.error-state {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
}

.error-message {
  color: #856404;
  margin-bottom: 16px;
  font-size: 16px;
}

.retry-button {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #e0a800;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.create-button {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.create-button:hover {
  background: var(--accent-2-hover);
}

.requests-container {
  width: 100%;
}

.pagination-wrapper {
  margin-top: 1.25rem;
}

.pagination-info {
  text-align: center;
  margin-top: 0.625rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
