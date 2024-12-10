import { getToken } from '#auth'

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token?.access_token}`,
  }

  return $fetch(`${process.env.VITE_APP_BASE_URL}/identity/api/users/me`, {
    headers: defaultHeaders
  })
})
