<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/stores/employee.store'
import { formatMinutes } from '@/core/utils/date'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import StatCard from '@/components/ui/StatCard.vue'
import PeriodSummaryTable from '@/components/stats/PeriodSummaryTable.vue'
import PeriodSummaryChart from '@/components/stats/PeriodSummaryChart.vue'
import AttendanceStatsSection from '@/components/stats/AttendanceStatsSection.vue'
import AttendanceChart from '@/components/stats/AttendanceChart.vue'
import OvertimeChart from '@/components/stats/OvertimeChart.vue'

const employeeStore = useEmployeeStore()
const summary = computed(() => employeeStore.timeSummary)
const hasData = computed(() => (summary.value?.working_days ?? 0) > 0)

onMounted(() => {
  if (!employeeStore.timeSummary) {
    employeeStore.fetchTimeSummary()
  }
})
</script>

<template>
  <div class="statistics-view">
    <PageHeader
      title="Розширена статистика"
      subtitle="Аналіз вашого робочого часу та відвідуваності"
      back-route="main"
    >
      <template #actions>
        <button
          v-if="hasData"
          class="btn-primary"
          @click="employeeStore.exportTimeEntries()"
          :disabled="employeeStore.isExporting"
        >
          <span v-if="employeeStore.isExporting">Завантаження...</span>
          <span v-else>📥 Скачати звіт</span>
        </button>
      </template>
    </PageHeader>

    <LoadingSpinner v-if="employeeStore.isLoadingSummary" text="Завантаження статистики..." />

    <div v-else-if="!summary" class="empty-state">
      <p>Статистика недоступна</p>
      <button class="btn-primary" @click="employeeStore.fetchTimeSummary()">Завантажити</button>
    </div>

    <div v-else class="content">
      <!-- Overview -->
      <section class="section">
        <h2>Загальний огляд</h2>
        <div class="cards-row">
          <StatCard
            label="Всього годин"
            :value="`${summary.total_hours}г ${summary.total_minutes % 60}хв`"
          />
          <StatCard label="Робочих днів" :value="summary.working_days" />
          <StatCard
            label="Середній робочий час"
            :value="formatMinutes(summary.average_work_time)"
          />
        </div>
      </section>

      <!-- Period Summary -->
      <section class="section">
        <h2>Розбивка по періодах</h2>
        <PeriodSummaryTable :summary="summary.summary" />
        <PeriodSummaryChart :summary="summary.summary" />
      </section>

      <!-- Attendance & Overtime -->
      <AttendanceStatsSection :attendance="summary.attendance">
        <template #chart-attendance>
          <AttendanceChart :attendance="summary.attendance" />
        </template>
        <template #chart-overtime>
          <OvertimeChart :attendance="summary.attendance" />
        </template>
      </AttendanceStatsSection>
    </div>
  </div>
</template>

<style scoped>
.statistics-view {
  max-width: var(--container-max);
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

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow);
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

@media (max-width: var(--bp-md)) {
  .statistics-view {
    padding: 1rem;
  }

  .cards-row {
    flex-direction: column;
  }
}
</style>
