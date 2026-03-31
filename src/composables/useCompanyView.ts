import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useCompanyStore } from '@/stores/company.store'
import { useAdminStore } from '@/stores/admin.store'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { getAvatarUrl } from '@/core/utils/url'
import type AdminCompanyEditModal from '@/components/admin/AdminCompanyEditModal.vue'
import type { UpdateCompanyRequest } from '@/types/requests/companyRequest.interface'

export function useCompanyView() {
  const authStore = useAuthStore()
  const companyStore = useCompanyStore()
  const adminStore = useAdminStore()
  const router = useRouter()
  const { isAdmin } = useRoleGuard()

  const showEditModal = ref(false)
  const isSubmittingEdit = ref(false)
  const editModalRef = ref<InstanceType<typeof AdminCompanyEditModal> | null>(null)

  const isUploadingLogo = ref(false)
  const logoInputRef = ref<HTMLInputElement | null>(null)
  const logoImageKey = ref(0)

  const newEmployeeId = ref<number | null>(null)
  const employeeSearchQuery = ref('')
  const selectedEmployee = ref<{ id: number; name: string; email: string } | null>(null)
  const isAddingEmployee = ref(false)
  const addEmployeeError = ref<string | null>(null)
  const addEmployeeSuccess = ref<string | null>(null)
  const removeEmployeeError = ref<string | null>(null)
  const logoUploadError = ref<string | null>(null)
  let employeeSearchTimer: ReturnType<typeof setTimeout> | null = null

  const employeeSearchResults = computed(() => {
    const q = employeeSearchQuery.value.toLowerCase().trim()
    if (!q || q.length < 2) return []

    const currentEmployeeIds = new Set([
      ...(company.value?.employees ?? []).map((e) => e.id),
      company.value?.manager?.id,
    ].filter(Boolean))

    return adminStore.users
      .filter((u) => {
        if (currentEmployeeIds.has(u.id)) return false
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      })
      .slice(0, 6)
  })

  const company = computed(() => companyStore.company)
  const companyId = computed(() => authStore.currentUser?.company?.id ?? null)
  const logoUrl = computed(() => getAvatarUrl(company.value?.logo ?? null))

  watch(
    () => company.value?.logo,
    () => {
      logoImageKey.value++
    },
  )

  onMounted(async () => {
    const id = companyId.value
    if (!id) return
    await companyStore.fetchById(id)
  })

  async function handleEditSubmit(payload: UpdateCompanyRequest) {
    if (!company.value) return
    isSubmittingEdit.value = true
    try {
      await companyStore.updateCompany(company.value.id, payload)
      showEditModal.value = false
    } catch {
      editModalRef.value?.setError(companyStore.error ?? 'Помилка збереження')
    } finally {
      isSubmittingEdit.value = false
    }
  }

  function triggerLogoUpload() {
    logoInputRef.value?.click()
  }

  async function handleLogoChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file || !company.value) return

    const formData = new FormData()
    formData.append('logo', file)
    logoUploadError.value = null
    isUploadingLogo.value = true
    try {
      await companyStore.updateCompanyLogo(company.value.id, formData)
    } catch {
      logoUploadError.value = companyStore.error ?? 'Помилка завантаження логотипу'
    } finally {
      isUploadingLogo.value = false
      input.value = ''
    }
  }

  function onEmployeeSearchInput() {
    selectedEmployee.value = null
    newEmployeeId.value = null
    if (employeeSearchTimer) clearTimeout(employeeSearchTimer)
    employeeSearchTimer = setTimeout(() => {
      adminStore.fetchAllUsers(1, employeeSearchQuery.value)
    }, 350)
  }

  function selectEmployee(user: { id: number; name: string; email: string }) {
    selectedEmployee.value = user
    newEmployeeId.value = user.id
    employeeSearchQuery.value = user.name
  }

  async function handleAddEmployee() {
    const id = newEmployeeId.value
    if (!id || !company.value) {
      addEmployeeError.value = 'Виберіть співробітника з пошуку'
      return
    }
    isAddingEmployee.value = true
    addEmployeeError.value = null
    addEmployeeSuccess.value = null
    try {
      await companyStore.addEmployee(company.value.id, id)
      addEmployeeSuccess.value = `Співробітника "${selectedEmployee.value?.name}" додано!`
      employeeSearchQuery.value = ''
      selectedEmployee.value = null
      newEmployeeId.value = null
      await companyStore.fetchById(company.value.id)
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message

      if (typeof msg === 'string' && msg.toLowerCase().includes('already belongs')) {
        addEmployeeError.value =
          `Цей користувач вже належить до компанії. Оновлюємо список...`
        employeeSearchQuery.value = ''
        selectedEmployee.value = null
        newEmployeeId.value = null
        await companyStore.fetchById(company.value.id)
      } else {
        addEmployeeError.value = companyStore.error ?? 'Помилка додавання'
      }
    } finally {
      isAddingEmployee.value = false
    }
  }

  async function handleRemoveEmployee(employeeId: number) {
    if (!company.value) return
    if (!confirm('Видалити цього співробітника з компанії?')) return
    removeEmployeeError.value = null
    try {
      await companyStore.removeEmployee(company.value.id, employeeId)
    } catch {
      removeEmployeeError.value = companyStore.error ?? 'Помилка видалення'
    }
  }

  function goToUser(id: number) {
    router.push({ name: 'user-details', params: { id } })
  }

  return {
    companyStore,
    company,
    companyId,
    logoUrl,
    logoImageKey,
    isAdmin,
    showEditModal,
    isSubmittingEdit,
    editModalRef,
    isUploadingLogo,
    logoInputRef,
    newEmployeeId,
    employeeSearchQuery,
    selectedEmployee,
    employeeSearchResults,
    isAddingEmployee,
    addEmployeeError,
    addEmployeeSuccess,
    removeEmployeeError,
    logoUploadError,
    handleEditSubmit,
    triggerLogoUpload,
    handleLogoChange,
    onEmployeeSearchInput,
    selectEmployee,
    handleAddEmployee,
    handleRemoveEmployee,
    goToUser,
  }
}
