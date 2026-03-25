<script setup lang="ts">
import type {
  TimeEntrySummaryPeriod,
  TimeEntrySummaryPeriodItem,
} from '@/types/interfaces/timeEntrySummary.interface'
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
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  summary: TimeEntrySummaryPeriod
}>()

function getPeriodItemByIndex(index?: number): TimeEntrySummaryPeriodItem {
  switch (index) {
    case 1:
      return props.summary.week
    case 2:
      return props.summary.month
    default:
      return props.summary.today
  }
}

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: ['Сьогодні', 'Цей тиждень', 'Цей місяць'],
  datasets: [
    {
      label: 'Робочих годин',
      data: [props.summary.today.hours, props.summary.week.hours, props.summary.month.hours],
      backgroundColor: ['#ff9b51', '#ff8c42', '#ff7d33'],
      borderColor: ['#e88a3d', '#e67b2e', '#e66a1e'],
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
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
          const hours = context.parsed.y
          const period = getPeriodItemByIndex(context.dataIndex)
          const minutes = period.minutes
          return `${hours}г ${minutes}хв`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(200, 200, 200, 0.1)',
      },
      ticks: {
        callback: (value: string | number) => `${value}г`,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}))
</script>

<template>
  <div class="period-chart">
    <BarChart :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.period-chart {
  width: 100%;
  height: 300px;
}
</style>
