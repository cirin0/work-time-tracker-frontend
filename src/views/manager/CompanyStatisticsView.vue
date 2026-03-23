<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useManagerStore } from '@/stores/manager.store.ts'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import StatCard from '@/components/ui/StatCard.vue'
import PeriodSummaryTable from '@/components/stats/PeriodSummaryTable.vue'
import AttendanceStatsSection from '@/components/stats/AttendanceStatsSection.vue'

const managerStore = useManagerStore()
const stats = computed(() => managerStore.companyStats)

onMounted(() => {
  managerStore.fetchCompanyStatistics()
})
</script>

<template>
  <div class="statistics-view">
    <PageHeader
      title="Розширена статистика компанії"
      subtitle="Аналіз робочого часу та відвідуваності"
      back-route="manager"
    />

    <LoadingSpinner v-if="managerStore.isLoadingStats" text="Завантаження статистики..." />

    <div v-else-if="!stats" class="empty-state">
      <p>Статистика недоступна</p>
      <button @click="managerStore.fetchCompanyStatistics()" class="btn-primary">
        Завантажити
      </button>
    </div>

    <div v-else class="content">
      <section class="section">
        <h2>Загальний огляд</h2>
        <div class="cards-row">
          <StatCard
            label="Всього годин"
            :value="`${stats.total_hours}г ${stats.total_minutes % 60}хв`"
          />
          <StatCard label="Всього записів" :value="stats.total_entries_count" />
          <StatCard label="Робочих днів (сума)" :value="stats.total_working_days" />
          <StatCard
            label="Сер. днів на працівника"
            :value="stats.average_working_days_per_employee"
          />
          <StatCard label="Активних зараз" :value="stats.active_employees" />
          <StatCard label="Унікальних працівників" :value="stats.total_employees_with_entries" />
        </div>
      </section>

      <section class="section">
        <h2>Розбивка по періодах</h2>
        <PeriodSummaryTable :summary="stats.summary" />
        <div class="chart-placeholder">
          <span>📊 Тут буде графік по тижнях/місяцях</span>
        </div>
      </section>

      <AttendanceStatsSection :attendance="stats.attendance">
        <template #chart-attendance>
          <div class="chart-placeholder">
            <span>🕐 Тут буде графік запізнень по днях</span>
          </div>
        </template>
        <template #chart-overtime>
          <div class="chart-placeholder">
            <span>📈 Тут буде графік понаднормових</span>
          </div>
        </template>
      </AttendanceStatsSection>
    </div>
  </div>
</template>

<style scoped>
.statistics-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  color: var(--header-text);
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: var(--surface);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 1.25rem;
}

.cards-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.cards-row :deep(.stat-card) {
  flex: 1;
  min-width: 140px;
  background: var(--sand-light);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  box-shadow: none;
  gap: 0;
}

.cards-row :deep(.stat-card:hover) {
  transform: none;
  box-shadow: none;
}

.cards-row :deep(.stat-value) {
  font-size: 1.5rem;
}

.cards-row :deep(.stat-icon) {
  display: none;
}

.chart-placeholder {
  margin-top: 1.25rem;
  padding: 2rem;
  border: 2px dashed var(--border);
  border-radius: 0.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .statistics-view {
    padding: 1rem;
  }
}
</style>
