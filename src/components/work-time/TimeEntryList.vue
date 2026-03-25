<script setup lang="ts">
import type { TimeEntry } from '@/types/interfaces/timeEntry.interface'
import TimeEntryListItem from './TimeEntryListItem.vue'

interface Props {
  entries: TimeEntry[]
  isLoading?: boolean
  showViewMore?: boolean
}

interface Emits {
  (event: 'view-more'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleViewMore() {
  emit('view-more')
}
</script>

<template>
  <div class="time-entry-list">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Завантаження записів...</p>
    </div>

    <div v-else-if="entries.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p class="empty-text">Записів робочого часу ще немає</p>
      <p class="empty-hint">Почніть роботу, щоб побачити записи тут</p>
    </div>

    <div v-else class="entries-container">
      <TimeEntryListItem v-for="entry in entries" :key="entry.id" :entry="entry" />

      <button v-if="showViewMore" class="btn-view-more" @click="handleViewMore">
        Переглянути все
      </button>
    </div>
  </div>
</template>

<style scoped>
.time-entry-list {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--accent-2);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 1rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.entries-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-view-more {
  width: 100%;
  padding: 0.875rem;
  margin-top: 0.5rem;
  background: var(--surface);
  border: 2px dashed var(--border);
  border-radius: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-more:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
  background: var(--sand-light);
}
</style>
