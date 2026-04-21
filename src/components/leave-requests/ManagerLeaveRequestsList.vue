<script setup lang="ts">
import type { LeaveRequest } from '@/types/interfaces/leaveRequest.interface'
import ManagerLeaveRequestItem from './ManagerLeaveRequestItem.vue'

interface Props {
  leaveRequests: LeaveRequest[]
  isLoading: boolean
  error: string | null
}

defineProps<Props>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="manager-leave-requests-list">
    <div v-if="isLoading" class="loading-state">
      <p>Завантаження запитів...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">Спробувати знову</button>
    </div>

    <div v-else-if="leaveRequests.length === 0" class="empty-state">
      <p>Немає запитів на відпустку від ваших працівників</p>
    </div>

    <div v-else class="requests-container">
      <ManagerLeaveRequestItem
        v-for="request in leaveRequests"
        :key="request.id"
        :leave-request="request"
      />
    </div>
  </div>
</template>

<style scoped>
.manager-leave-requests-list {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.loading-state p {
  font-size: 1rem;
  color: var(--text-muted);
}

.error-state {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 0.75rem;
}

.error-message {
  color: var(--error-text);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.retry-button {
  background: var(--error-text);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  filter: brightness(0.9);
}

.empty-state p {
  font-size: 1rem;
  color: var(--text-muted);
}

.requests-container {
  width: 100%;
  margin-top: 5px;
}
</style>
