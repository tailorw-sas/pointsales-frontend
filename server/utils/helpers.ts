export function helpers() {
  return {
    async verifyRecaptchaToken(token: any) {
      const secretKey = '6Lckb-cpAAAAAI390HQMhsfDCTNSWIdQkyYQE8Gz' // process.env.CAPTCHA_SECRET_KEY
      const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, {
        method: 'POST'
      })
      const data = await response.json()
      return data.success
    }
  }
}
