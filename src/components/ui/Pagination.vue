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
  border-top: 1px solid var(--border);
}

.pagination-btn {
  padding: 0.5rem 1rem;
  background: var(--sand-light);
  border: 1.5px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.pagination-edge {
  min-width: 2.5rem;
  padding: 0.5rem;
}

.pagination-pages {
  display: flex;
  gap: 0.35rem;
}

.pagination-page {
  min-width: 2.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--surface, #fff);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-page:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
  transform: translateY(-1px);
}

.pagination-page.active {
  background: var(--accent-2);
  border-color: var(--accent-2);
  color: var(--btn-on-accent);
  box-shadow: 0 4px 12px rgba(255, 155, 81, 0.35);
}

@media (max-width: var(--bp-sm)) {
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
