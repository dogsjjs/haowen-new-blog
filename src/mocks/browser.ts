import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 此配置使用给定的请求处理程序配置 Service Worker。
export const worker = setupWorker(...handlers)