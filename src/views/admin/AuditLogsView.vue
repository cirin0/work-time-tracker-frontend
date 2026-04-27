<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuditLogStore } from '@/stores/audit.store'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { formatDateTime } from '@/core/utils/date'
import Card from '@/components/ui/Card.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Pagination from '@/components/ui/Pagination.vue'

const auditStore = useAuditLogStore()
const { isAdmin, isManager } = useRoleGuard()

const currentPage = ref(1)
const selectedAction = ref<string>('')
const selectedModel = ref<string>('')
const isLoadingInitialData = ref(true)

const filteredLogs = computed(() => {
  if (!selectedAction.value && !selectedModel.value) {
    return auditStore.logs
  }

  return auditStore.logs.filter((log) => {
    const matchesAction = !selectedAction.value || log.action === selectedAction.value
    const matchesModel = !selectedModel.value || log.model_type === selectedModel.value
    return matchesAction && matchesModel
  })
})

const canViewAllLogs = computed(() => isAdmin.value || isManager.value)

onMounted(async () => {
  isLoadingInitialData.value = true
  try {
    if (canViewAllLogs.value) {
      await auditStore.fetchLogs(1)
    } else {
      await auditStore.fetchUserLogs(1)
    }
  } finally {
    isLoadingInitialData.value = false
  }
})

async function loadPage(page: number) {
  currentPage.value = page
  if (canViewAllLogs.value) {
    await auditStore.fetchLogs(page)
  } else {
    await auditStore.fetchUserLogs(page)
  }
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    created: 'Створено',
    updated: 'Оновлено',
    deleted: 'Видалено',
    exported: 'Експортовано',
  }
  return labels[action] || action
}

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    created: 'var(--accent-2)',
    updated: 'var(--text)',
    deleted: 'var(--error-text)',
    exported: 'var(--text-muted)',
  }
  return colors[action] ?? 'var(--text)'
}

function getModelName(modelType: string | null): string {
  if (!modelType) return 'Unknown'
  const parts = modelType.split('\\')
  return parts[parts.length - 1] || 'Unknown'
}

function resetFilters() {
  selectedAction.value = ''
  selectedModel.value = ''
}
</script>

<template>
  <div class="audit-logs-page">
    <div class="page-header">
      <h1>
        <span class="header-icon">📋</span>
        Журнал аудиту
      </h1>
      <p v-if="!canViewAllLogs" class="header-subtitle">Ваша особиста історія дій в системі</p>
      <p v-else class="header-subtitle">
        {{ isAdmin ? 'Вся' : 'Компанійна' }} історія змін в системі
      </p>
    </div>

    <LoadingSpinner v-if="isLoadingInitialData" text="Завантаження логів..." />

    <template v-else>
      <!-- Filters -->
      <Card>
        <div class="filters-section">
          <h3>Фільтри</h3>
          <div class="filters-grid">
            <div class="filter-group">
              <label>По дії:</label>
              <select v-model="selectedAction" class="filter-select">
                <option value="">Все</option>
                <option v-for="action in auditStore.availableActions" :key="action" :value="action">
                  {{ getActionLabel(action) }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>По типу:</label>
              <select v-model="selectedModel" class="filter-select">
                <option value="">Все</option>
                <option v-for="model in auditStore.availableModelTypes" :key="model" :value="model">
                  {{ getModelName(model) }}
                </option>
              </select>
            </div>

            <button v-if="selectedAction || selectedModel" @click="resetFilters" class="btn-reset">
              ✕ Скинути фільтри
            </button>
          </div>
        </div>
      </Card>

      <!-- Error message -->
      <Card v-if="auditStore.error" class="error-card">
        <div class="error-content">
          <span class="error-icon">⚠️</span>
          <p>{{ auditStore.error }}</p>
        </div>
      </Card>

      <!-- Logs Table -->
      <Card v-if="filteredLogs.length > 0">
        <div class="logs-table-wrapper">
          <table class="logs-table">
            <thead>
              <tr>
                <th>Дія</th>
                <th>Об'єкт</th>
                <th>Користувач</th>
                <th>IP адреса</th>
                <th>Дата та час</th>
                <th>Деталі</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in filteredLogs" :key="log.id" class="log-row">
                <td>
                  <span class="action-badge" :style="{ color: getActionColor(log.action) }">
                    {{ getActionLabel(log.action) }}
                  </span>
                </td>
                <td>
                  <div class="model-info">
                    <span class="model-type">{{ getModelName(log.model_type) }}</span>
                    <span v-if="log.model_id" class="model-id">#{{ log.model_id }}</span>
                  </div>
                </td>
                <td>
                  <div v-if="log.user" class="user-info">
                    <div class="user-name">{{ log.user.name }}</div>
                    <div class="user-email">{{ log.user.email }}</div>
                  </div>
                  <div v-else class="user-info text-muted">Системна дія</div>
                </td>
                <td>
                  <code v-if="log.ip_address" class="ip-code">{{ log.ip_address }}</code>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <span class="datetime">{{ formatDateTime(log.created_at) }}</span>
                </td>
                <td>
                  <details class="details-dropdown">
                    <summary class="details-summary">Показати</summary>
                    <div class="details-content">
                      <div v-if="log.old_values" class="change-block">
                        <h5>Старі значення:</h5>
                        <pre>{{ JSON.stringify(log.old_values, null, 2) }}</pre>
                      </div>
                      <div v-if="log.new_values" class="change-block">
                        <h5>Нові значення:</h5>
                        <pre>{{ JSON.stringify(log.new_values, null, 2) }}</pre>
                      </div>
                      <div v-if="log.user_agent" class="change-block">
                        <h5>Браузер:</h5>
                        <code class="user-agent">{{ log.user_agent }}</code>
                      </div>
                    </div>
                  </details>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="auditStore.pagination" class="pagination-wrapper">
          <Pagination :meta="auditStore.pagination" @change-page="loadPage" />
        </div>
      </Card>

      <!-- Empty state -->
      <Card v-else>
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>Логів не знайдено</h3>
          <p>Поки немає запису про дії, які відповідають вибраним фільтрам</p>
        </div>
      </Card>
    </template>
  </div>
</template>

<style scoped>
.audit-logs-page {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-icon {
  font-size: 1.5em;
}

.header-subtitle {
  font-family: var(--font-body);
  color: var(--text-muted);
  margin: 0;
  font-size: 0.95rem;
}

/* Filters Section */
.filters-section {
  padding: 1.5rem;
  background: var(--surface);
  border-radius: 8px;
}

.filters-section h3 {
  margin: 0 0 1rem 0;
  font-family: var(--font-heading);
  font-size: 1rem;
  color: var(--text);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--text);
  font-weight: 500;
}

.filter-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover {
  border-color: var(--accent-2);
}

.filter-select:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 2px;
}

.btn-reset {
  padding: 0.625rem 1rem;
  background: var(--sand-light);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background: var(--border);
  border-color: var(--accent-2);
}

.btn-reset:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 2px;
}

/* Error Card */
.error-card {
  margin-top: 1rem;
  border-left: 4px solid var(--error-text);
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--error-text);
}

.error-icon {
  font-size: 1.25em;
  flex-shrink: 0;
}

.error-content p {
  margin: 0;
  font-family: var(--font-body);
}

/* Logs Table */
.logs-table-wrapper {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
  font-size: 0.9rem;
}

.logs-table thead {
  background: var(--surface);
  border-bottom: 2px solid var(--border);
}

.logs-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.logs-table tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease;
}

.logs-table tbody tr:hover {
  background-color: var(--surface);
}

.logs-table td {
  padding: 1rem;
  color: var(--text);
  vertical-align: top;
}

/* Action Badge */
.action-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: rgba(255, 155, 81, 0.1);
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.85rem;
}

/* Model Info */
.model-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.model-type {
  font-weight: 500;
  color: var(--text);
}

.model-id {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* User Info */
.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 500;
  color: var(--text);
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.user-info.text-muted {
  color: var(--text-muted);
}

/* IP Code */
.ip-code {
  display: block;
  padding: 0.25rem 0.5rem;
  background: var(--surface);
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--text);
  word-break: break-all;
}

/* DateTime */
.datetime {
  color: var(--text);
  white-space: nowrap;
}

/* Details Dropdown */
.details-dropdown {
  cursor: pointer;
}

.details-summary {
  padding: 0.375rem 0.75rem;
  background: var(--sand-light);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-weight: 500;
  font-size: 0.85rem;
  user-select: none;
  transition: all 0.2s ease;
}

.details-summary:hover {
  background: var(--border);
}

.details-summary:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 2px;
}

.details-dropdown[open] .details-summary {
  background: var(--accent-2);
  color: var(--btn-on-accent);
  border-color: var(--accent-2);
}

.details-content {
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 4px 4px;
  margin-top: -1px;
}

.change-block {
  margin-bottom: 1rem;
}

.change-block:last-child {
  margin-bottom: 0;
}

.change-block h5 {
  margin: 0 0 0.5rem 0;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 600;
}

.change-block pre {
  margin: 0;
  padding: 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--text);
  line-height: 1.5;
}

.user-agent {
  display: block;
  padding: 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  color: var(--text);
  word-break: break-all;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 1.25rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-family: var(--font-heading);
  font-size: 1.25rem;
  color: var(--text);
}

.empty-state p {
  margin: 0;
  color: var(--text-muted);
  font-family: var(--font-body);
}

/* Responsive */
@media (max-width: var(--bp-md)) {
  .audit-logs-page {
    padding: 1rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .logs-table {
    font-size: 0.8rem;
  }

  .logs-table th,
  .logs-table td {
    padding: 0.75rem 0.5rem;
  }
}

.text-muted {
  color: var(--text-muted);
}
</style>
