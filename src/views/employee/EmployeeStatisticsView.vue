<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employee.store'

const router = useRouter()
const employeeStore = useEmployeeStore()

const summary = computed(() => employeeStore.timeSummary)

onMounted(() => {
  if (!employeeStore.timeSummary) {
    employeeStore.fetchTimeSummary()
  }
})

function goBack() {
  router.push({ name: 'main' })
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}г ${m}хв` : `${m}хв`
}
</script>

<template>
  <div class="statistics-view">
    <div class="page-header">
      <button class="btn-back" @click="goBack">← Назад</button>
      <div>
        <h1>Розширена статистика</h1>
        <p class="subtitle">Аналіз вашого робочого часу та відвідуваності</p>
      </div>
    </div>

    <div v-if="employeeStore.isLoadingSummary" class="loading">
      <div class="spinner"></div>
      <p>Завантаження статистики...</p>
    </div>

    <div v-else-if="!summary" class="empty-state">
      <p>Статистика недоступна</p>
      <button class="btn-primary" @click="employeeStore.fetchTimeSummary()">Завантажити</button>
    </div>

    <div v-else class="content">
      <!-- Overview -->
      <section class="section">
        <h2>Загальний огляд</h2>
        <div class="cards-row">
          <div class="card">
            <div class="card-label">Всього годин</div>
            <div class="card-value">
              {{ summary.total_hours }}г {{ summary.total_minutes % 60 }}хв
            </div>
          </div>
          <div class="card">
            <div class="card-label">Робочих днів</div>
            <div class="card-value">{{ summary.working_days }}</div>
          </div>
          <div class="card">
            <div class="card-label">Середній робочий час</div>
            <div class="card-value">{{ formatMinutes(summary.average_work_time) }}</div>
          </div>
        </div>
      </section>

      <!-- Period Summary -->
      <section class="section">
        <h2>Розбивка по періодах</h2>
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
                <td>{{ summary.summary.today.hours }}</td>
                <td>{{ summary.summary.today.minutes }}</td>
                <td>{{ summary.summary.today.working_days }}</td>
                <td>{{ summary.summary.today.late_count }}</td>
                <td>{{ summary.summary.today.early_count }}</td>
              </tr>
              <tr>
                <td>Цього тижня</td>
                <td>{{ summary.summary.week.hours }}</td>
                <td>{{ summary.summary.week.minutes }}</td>
                <td>{{ summary.summary.week.working_days }}</td>
                <td>{{ summary.summary.week.late_count }}</td>
                <td>{{ summary.summary.week.early_count }}</td>
              </tr>
              <tr>
                <td>Цього місяця</td>
                <td>{{ summary.summary.month.hours }}</td>
                <td>{{ summary.summary.month.minutes }}</td>
                <td>{{ summary.summary.month.working_days }}</td>
                <td>{{ summary.summary.month.late_count }}</td>
                <td>{{ summary.summary.month.early_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="chart-placeholder">
          <span>Тут буде графік</span>
        </div>
      </section>

      <!-- Attendance -->
      <section class="section">
        <h2>Відвідуваність та дисципліна</h2>
        <div class="cards-row">
          <div class="card">
            <div class="card-label">Вчасно</div>
            <div class="card-value success">{{ summary.attendance.on_time_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Запізнень</div>
            <div class="card-value danger">{{ summary.attendance.late_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Ранніх приходів</div>
            <div class="card-value">{{ summary.attendance.early_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Сер. запізнення</div>
            <div class="card-value">{{ summary.attendance.average_late_minutes }} хв</div>
          </div>
          <div class="card">
            <div class="card-label">Загалом запізнення</div>
            <div class="card-value">{{ formatMinutes(summary.attendance.total_late_minutes) }}</div>
          </div>
        </div>
        <div class="chart-placeholder">
          <span>Тут буде графік</span>
        </div>
      </section>

      <!-- Early Leave & Overtime -->
      <section class="section">
        <h2>Ранні виходи та понаднормові</h2>
        <div class="cards-row">
          <div class="card">
            <div class="card-label">Ранніх виходів</div>
            <div class="card-value">{{ summary.attendance.early_leave_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Загалом ранніх виходів</div>
            <div class="card-value">
              {{ formatMinutes(summary.attendance.total_early_leave_minutes) }}
            </div>
          </div>
          <div class="card">
            <div class="card-label">Сер. ранній вихід</div>
            <div class="card-value">{{ summary.attendance.average_early_leave_minutes }} хв</div>
          </div>
          <div class="card">
            <div class="card-label">Понаднормових</div>
            <div class="card-value success">{{ summary.attendance.overtime_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Загалом понаднормових</div>
            <div class="card-value">
              {{ formatMinutes(summary.attendance.total_overtime_minutes) }}
            </div>
          </div>
          <div class="card">
            <div class="card-label">Сер. понаднормових</div>
            <div class="card-value">{{ summary.attendance.average_overtime_minutes }} хв</div>
          </div>
        </div>
        <div class="chart-placeholder">
          <span>Тут буде графік</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.statistics-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.btn-back:hover {
  background: #e5e7eb;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.loading,
.empty-state {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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

.card {
  flex: 1;
  min-width: 140px;
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
}

.card-label {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.4rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.card-value.success {
  color: #16a34a;
}

.card-value.danger {
  color: #dc2626;
}

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

.chart-placeholder {
  margin-top: 1.25rem;
  padding: 3rem 2rem;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .statistics-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
  }

  .cards-row {
    flex-direction: column;
  }

  .card {
    min-width: unset;
  }
}
</style>
