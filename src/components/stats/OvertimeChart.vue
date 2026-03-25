<script setup lang="ts">
import type { AttendanceStatistics } from '@/types/interfaces/timeEntrySummary.interface'
import { computed } from 'vue'
import { Bar as BarChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  attendance: AttendanceStatistics
}>()

const overtimeData = computed(() => {
  const totalMinutes = props.attendance.total_overtime_minutes
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const avgHours = Math.floor(props.attendance.average_overtime_minutes / 60)
  const avgMinutes = props.attendance.average_overtime_minutes % 60

  return {
    count: props.attendance.overtime_count,
    totalHours: hours,
    totalMinutes: minutes,
    avgHours,
    avgMinutes,
  }
})

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: ['Днів з понаднормом', 'Всього годин', 'Сер. на день'],
  datasets: [
    {
      label: 'Значення',
      data: [overtimeData.value.count, overtimeData.value.totalHours, overtimeData.value.avgHours],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
      borderColor: ['#1d4ed8', '#d97706', '#059669'],
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 14, weight: 600 },
      bodyFont: { size: 13 },
      cornerRadius: 4,
      callbacks: {
        label: (context: TooltipItem<'bar'>) => {
          const labels = ['днів', 'годин', 'годин']
          const index = context.dataIndex ?? 0
          const rawValue = context.parsed.x
          const value = typeof rawValue === 'number' ? rawValue : 0
          return `${Math.round(value)} ${labels[index]}`
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(200, 200, 200, 0.1)',
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
}))
</script>

<template>
  <div class="overtime-chart">
    <div v-if="overtimeData.count > 0" class="chart-container">
      <BarChart :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="empty-state">
      <span>Немає повідомлень про понаднормові години</span>
    </div>
  </div>
</template>

<style scoped>
.overtime-chart {
  margin-top: 1rem;
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 220px;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  background: var(--sand-light);
  border-radius: 0.5rem;
  border: 1px dashed var(--border);
}

@media (max-width: 600px) {
  .chart-container {
    height: 180px;
  }
}
</style>
