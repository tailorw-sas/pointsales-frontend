// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['nuxt-primevue', '@sidebase/nuxt-auth', '@pinia/nuxt', '@nuxt/image'],
  auth: {
    globalAppMiddleware: {
      isEnabled: true
    },
    session: {
      enableRefreshOnWindowFocus: false,
      enableRefreshPeriodically: false
    }
  },
  primevue: { },
  app: {
    head: {
      // todo: revisar documentacion para mostrar descripcion de la plantilla asociada a la ruta actual
      titleTemplate(titleChunk) {
        return titleChunk ? `INMUNE - ${titleChunk}` : 'INMUNE'
      },
      title: 'INMUNE',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/layout/images/logo/logo-simple.png' },
      ]
    }
  },
  plugins: [
    { src: '~/plugins/recaptcha.ts' },
    // { src: '~/plugins/html2pdf.ts', mode: 'client' }
  ],
  vite: {
    optimizeDeps: {
      include: ['html2pdf.js'],
    },
  },
  runtimeConfig: {
    public: {
      recaptcha: {
        siteKey: ''
      },
      loadTableData: false,
      socketUrl: '',
      isProduction: process.env.NODE_ENV === 'production',
    },
    // bodyParser: {
    //   jsonLimit: '1 B', // Ajusta el tamaño máximo permitido
    // },
  }
})
