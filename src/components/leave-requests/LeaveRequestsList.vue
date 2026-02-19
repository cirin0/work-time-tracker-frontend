<script setup lang="ts">
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import LeaveRequestItem from './LeaveRequestItem.vue'

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

      <div v-if="pagination" class="pagination">
        <button
          @click="$emit('page-change', pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="pagination-button"
        >
          Назад
        </button>
        <span class="pagination-info">
          Сторінка {{ pagination.current_page }} з {{ pagination.last_page }}
        </span>
        <button
          @click="$emit('page-change', pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="pagination-button"
        >
          Далі
        </button>
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
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.create-button:hover {
  background: #218838;
}

.requests-container {
  width: 100%;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 20px;
}

.pagination-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #0056b3;
}

.pagination-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
  }
}
</style>
