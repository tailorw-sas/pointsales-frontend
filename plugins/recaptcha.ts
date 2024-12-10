import { VueReCaptcha } from 'vue-recaptcha-v3'
// The plugin enables the usage of Google reCAPTCHA in a Nuxt.js application
// by registering the VueReCaptcha plugin with the necessary configuration options.
export default defineNuxtPlugin((nuxtApp) => {
  const options = {
    siteKey: '6Lckb-cpAAAAAM_VhOM5CS_w2H5hGwORU1eFJSKe', // `${import.meta.env.CAPTCHA_SITE_KEY}`,
    loaderOptions: {
      autoHideBadge: true,
      useRecaptchaNet: true,
      renderParameters: {
        hl: 'id'
      }
    }
  }
  nuxtApp.vueApp.use(VueReCaptcha, options)
})
