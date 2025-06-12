import './style/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css' // Element Plus 基础样式
// 重点：确保导入了暗色模式的 CSS 变量文件
// 如果您是按需导入，确保相关组件的暗色样式也包含在内
// 对于完整引入，或者使用 unplugin-element-plus 时，通常需要这个：
import 'element-plus/theme-chalk/dark/css-vars.css' // 或者对应的 scss 文件

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')