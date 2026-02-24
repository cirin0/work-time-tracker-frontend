<script setup lang="ts">
import type { PaginatedResponse } from '@/types/responses/pagination.interface'

defineOptions({
  name: 'PaginationControl',
})

interface Props {
  meta: PaginatedResponse<unknown>['meta']
}

defineProps<Props>()

const emit = defineEmits<{
  changePage: [page: number]
}>()

function handlePageChange(page: number | null) {
  if (page !== null) {
    emit('changePage', page)
  }
}

function parsePage(label: string): number | null {
  const n = parseInt(label, 10)
  return isNaN(n) ? null : n
}
</script>

<template>
  <div v-if="meta && meta.last_page > 1" class="pagination">
    <!-- Кнопка на першу сторінку -->
    <button
      class="pagination-btn pagination-edge"
      :disabled="meta.current_page === 1"
      @click="handlePageChange(1)"
      title="Перша сторінка"
    >
      ⏮
    </button>

    <button
      class="pagination-btn"
      :disabled="meta.current_page === 1"
      @click="handlePageChange(meta.current_page - 1)"
    >
      ←
    </button>

    <div class="pagination-pages">
      <button
        v-for="(link, index) in meta.links.filter((l) => parsePage(l.label) !== null)"
        :key="index"
        class="pagination-page"
        :class="{ active: link.active }"
        @click="handlePageChange(parsePage(link.label))"
      >
        {{ link.label }}
      </button>
    </div>

    <!-- Наступна сторінка -->
    <button
      class="pagination-btn"
      :disabled="meta.current_page === meta.last_page"
      @click="handlePageChange(meta.current_page + 1)"
    >
      →
    </button>

    <!-- Кнопка на останню сторінку -->
    <button
      class="pagination-btn pagination-edge"
      :disabled="meta.current_page === meta.last_page"
      @click="handlePageChange(meta.last_page)"
      title="Остання сторінка"
    >
      ⏭
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9333ea;
  color: #9333ea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-edge {
  min-width: 2.5rem;
  padding: 0.5rem;
  font-size: 1.1rem;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 2.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-page:hover {
  background: #f9fafb;
  border-color: #9333ea;
  color: #9333ea;
}

.pagination-page.active {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  border-color: #9333ea;
  color: white;
}

@media (max-width: 640px) {
  .pagination {
    flex-wrap: wrap;
  }

  .pagination-pages {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>
