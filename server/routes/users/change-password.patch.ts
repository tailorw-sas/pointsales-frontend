import { getToken } from '#auth'
import { helpers } from '@/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = await getToken({ event })

  const aux = helpers()
  const isHuman = await aux.verifyRecaptchaToken(body.tokenCaptcha)
  if (!isHuman) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Error verificando captcha',
    })
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token?.access_token}`,
  }

  const payload = body.payload
  const response: any = await $fetch(`${process.env.VITE_APP_BASE_URL}/identity/api/users/${(token as any).userId}/change-password`, {
    method: 'PATCH',
    payload,
    headers: defaultHeaders
  })

  return response
})
