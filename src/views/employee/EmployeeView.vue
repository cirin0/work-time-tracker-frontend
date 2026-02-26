<script setup lang="ts">
import { useRoleGuard } from '@/composables/useRoleGuard.ts'

const { currentUser } = useRoleGuard()
</script>

<template>
  <div class="employee-dashboard">
    <div class="dashboard-header">
      <h1>Головна сторінка</h1>
      <p class="subtitle">Ласкаво просимо до системи обліку робочого часу</p>
    </div>

    <div class="dashboard-content">
      <div class="welcome-card">
        <h2>👋 Вітаємо, {{ currentUser?.name }}!</h2>
        <p>Тут буде ваша інформація про робочий час та завдання</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-content">
            <div class="stat-value">0 год</div>
            <div class="stat-label">Відпрацьовано сьогодні</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">0 год</div>
            <div class="stat-label">Цього тижня</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">0 год</div>
            <div class="stat-label">Цього місяця</div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Швидкі дії</h3>
        <div class="actions-grid">
          <button class="action-btn primary">
            <span class="action-icon">▶️</span>
            <span>Почати роботу</span>
          </button>
          <button class="action-btn secondary">
            <span class="action-icon">⏸️</span>
            <span>Зробити перерву</span>
          </button>
          <button class="action-btn secondary">
            <span class="action-icon">📝</span>
            <span>Додати запис</span>
          </button>
          <router-link :to="{ name: 'leave-requests' }" class="action-btn secondary">
            <span class="action-icon">📄</span>
            <span>Запити на відпустку</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.dashboard-content {
  display: grid;
  gap: 1.5rem;
}

.welcome-card {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.welcome-card p {
  color: #6b7280;
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  border-radius: 0.75rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.quick-actions {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .employee-dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
