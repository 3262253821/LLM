import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import 'highlight.js/styles/github.css'
import '@/assets/styles/chat-markdown.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

useAuthStore(pinia).init()
useThemeStore(pinia).init()

app.mount('#app')
