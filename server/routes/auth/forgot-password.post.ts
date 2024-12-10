import { helpers } from '@/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const aux = helpers()
  const isHuman = await aux.verifyRecaptchaToken(body.token)
  // const { validRecaptcha } = useGoogleRecaptcha()
  // const isHuman = await verifyRecaptchaToken(body.token)
  // if (!isHuman) {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'Error verificando captcha',
  //   })
  // }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const response: any = await $fetch(`${process.env.VITE_APP_BASE_URL}/identity/api/auth/forgot-password?email=${body.email}`, {
    method: 'POST',
    headers: defaultHeaders
  })

  return response
})
