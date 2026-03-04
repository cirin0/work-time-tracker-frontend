import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import './assets/fonts/fonts.css'
import VueScan, { type VueScanOptions } from 'z-vue-scan'

export const isProduction = import.meta.env.VITE_PRODUCTION === 'true'

const app = createApp(App)

app.use(createPinia())
app.use(router)
if (!isProduction) {
  app.use<VueScanOptions>(VueScan, {})
}

app.mount('#app')
