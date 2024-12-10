import { v4 as uuidv4 } from 'uuid'
import type { IQueryRequest } from '../fields/interfaces/IFieldInterfaces'
import type { PaginatedResponse } from '~/types'

export const GenericService = {

  async search<T>(MODULE_NAME: string, URI_API: string, payload: IQueryRequest) {
    const { $api } = useNuxtApp()

    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/search`
    return $api<T>(url, {
      method: 'POST',
      body: payload
    })
  },

  async searchById<T>(MODULE_NAME: string, URI_API: string) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}`
    return $api<T>(url)
  },

  async getById<T>(MODULE_NAME: string, URI_API: string, ID: string, SUB_CONTROLLER = '', ID2: string = '') {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    let url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/${ID}`
    if (SUB_CONTROLLER !== '') {
      url += `/${SUB_CONTROLLER}`
    }
    if (ID2 !== '') {
      url += `/${ID2}`
    }
    return $api<T>(url, {
      method: 'GET',
    })
  },

  async create(MODULE_NAME: string, URI_API: string, payload: any) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}`
    return $api(url, {
      method: 'POST',
      body: payload
    })
  },

  async changeStatusReceipt(MODULE_NAME: string, URI_API: string, ID: string, payload: any) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/change-status/${ID}`
    return $api(url, {
      method: 'POST',
      body: payload
    })
  },

  async update(MODULE_NAME: string, URI_API: string, ID: string, payload: any) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/${ID}`
    return $api(url, {
      method: 'PATCH',
      body: payload
    })
  },

  async updateWithOutId(MODULE_NAME: string, URI_API: string, payload: any) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}`
    return $api(url, {
      method: 'PATCH',
      body: payload
    })
  },

  async uploadFile(MODULE_NAME: string, URI_API: string, file: File) {
    const { $api } = useNuxtApp()
    const formData = new FormData()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/upload`

    formData.append('file', file)
    const uuid = uuidv4()
    formData.append('objectId', uuid)

    return $api(url, {
      method: 'POST',
      body: formData,
    })
  },

  async deleteItem(MODULE_NAME: string, URI_API: string, ID: string) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/${ID}`
    return $api(url, {
      method: 'DELETE',
    })
  },

  async getUrlByImage(file: File) {
    if (file) {
      const response = await GenericService.uploadFile('cloudbridges', 'files', file)
      return response.data.url
    }
  },

  async deleteUrlByImage(MODULE_NAME: string, URI_API: string, Url: string) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}`
    return $api(url, {
      method: 'POST',
      body: {
        url: Url
      }
    })
  },

  async notifyNext(MODULE_NAME: string, URI_API: string, payload: any) {
    const { $api } = useNuxtApp()

    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/notification`
    return $api(url, {
      method: 'POST',
      body: payload
    })
  },

  async importSearch(MODULE_NAME: string, URI_API: string, payload: any) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/import-search`
    return $api<PaginatedResponse>(url, {
      method: 'POST',
      body: payload
    })
  },

  async importFile(MODULE_NAME: string, URI_API: string, formData: FormData) {
    const { $api } = useNuxtApp()
    // const formData = new FormData()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}`

    return $api(url, {
      method: 'POST',
      body: formData

    })
  },

  async sendItem(MODULE_NAME: string, URI_API: string, payload: any) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/send`
    return $api(url, {
      method: 'POST',
      body: payload
    })
  },

  async adminChangePassword(MODULE_NAME: string, URI_API: string, payload: any) {
    const { $api } = useNuxtApp()
    const serverUrl = useRequestURL()
    const url = `${serverUrl.origin}/site/${MODULE_NAME}/${URI_API}/admin/change-password`

    return $api(url, {
      method: 'POST',
      body: payload
    })
  },
}
