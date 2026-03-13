<script setup lang="ts">
import type { TimeEntrySummaryPeriod } from '@/types/interfaces/timeEntrySummary.interface'

defineProps<{
  summary: TimeEntrySummaryPeriod
}>()
</script>

<template>
  <div class="period-table">
    <table>
      <thead>
        <tr>
          <th>Період</th>
          <th>Годин</th>
          <th>Хвилин</th>
          <th>Робочих днів</th>
          <th>Запізнень</th>
          <th>Ранніх приходів</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Сьогодні</td>
          <td>{{ summary.today.hours }}</td>
          <td>{{ summary.today.minutes }}</td>
          <td>{{ summary.today.working_days }}</td>
          <td>{{ summary.today.late_count }}</td>
          <td>{{ summary.today.early_count }}</td>
        </tr>
        <tr>
          <td>Цього тижня</td>
          <td>{{ summary.week.hours }}</td>
          <td>{{ summary.week.minutes }}</td>
          <td>{{ summary.week.working_days }}</td>
          <td>{{ summary.week.late_count }}</td>
          <td>{{ summary.week.early_count }}</td>
        </tr>
        <tr>
          <td>Цього місяця</td>
          <td>{{ summary.month.hours }}</td>
          <td>{{ summary.month.minutes }}</td>
          <td>{{ summary.month.working_days }}</td>
          <td>{{ summary.month.late_count }}</td>
          <td>{{ summary.month.early_count }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.period-table {
  overflow-x: auto;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead tr {
  background: #f3f4f6;
}

th,
td {
  padding: 0.6rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  font-weight: 600;
  color: #374151;
}

td {
  color: #4b5563;
}

tr:last-child td {
  border-bottom: none;
}
</style>
