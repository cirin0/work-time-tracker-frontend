import { ref, computed, watch } from 'vue'
import type { User } from '@/types/interfaces/user.interface'
import { debounce } from '@/core/utils/debounce'

export function useEmployeeSearch(employees: () => User[]) {
  const searchQuery = ref('')
  const debouncedQuery = ref('')

  const debouncedSearch = debounce((value: string) => {
    debouncedQuery.value = value
  }, 300)

  watch(searchQuery, (newValue) => {
    debouncedSearch(newValue)
  })

  const filteredEmployees = computed(() => {
    const q = debouncedQuery.value.toLowerCase()
    if (!q) return employees()
    return employees().filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
    )
  })

  return {
    searchQuery,
    filteredEmployees,
  }
}
