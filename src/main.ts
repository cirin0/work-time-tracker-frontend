import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { router } from './router'
import VueScan, { type VueScanOptions } from 'z-vue-scan'

const isProduction = import.meta.env.PROD

const app = createApp(App)

app.use(createPinia())
app.use(router)
if (!isProduction) {
  app.use<VueScanOptions>(VueScan, {})
}

app.mount('#app')
