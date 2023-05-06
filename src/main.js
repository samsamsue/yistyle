import { createApp } from 'vue'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import './assets/main.css'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

//注册自定义Plus组件
import Plus from './components/plus.vue'
app.config.globalProperties.$plus = Plus;

app.mount('#app')
