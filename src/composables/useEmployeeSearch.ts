import { ref, computed } from 'vue'
import type { User } from '@/types/interfaces/user.interface'

export function useEmployeeSearch(employees: () => User[]) {
  const searchQuery = ref('')

  const filteredEmployees = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()

    if (!query) {
      return employees()
    }

    return employees().filter((employee) => {
      const nameMatch = employee.name.toLowerCase().includes(query)
      const emailMatch = employee.email.toLowerCase().includes(query)
      const scheduleMatch = employee.work_schedule?.name.toLowerCase().includes(query)

      return nameMatch || emailMatch || scheduleMatch
    })
  })

  return {
    searchQuery,
    filteredEmployees,
  }
}
