<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useManagerStore } from '@/stores/manager.store'

const router = useRouter()
const managerStore = useManagerStore()

const stats = computed(() => managerStore.companyStats)

onMounted(() => {
  managerStore.fetchCompanyStatistics()
})

function goBack() {
  router.push({ name: 'manager' })
}

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}г ${m}хв` : `${m}хв`
}
</script>

<template>
  <div class="statistics-view">
    <div class="page-header">
      <button @click="goBack" class="btn-back">← Назад</button>
      <div>
        <h1>Розширена статистика компанії</h1>
        <p class="subtitle">Аналіз робочого часу та відвідуваності</p>
      </div>
    </div>

    <div v-if="managerStore.isLoadingStats" class="loading">
      <div class="spinner"></div>
      <p>Завантаження статистики...</p>
    </div>

    <div v-else-if="!stats" class="empty-state">
      <p>Статистика недоступна</p>
      <button @click="managerStore.fetchCompanyStatistics()" class="btn-primary">
        Завантажити
      </button>
    </div>

    <div v-else class="content">
      <!-- Overview -->
      <section class="section">
        <h2>Загальний огляд</h2>
        <div class="cards-row">
          <div class="card">
            <div class="card-label">Всього годин</div>
            <div class="card-value">{{ stats.total_hours }}г {{ stats.total_minutes % 60 }}хв</div>
          </div>
          <div class="card">
            <div class="card-label">Записів</div>
            <div class="card-value">{{ stats.entries_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Активних записів</div>
            <div class="card-value">{{ stats.active_entries_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Активних зараз</div>
            <div class="card-value">{{ stats.active_employees }}</div>
          </div>
          <div class="card">
            <div class="card-label">Унікальних працівників</div>
            <div class="card-value">{{ stats.total_employees_with_entries }}</div>
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
                <th>Записів</th>
                <th>Запізнень</th>
                <th>Ранніх виходів</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Сьогодні</td>
                <td>{{ stats.summary.today.hours }}</td>
                <td>{{ stats.summary.today.minutes }}</td>
                <td>{{ stats.summary.today.entries }}</td>
                <td>{{ stats.summary.today.late_count }}</td>
                <td>{{ stats.summary.today.early_count }}</td>
              </tr>
              <tr>
                <td>Цього тижня</td>
                <td>{{ stats.summary.week.hours }}</td>
                <td>{{ stats.summary.week.minutes }}</td>
                <td>{{ stats.summary.week.entries }}</td>
                <td>{{ stats.summary.week.late_count }}</td>
                <td>{{ stats.summary.week.early_count }}</td>
              </tr>
              <tr>
                <td>Цього місяця</td>
                <td>{{ stats.summary.month.hours }}</td>
                <td>{{ stats.summary.month.minutes }}</td>
                <td>{{ stats.summary.month.entries }}</td>
                <td>{{ stats.summary.month.late_count }}</td>
                <td>{{ stats.summary.month.early_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Placeholder for charts -->
        <div class="chart-placeholder">
          <span>📊 Тут буде графік по тижнях/місяцях</span>
        </div>
      </section>

      <!-- Attendance -->
      <section class="section">
        <h2>Відвідуваність та дисципліна</h2>
        <div class="cards-row">
          <div class="card">
            <div class="card-label">Вчасно</div>
            <div class="card-value success">{{ stats.attendance.on_time_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Запізнень</div>
            <div class="card-value danger">{{ stats.attendance.late_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Ранніх виходів (прихід)</div>
            <div class="card-value">{{ stats.attendance.early_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Сер. запізнення</div>
            <div class="card-value">{{ stats.attendance.average_late_minutes }} хв</div>
          </div>
          <div class="card">
            <div class="card-label">Загалом запізнення (хв)</div>
            <div class="card-value">{{ stats.attendance.total_late_minutes }}</div>
          </div>
        </div>
        <!-- Placeholder for charts -->
        <div class="chart-placeholder">
          <span>🕐 Тут буде графік запізнень по днях</span>
        </div>
      </section>

      <!-- Early Leave & Overtime -->
      <section class="section">
        <h2>Ранні виходи та понаднормові</h2>
        <div class="cards-row">
          <div class="card">
            <div class="card-label">Ранніх виходів</div>
            <div class="card-value">{{ stats.attendance.early_leave_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Загалом ранніх виходів (хв)</div>
            <div class="card-value">{{ stats.attendance.total_early_leave_minutes }}</div>
          </div>
          <div class="card">
            <div class="card-label">Сер. ранній вихід</div>
            <div class="card-value">{{ stats.attendance.average_early_leave_minutes }} хв</div>
          </div>
          <div class="card">
            <div class="card-label">Понаднормових</div>
            <div class="card-value success">{{ stats.attendance.overtime_count }}</div>
          </div>
          <div class="card">
            <div class="card-label">Загалом понаднормових (хв)</div>
            <div class="card-value">
              {{ formatMinutes(stats.attendance.total_overtime_minutes) }}
            </div>
          </div>
          <div class="card">
            <div class="card-label">Сер. понаднормових</div>
            <div class="card-value">{{ stats.attendance.average_overtime_minutes }} хв</div>
          </div>
        </div>
        <!-- Placeholder for charts -->
        <div class="chart-placeholder">
          <span>📈 Тут буде графік понаднормових</span>
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
  padding: 2rem;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
}
</style>
