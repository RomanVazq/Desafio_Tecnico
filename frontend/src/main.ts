import { createApp } from 'vue'
import { Quasar, Dialog, Notify } from 'quasar'
import quasarLang from 'quasar/lang/es'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .use(Quasar, {
    plugins: { Dialog, Notify },
    lang: quasarLang,
    config: {
      brand: {
        primary: '#2563EB',
        secondary: '#0F172A',
        accent: '#0EA5E9',
        dark: '#1E293B',
        positive: '#16A34A',
        negative: '#DC2626',
        warning: '#D97706',
      },
    },
  })
  .mount('#app')