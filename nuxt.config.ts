export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  css: ['~/assets/main.css'],
  nitro: {
    preset: 'cloudflare-pages'
  },
  runtimeConfig: {
    // Kosongkan di dev supaya Turnstile dilewati. Isi di production (NUXT_TURNSTILE_SECRET).
    turnstileSecret: '',
    // Token halaman /admin (NUXT_ADMIN_TOKEN, minimal 16 karakter acak).
    adminToken: '',
    public: {
      // Alamat situs untuk gambar OG (NUXT_PUBLIC_SITE_URL). Ganti saat pakai domain sendiri.
      siteUrl: 'https://cengli-nuxt.pages.dev',
      turnstileSiteKey: ''
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Cengli / Bo Cengli',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Kejadian sehari-hari, kamu yang nilai. Adil atau nggak?' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Geist:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
})
