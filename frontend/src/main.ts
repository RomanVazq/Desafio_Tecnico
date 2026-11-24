import { createApp } from 'vue'
import { Quasar, Dialog, Notify, setCssVar } from 'quasar'
import quasarLang from 'quasar/lang/es'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

import App from './App.vue'
import router from './router'
import { BRAND, PALETTE } from './constants/theme'

import './css/app.css'

for (const [name, value] of Object.entries(PALETTE)) {
  setCssVar(name, value)
}

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