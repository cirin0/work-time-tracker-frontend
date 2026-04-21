<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoleGuard } from '@/composables/useRoleGuard.ts'
import { useManagerStore } from '@/stores/manager.store.ts'
import ManagerLeaveRequestsList from '@/components/leave-requests/ManagerLeaveRequestsList.vue'
import QRCodeDisplay from '@/components/qr-code/QRCodeDisplay.vue'
import StatCard from '@/components/ui/StatCard.vue'
import Avatar from '@/components/ui/Avatar.vue'

import UserIcon from '@/icons/UserIcon.vue'
import ClockIcon from '@/icons/ClockIcon.vue'
import MapPinIcon from '@/icons/MapPinIcon.vue'
import CalendarIcon from '@/icons/CalendarIcon.vue'
import ChartBarIcon from '@/icons/ChartBarIcon.vue'
import BuildingIcon from '@/icons/BuildingIcon.vue'
import ExclamationTriangleIcon from '@/icons/ExclamationTriangleIcon.vue'
import EmailIcon from '@/icons/EmailIcon.vue'

const router = useRouter()
const { isManager, isAdmin } = useRoleGuard()
const managerStore = useManagerStore()

const pendingRequestsCount = computed(() => {
  return managerStore.leaveRequests.length
})

const totalTeamHours = computed(() => {
  return managerStore.companyStats ? managerStore.companyStats.summary.month.hours : 0
})

const activeEmployees = computed(() => {
  return managerStore.companyStats ? managerStore.companyStats.active_employees : 0
})

const now = ref(new Date())
let timer: number

onMounted(() => {
  managerStore.fetchCompanyStatistics()
  managerStore.fetchPendingLeaveRequests()
  managerStore.fetchActiveTeamEntries()

  timer = window.setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  window.clearInterval(timer)
})

function getActiveDuration(startTime: string | null) {
  if (!startTime) return '0 хв'
  const start = new Date(startTime).getTime()
  const diffMinutes = Math.floor(Math.max(0, now.value.getTime() - start) / 60000)
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60

  if (hours > 0) return `${hours} год ${minutes} хв`
  return `${minutes} хв`
}

function formatLateness(minutes?: number | null) {
  if (!minutes || minutes <= 0) return ''
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) return `(спізнення: ${hours} год ${mins > 0 ? mins + ' хв' : ''})`.trim()
  return `(спізнення: ${mins} хв)`
}

function goToEmployee(id?: number) {
  if (id) {
    router.push({ name: 'employee-details', params: { id } })
  }
}
</script>

<template>
  <div class="manager-panel-opt1">
    <div class="header-banner">
      <div class="header-content">
        <h1>Панель менеджера</h1>
        <p class="subtitle">Аналітичний дашборд та управління командою</p>
      </div>
    </div>

    <div v-if="!isManager && !isAdmin" class="access-denied">
      <h2>Доступ заборонено</h2>
    </div>

    <div v-else class="content-wrapper">
      <!-- Top Metrics Row -->
      <div class="metrics-row">
        <div class="metric-card primary-metric">
          <div class="metric-icon">
            <UserIcon />
          </div>
          <div class="metric-info">
            <span class="label">Команда (онлайн/всього)</span>
            <div class="value-group">
              <span class="value active">{{ activeEmployees }}</span>
              <span class="divider">/</span>
              <span class="value total">{{ managerStore.companyStats?.employee_count ?? 0 }}</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: managerStore.companyStats?.employee_count
                    ? (activeEmployees / managerStore.companyStats.employee_count) * 100 + '%'
                    : '0%',
                }"
              ></div>
            </div>
          </div>
        </div>

        <StatCard label="Годин (місяць)" :value="totalTeamHours.toFixed(1)" class="standard-metric">
          <template #icon><ClockIcon /></template>
        </StatCard>

        <StatCard
          label="Запитів очікує"
          :value="pendingRequestsCount"
          class="standard-metric clickable-stat-card"
          @click="router.push({ name: 'manager-leave-requests' })"
        >
          <template #icon><EmailIcon /></template>
        </StatCard>

        <div class="quick-links">
          <button @click="router.push({ name: 'manager-employees' })" class="link-btn">
            <UserIcon class="link-icon" /> Співробітники
          </button>
          <button @click="router.push({ name: 'work-schedules' })" class="link-btn">
            <CalendarIcon class="link-icon" /> Розклад
          </button>
          <button @click="router.push({ name: 'manager-statistics' })" class="link-btn">
            <ChartBarIcon class="link-icon" /> Статистика
          </button>
          <button @click="router.push({ name: 'company' })" class="link-btn">
            <BuildingIcon class="link-icon" /> Компанія
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Dashboard Left: Team Activity -->
        <div class="activity-section">
          <h2><ClockIcon class="section-icon" /> Активність команди</h2>
          <div class="flex">
            <div class="activity-items">
              <div v-if="managerStore.isLoadingActiveTeam" class="loading-state">
                <p>Завантаження...</p>
              </div>
              <div v-else-if="managerStore.activeTeamEntries.length === 0" class="empty-state">
                <p>Наразі немає активних працівників.</p>
              </div>
              <div
                v-else
                class="active-user-card"
                v-for="entry in managerStore.activeTeamEntries"
                :key="entry.id"
                @click="goToEmployee(entry.user?.id)"
              >
                <div class="status-dot green"></div>
                <Avatar
                  :src="entry.user?.avatar || undefined"
                  :fallbackText="entry.user?.name"
                  size="small"
                  class="user-avatar"
                />
                <div class="user-info-wrapper">
                  <div class="user-name">{{ entry.user?.name }}</div>
                  <div
                    v-if="entry.lateness_minutes && entry.lateness_minutes > 0"
                    class="lateness-badge"
                  >
                    {{ formatLateness(entry.lateness_minutes) }}
                  </div>
                </div>
                <div class="user-time">{{ getActiveDuration(entry.start_time) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Right: Action Center -->
        <div class="action-center">
          <div class="action-box">
            <div class="box-header">
              <h2><ExclamationTriangleIcon class="section-icon text-warning" /> Потребує уваги</h2>
              <span v-if="pendingRequestsCount > 0" class="badge red">{{
                pendingRequestsCount
              }}</span>
            </div>
            <div class="requests-scroll-area">
              <ManagerLeaveRequestsList
                :leave-requests="managerStore.leaveRequests"
                :is-loading="managerStore.isLoadingLeaveRequests"
                :error="managerStore.error"
                @retry="managerStore.fetchPendingLeaveRequests"
              />
            </div>
          </div>

          <div class="action-box qr-box">
            <div class="box-header">
              <h2><MapPinIcon class="section-icon" /> Трекінг часу (QR)</h2>
            </div>
            <div class="qr-compact-container">
              <QRCodeDisplay />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manager-panel-opt1 {
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: 1.5rem;
  background-color: var(--background);
  min-height: 100vh;
}

.header-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);
}

.header-banner h1 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  color: white;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
}

.metrics-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 1024px) {
  .metrics-row {
    grid-template-columns: 1fr 1fr;
  }
}

.metric-card.primary-metric {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
}

.metric-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-1);
  border-radius: 12px;
}

.metric-icon :deep(svg) {
  width: 32px;
  height: 32px;
}

.metric-info {
  flex: 1;
}

.value-group {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0.3rem 0;
}

.value.active {
  font-size: 1.8rem;
  font-weight: 700;
  color: #10b981;
}
.value.total {
  font-size: 1.2rem;
  color: var(--text-muted);
}
.divider {
  font-size: 1.2rem;
  color: var(--text-muted);
}

.progress-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transform-origin: left;
  will-change: transform;
  transition: transform 0.5s ease;
}

.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.link-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.link-icon {
  width: 18px;
  height: 18px;
  color: var(--text-muted);
}

.link-btn:hover {
  border-color: var(--accent-1);
  color: var(--accent-1);
  transform: translateY(-2px);
}

.link-btn:hover .link-icon {
  color: var(--accent-1);
}

.standard-metric.clickable-stat-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.standard-metric.clickable-stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-1);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

h2 {
  font-size: 1.3rem;
  color: var(--text);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: var(--text-muted);
}

.text-warning {
  color: #f59e0b;
}

.activity-section,
.action-box {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border);
}

.action-center {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.badge.red {
  background: #ef4444;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.requests-scroll-area {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.qr-box {
  background: linear-gradient(to bottom right, var(--surface) 0%, rgba(240, 244, 255, 0.5) 100%);
}

.qr-compact-container {
  transform: scale(0.9);
  transform-origin: top center;
}

.loading-state,
.empty-state {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 1rem 0;
  text-align: center;
}

.active-user-card {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
}

.active-user-card:last-child {
  margin-bottom: 0;
}

.active-user-card:hover {
  border-color: var(--accent-1);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
  transform: translateY(-2px);
}

.user-avatar {
  margin-right: 0.8rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 1rem;
}
.status-dot.green {
  background: #10b981;
}
.status-dot.orange {
  background: #f59e0b;
}
.status-dot.gray {
  background: #9ca3af;
}

.user-info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--text);
}

.lateness-badge {
  font-size: 0.8rem;
  color: #ef4444; /* red color for warning */
  margin-top: 0.15rem;
}

.user-time {
  font-family: monospace;
  font-size: 1rem;
  color: var(--text-muted);
}
</style>
