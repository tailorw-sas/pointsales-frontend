import { getToken } from '#auth'
import { helpers } from '@/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })
  const body = await readBody(event)

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

  const response: any = await $fetch(`${process.env.VITE_APP_BASE_URL}/identity/api/users/change-password-otp?email=${body.email}`, {
    method: 'POST',
    headers: defaultHeaders
  })

  return response
})
