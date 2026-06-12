import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// 【关键】这一行绝对不能少，它负责注入所有的 Tailwind 样式！
import './assets/main.css'

// 引入 FontAwesome 图标库 (如果没有本地 npm 包，可以在 index.html 中用 CDN 引入)
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')