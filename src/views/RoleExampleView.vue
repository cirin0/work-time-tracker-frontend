<script setup lang="ts">
import MainLayout from '@/components/layouts/MainLayout.vue'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { UserRole } from '@/types/enums/enums.types'
import RoleGuard from '@/components/ui/RoleGuard.vue'

const { userRole, isAdmin, isManager, isEmployee } = useRoleGuard()
</script>

<template>
  <MainLayout>
    <div class="role-example-page">
      <div class="page-header">
        <h1>Приклад роботи з ролями</h1>
        <p class="current-role">
          Ваша поточна роль: <strong>{{ userRole }}</strong>
        </p>
      </div>

      <!-- Приклад 1: Використання v-if -->
      <div class="example-section">
        <h2>1. Умовний рендеринг з v-if</h2>

        <div v-if="isAdmin" class="role-content admin-content">
          <h3>👑 Контент для адміністратора</h3>
          <p>Ви маєте повний доступ до всіх функцій системи</p>
          <ul>
            <li>Управління всіма користувачами</li>
            <li>Налаштування системи</li>
            <li>Перегляд всіх звітів</li>
            <li>Видалення даних</li>
          </ul>
        </div>

        <div v-else-if="isManager" class="role-content manager-content">
          <h3>📊 Контент для менеджера</h3>
          <p>Ви можете управляти своєю командою</p>
          <ul>
            <li>Управління підлеглими</li>
            <li>Затвердження відпусток</li>
            <li>Перегляд звітів команди</li>
            <li>Призначення завдань</li>
          </ul>
        </div>

        <div v-else-if="isEmployee" class="role-content employee-content">
          <h3>👤 Контент для співробітника</h3>
          <p>Ви можете керувати своїми робочими годинами</p>
          <ul>
            <li>Відмітка часу роботи</li>
            <li>Запит на відпустку</li>
            <li>Перегляд свого графіку</li>
            <li>Редагування профілю</li>
          </ul>
        </div>
      </div>

      <!-- Приклад 2: Використання RoleGuard компонента -->
      <div class="example-section">
        <h2>2. Використання компонента RoleGuard</h2>

        <RoleGuard :roles="[UserRole.ADMIN]">
          <div class="role-content admin-content">
            <h3>🔒 Секція тільки для адміністратора</h3>
            <p>Цей блок відображається лише користувачам з роллю ADMIN</p>
            <button class="btn-danger">Видалити всі дані</button>
          </div>
        </RoleGuard>

        <RoleGuard :roles="[UserRole.ADMIN, UserRole.MANAGER]">
          <div class="role-content manager-content">
            <h3>📈 Секція для керівництва</h3>
            <p>Доступно для ADMIN та MANAGER</p>
            <div class="stats-grid">
              <div class="stat">
                <span class="stat-value">152</span>
                <span class="stat-label">Активних співробітників</span>
              </div>
              <div class="stat">
                <span class="stat-value">1,240</span>
                <span class="stat-label">Годин цього місяця</span>
              </div>
            </div>
          </div>
        </RoleGuard>
      </div>

      <!-- Приклад 3: З fallback контентом -->
      <div class="example-section">
        <h2>3. RoleGuard з альтернативним контентом</h2>

        <RoleGuard :roles="[UserRole.ADMIN]">
          <template #default>
            <div class="role-content admin-content">
              <h3>✅ У вас є доступ</h3>
              <p>Ви можете переглядати цю інформацію</p>
              <button class="btn-primary">Переглянути секретні дані</button>
            </div>
          </template>
          <template #fallback>
            <div class="role-content access-denied">
              <h3>🚫 Доступ обмежено</h3>
              <p>Ця інформація доступна тільки адміністраторам</p>
              <p>Ваша роль: {{ userRole }}</p>
            </div>
          </template>
        </RoleGuard>
      </div>

      <!-- Приклад 4: Динамічні кнопки дій -->
      <div class="example-section">
        <h2>4. Динамічні кнопки на основі ролей</h2>

        <div class="actions-grid">
          <button class="action-button available">
            <span class="icon">👤</span>
            <span class="label">Мій профіль</span>
            <span class="badge">Доступно всім</span>
          </button>

          <button v-if="isManager || isAdmin" class="action-button available">
            <span class="icon">👥</span>
            <span class="label">Управління командою</span>
            <span class="badge">Менеджер+</span>
          </button>

          <button v-if="isAdmin" class="action-button available">
            <span class="icon">⚙️</span>
            <span class="label">Налаштування системи</span>
            <span class="badge">Тільки адмін</span>
          </button>

          <button v-if="!isAdmin" class="action-button disabled" disabled>
            <span class="icon">🔒</span>
            <span class="label">Адмін панель</span>
            <span class="badge">Недоступно</span>
          </button>
        </div>
      </div>

      <!-- Приклад 5: Таблиця з різними діями -->
      <div class="example-section">
        <h2>5. Таблиця з діями на основі ролей</h2>

        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>Дія</th>
                <th>Співробітник</th>
                <th>Менеджер</th>
                <th>Адміністратор</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Редагувати свій профіль</td>
                <td><span class="status available">✅</span></td>
                <td><span class="status available">✅</span></td>
                <td><span class="status available">✅</span></td>
              </tr>
              <tr>
                <td>Відмітка часу</td>
                <td><span class="status available">✅</span></td>
                <td><span class="status available">✅</span></td>
                <td><span class="status available">✅</span></td>
              </tr>
              <tr>
                <td>Затверджувати відпустки</td>
                <td><span class="status unavailable">❌</span></td>
                <td><span class="status available">✅</span></td>
                <td><span class="status available">✅</span></td>
              </tr>
              <tr>
                <td>Управляти користувачами</td>
                <td><span class="status unavailable">❌</span></td>
                <td><span class="status unavailable">❌</span></td>
                <td><span class="status available">✅</span></td>
              </tr>
              <tr>
                <td>Налаштування системи</td>
                <td><span class="status unavailable">❌</span></td>
                <td><span class="status unavailable">❌</span></td>
                <td><span class="status available">✅</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.role-example-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 3rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.current-role {
  font-size: 1.125rem;
  color: #6b7280;
}

.current-role strong {
  color: #9333ea;
  text-transform: uppercase;
  font-weight: 600;
}

.example-section {
  margin-bottom: 3rem;
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.example-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.role-content {
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 2px solid;
}

.role-content h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}

.role-content p {
  margin-bottom: 1rem;
}

.role-content ul {
  list-style: none;
  padding: 0;
}

.role-content ul li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.role-content ul li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: inherit;
  font-weight: bold;
}

.admin-content {
  background: #fef3c7;
  border-color: #f59e0b;
}

.manager-content {
  background: #dbeafe;
  border-color: #3b82f6;
}

.employee-content {
  background: #d1fae5;
  border-color: #10b981;
}

.access-denied {
  background: #fee2e2;
  border-color: #ef4444;
  text-align: center;
}

.btn-primary,
.btn-danger {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-primary:hover,
.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.available {
  border-color: #10b981;
}

.action-button.available:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.action-button .icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.action-button .label {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.action-button .badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background: #f3f4f6;
  color: #6b7280;
}

.action-button.available .badge {
  background: #d1fae5;
  color: #065f46;
}

.data-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
}

th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:hover {
  background: #f9fafb;
}

.status {
  font-size: 1.25rem;
}

.status.available {
  color: #10b981;
}

.status.unavailable {
  color: #ef4444;
}
</style>
