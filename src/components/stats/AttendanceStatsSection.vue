<script setup lang="ts">
import { formatMinutes } from '@/core/utils/date'
import type { AttendanceStatistics } from '@/types/interfaces/timeEntrySummary.interface'
import StatCard from '@/components/ui/StatCard.vue'

defineProps<{
  attendance: AttendanceStatistics
}>()
</script>

<template>
  <div>
    <section class="section">
      <h2>Відвідуваність та дисципліна</h2>
      <div class="cards-row">
        <StatCard label="Вчасно" :value="attendance.on_time_count" variant="success" />
        <StatCard label="Запізнень" :value="attendance.late_count" variant="danger" />
        <StatCard label="Ранніх приходів" :value="attendance.early_count" />
        <StatCard label="Сер. запізнення" :value="`${attendance.average_late_minutes} хв`" />
        <StatCard
          label="Загалом запізнення"
          :value="formatMinutes(attendance.total_late_minutes)"
        />
      </div>
      <slot name="chart-attendance" />
    </section>

    <section class="section">
      <h2>Ранні виходи та понаднормові</h2>
      <div class="cards-row">
        <StatCard label="Ранніх виходів" :value="attendance.early_leave_count" />
        <StatCard
          label="Загалом ранніх виходів"
          :value="formatMinutes(attendance.total_early_leave_minutes)"
        />
        <StatCard
          label="Сер. ранній вихід"
          :value="`${attendance.average_early_leave_minutes} хв`"
        />
        <StatCard label="Понаднормових" :value="attendance.overtime_count" variant="success" />
        <StatCard
          label="Загалом понаднормових"
          :value="formatMinutes(attendance.total_overtime_minutes)"
        />
        <StatCard label="Сер. понаднормових" :value="`${attendance.average_overtime_minutes} хв`" />
      </div>
      <slot name="chart-overtime" />
    </section>
  </div>
</template>

<style scoped>
.section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.25rem;
}

.cards-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Override StatCard to use compact "flat" style inside this section */
.cards-row :deep(.stat-card) {
  flex: 1;
  min-width: 140px;
  background: #f9fafb;
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
</style>
