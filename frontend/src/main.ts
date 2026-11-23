import { createApp } from 'vue'
import { Quasar, Dialog, Notify } from 'quasar'
import quasarLang from 'quasar/lang/es'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'
import router from './router'
import { BRAND } from './constants/theme'

import './css/app.css'

createApp(App)
  .use(router)
  .use(Quasar, {
    plugins: { Dialog, Notify },
    lang: quasarLang,
    config: {
      brand: BRAND,
    },
  })
  .mount('#app')