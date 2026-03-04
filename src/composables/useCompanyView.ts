import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useCompanyStore } from '@/stores/company.store'
import { useUsersStore } from '@/stores/users.store'
import { useRoleGuard } from '@/composables/useRoleGuard'
import { getAvatarUrl } from '@/core/utils/url'
import type AdminCompanyEditModal from '@/components/admin/AdminCompanyEditModal.vue'
import type { UpdateCompanyRequest } from '@/types/requests/companyRequest.interface'

export function useCompanyView() {
  const authStore = useAuthStore()
  const companyStore = useCompanyStore()
  const usersStore = useUsersStore()
  const router = useRouter()
  const { isAdmin } = useRoleGuard()

  const showEditModal = ref(false)
  const isSubmittingEdit = ref(false)
  const editModalRef = ref<InstanceType<typeof AdminCompanyEditModal> | null>(null)

  const isUploadingLogo = ref(false)
  const logoInputRef = ref<HTMLInputElement | null>(null)
  const logoImageKey = ref(0)

  const newEmployeeId = ref('')
  const isAddingEmployee = ref(false)
  const addEmployeeError = ref<string | null>(null)
  const removeEmployeeError = ref<string | null>(null)
  const logoUploadError = ref<string | null>(null)

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
    if (isAdmin.value && company.value) {
      companyStore.fetchCompanyUsers(company.value.id)
    } else {
      usersStore.fetchUsers(1)
    }
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

  async function handleAddEmployee() {
    const id = parseInt(newEmployeeId.value)
    if (!id || !company.value) {
      addEmployeeError.value = 'Введіть коректний ID співробітника'
      return
    }
    isAddingEmployee.value = true
    addEmployeeError.value = null
    try {
      await companyStore.addEmployee(company.value.id, id)
      newEmployeeId.value = ''
    } catch {
      addEmployeeError.value = companyStore.error ?? 'Помилка додавання'
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
    usersStore,
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
    isAddingEmployee,
    addEmployeeError,
    removeEmployeeError,
    logoUploadError,
    handleEditSubmit,
    triggerLogoUpload,
    handleLogoChange,
    handleAddEmployee,
    handleRemoveEmployee,
    goToUser,
  }
}
