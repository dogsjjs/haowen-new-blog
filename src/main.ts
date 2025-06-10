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

// 异步函数用于启用 Mocking
async function enableMocking() {
  // 通过环境变量判断是否启用 Mock。
  // 对于 Vite 项目, 可以使用 import.meta.env.VITE_ENABLE_MOCKS
  // 对于 Create React App, 可以使用 process.env.REACT_APP_ENABLE_MOCKS
  // 请根据你的项目构建工具和环境变量设置调整此判断条件。
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser');
    // `worker.start()` 返回一个 Promise，
    // 当 Service Worker 准备好拦截请求时，该 Promise 会 resolve。
    await worker.start({
      onUnhandledRequest: 'bypass', // 对于未处理的请求，直接放行（例如 HMR 更新、静态资源）
      // 你也可以设置为 'warn' 来在控制台打印警告
      // quiet: true, // 如果你想禁止 MSW 自身的控制台日志，可以取消此行注释
    });
    console.log('MSW: Mock Service Worker 已启动。');
  }
}

async function initializeApp() {
  // 在应用其他部分初始化之前启用 Mocking
  await enableMocking();

  const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
}

initializeApp();
