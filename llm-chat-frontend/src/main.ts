import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 把代码高亮的颜色主题样式全局引进来。
import 'highlight.js/styles/github.css'
// 它导入的是自己写的 markdown 样式文件。
import '@/assets/styles/chat-markdown.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
