import './style.css'

import App from './App.vue'
import { createApp } from 'vue'

const mainApp = createApp(App)
 
mainApp.mount('#app')
export {mainApp}