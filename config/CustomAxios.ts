import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

class CustomAxios {
  private instance: AxiosInstance

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
    })

    this.instance.interceptors.request.use((config) => {
      // const token = localStorage.getItem('token')
      const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJGaHFDT1RiSDhZd1hCUndrVVBIRnlLdWtJeFVob3F2Mzc5SnZwTG04UktzIn0.eyJleHAiOjE3MTUyMDg0ODQsImlhdCI6MTcxNTE5MDQ4NCwianRpIjoiODlkNjBmY2QtNjIzMC00NjlkLTk1YjktMjcyNTNiNzI1YTRjIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmNoZXZlcmUuZGRucy5uZXQvcmVhbG1zL2t5bnNvZnQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYTc4OGE0NWQtYzIwNy00YTU0LThhOWMtM2I4Mjc2MTgyYTY3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibWVkaW5lYyIsInNlc3Npb25fc3RhdGUiOiI0MmQ4NWJhMy0wNDI3LTQyMmYtYWI1NS1jYTEyZjhhNjAyYWEiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWt5bnNvZnQiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwic2lkIjoiNDJkODViYTMtMDQyNy00MjJmLWFiNTUtY2ExMmY4YTYwMmFhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJBRE1JTiBBRE1JTiIsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluLXVzZXJAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkFETUlOIiwiZmFtaWx5X25hbWUiOiJBRE1JTiIsImVtYWlsIjoiYWRtaW4tdXNlckBnbWFpbC5jb20ifQ.VTzQdEOt4syi_euUjX-iR16-JzvRanWuxPPLclLLM4bR429gxkY6PYgOnpxSLqEO7D1uOJeLa4rpni5DkWWMRarJHsAbOyil-zWIhw4ZuuMPLJpWjRiCuGl8a3wvOrfYgRCWmfekwsHxwZnusjOrK5UeTcnOpmT8_IMaRLbWrfDw9g1LK4QIRq79kwFv3bcYo9aQECGz3WaArhW0dGlufnLkt9DSe5Rq1hHbuQzhM2CLsJTnPVsL2lkxii5Fa34cVDsBxAcYtyVhol3-ZWEwwiJ260MhhHIFQtQ8Ncb11jk37we8v-MV2zBTh7FeR20b9oPfkQccseQW6aOL9Cm_HQ'
      if (token) { config.headers.Authorization = `Bearer ${token}` }
      return config
    })
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config)
  }

  async postFormData<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, formData, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config)
  }
}

export default CustomAxios
