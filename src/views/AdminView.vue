<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layouts/MainLayout.vue'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { apiClient, API_ROUTES } from '@/config/api'
import type { User } from '@/types/interfaces/user.interface'
import type { PaginatedResponse } from '@/types/responses/pagination.interface'
import type { UserApiResponse } from '@/types/responses/user.api'
import { transformUserFromApi } from '@/types/responses/user.api'

const { isAdmin } = useRoleGuard()

const users = ref<User[]>([])
const isLoading = ref(false)

async function loadUsers() {
  isLoading.value = true
  try {
    const { data } = await apiClient.get<PaginatedResponse<UserApiResponse>>(API_ROUTES.users.index)
    users.value = data.data.map(transformUserFromApi)
    console.log(users.value)
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    isLoading.value = false
  }
}

async function deleteUser(userId: number) {
  if (!confirm('Ви впевнені, що хочете видалити цього користувача?')) {
    return
  }

  try {
    await apiClient.delete(API_ROUTES.users.show(userId))
    users.value = users.value.filter((u) => u.id !== userId)
  } catch (error) {
    console.error('Failed to delete user:', error)
    alert('Помилка при видаленні користувача')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <MainLayout>
    <div class="admin-panel">
      <div class="panel-header">
        <h1>Панель адміністратора</h1>
        <p class="subtitle">Управління користувачами системи</p>
      </div>

      <div v-if="!isAdmin" class="access-denied">
        <h2>Доступ заборонено</h2>
        <p>У вас немає прав для перегляду цієї сторінки</p>
      </div>

      <div v-else class="content-section">
        <div class="section-header">
          <h2>Користувачі</h2>
          <button class="btn-primary">+ Додати користувача</button>
        </div>

        <div v-if="isLoading" class="loading">Завантаження...</div>

        <div v-else class="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ім'я</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Менеджер</th>
                <th>Компанія</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="`role-${user.role}`">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ user.manager?.name ?? 'Не вказано' }}</td>
                <td>{{ user.company?.name ?? 'Не вказано' }}</td>
                <td class="actions">
                  <button class="btn-edit">Редагувати</button>
                  <button class="btn-delete" @click="deleteUser(user.id)">Видалити</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="users.length === 0" class="empty-state">
            <p>Користувачів не знайдено</p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.admin-panel {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.panel-header {
  margin-bottom: 2rem;
}

.panel-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.access-denied {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
}

.access-denied h2 {
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.content-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.users-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

tbody tr:hover {
  background: #f9fafb;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: #fef3c7;
  color: #92400e;
}

.role-manager {
  background: #dbeafe;
  color: #1e40af;
}

.role-employee {
  background: #d1fae5;
  color: #065f46;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-edit {
  background: #dbeafe;
  color: #1e40af;
}

.btn-edit:hover {
  background: #bfdbfe;
}

.btn-delete {
  background: #fee2e2;
  color: #991b1b;
}

.btn-delete:hover {
  background: #fecaca;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}
</style>
