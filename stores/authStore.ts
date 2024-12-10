import { defineStore } from 'pinia'
import type { UserMeData } from '~/types'

export const useAuthStore = defineStore('authStore', () => {
  const userData = reactive<UserMeData>({})

  async function getUserMe() {
    const url = '/api/user/me'
    const { data } = await useFetch<UserMeData>(url)
    userData.data = data.value?.data
  }

  const availableCompanies = computed(() => {
    return userData.data?.businesses?.filter(item => item.businessId !== userData.data?.selectedBusiness) || []
  })

  return { userData, getUserMe, availableCompanies, }
})
