import { getToken } from '#auth'

export default defineEventHandler(async (event): Promise<any> => {
  const body = await readBody(event)
  const token = await getToken({ event })

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token?.access_token}`,
  }

  try {
    const url = `${process.env.VITE_APP_BASE_URL}/identity/api/users/admin/change-password`
    const response = await $fetch(url, {
      method: 'POST',
      body,
      headers: defaultHeaders
    })
    return response
  }
  catch (error) {
    return error
  }
})
