<script setup lang="ts">
import type { AttendanceStatistics } from '@/types/interfaces/timeEntrySummary.interface'
import { computed } from 'vue'
import { Doughnut as DoughnutChart } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  attendance: AttendanceStatistics
}>()

const dashboardData = computed(() => {
  const total =
    props.attendance.on_time_count + props.attendance.late_count + props.attendance.early_count
  return {
    total,
    onTime: props.attendance.on_time_count,
    late: props.attendance.late_count,
    early: props.attendance.early_count,
  }
})

const chartData = computed(() => ({
  labels: ['Вчасно', 'Запізнення', 'Рано'],
  datasets: [
    {
      data: [dashboardData.value.onTime, dashboardData.value.late, dashboardData.value.early],
      backgroundColor: ['#4ade80', '#ef4444', '#3b82f6'],
      borderColor: ['#22c55e', '#dc2626', '#1d4ed8'],
      borderWidth: 2,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 13,
          weight: '500',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 14, weight: '600' },
      bodyFont: { size: 13 },
      cornerRadius: 4,
      callbacks: {
        label: (context: { parsed: number }) => {
          const value = context.parsed
          const total = dashboardData.value.total
          const percent = total > 0 ? Math.round((value / total) * 100) : 0
          return `${value} днів (${percent}%)`
        },
      },
    },
  },
}))
</script>

<template>
  <div class="attendance-chart">
    <div v-if="dashboardData.total > 0" class="chart-container">
      <DoughnutChart :data="chartData" :options="chartOptions as any" />
    </div>
    <div v-else class="empty-message">Немає даних про відвідуваність</div>
  </div>
</template>

<style scoped>
.attendance-chart {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  background: var(--sand-light);
  border-radius: 0.5rem;
  border: 1px dashed var(--border);
}
</style>
