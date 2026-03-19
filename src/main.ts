import { ViteSSG } from 'vite-ssg'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

import './style.css'
import App from './App.vue'
import i18n from './i18n'

import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

// 导出 ViteSSG 入口
export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    // 这里的 scrollBehavior 搬过来就行
    scrollBehavior(to, from, savedPosition) {
      if (to.path === from.path) return false
      if (savedPosition) {
        // 使用 Promise 解决过渡动画导致的滚动位置恢复失败
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(savedPosition)
          }, 350) // 等待 transition 动画基本完成
        })
      }
      return { top: 0 }
    },
  },
  ({ app, router, isClient }) => {
    // 注入 i18n
    app.use(i18n)

    // 只有在浏览器环境下（isClient 为 true）才执行的逻辑
    if (isClient) {
      // 屏蔽第三方库触发的 Vue Router next() 弃用警告
      const originalWarn = console.warn
      console.warn = (...args) => {
        if (
          typeof args[0] === 'string' &&
          args[0].includes('The `next()` callback in navigation guards is deprecated')
        ) {
          return
        }
        originalWarn(...args)
      }

      nprogress.configure({ showSpinner: false, speed: 400 })

      router.beforeEach((to) => {
        nprogress.start()

        const hash = window.location.hash
        if (to.path === '/' && hash.startsWith('#/')) {
          const targetPath = hash.substring(1)
          if (targetPath && targetPath !== '/') {
            return { path: targetPath, replace: true }
          }
        }
        return true
      })

      router.afterEach(() => {
        nprogress.done()
      })

      // 这将在运行时更新路由而无需重新加载页面
      if (import.meta.hot) {
        handleHotUpdate(router)
      }

      const art = ` __   __   ______   ______  _____    __    __  __  __
/\\ \\ /\\ \\ /\\__  _\\ /\\  _  \\/\\  __\`\\ /\\ \\  /\\ \\/\\ \\/\\ \\
\\ \`\\\`\\/'/'\\/_/\\ \\/ \\ \\ \\L\\ \\ \\ \\/\\ \\\\ \`\\\`\\\\/'/\\ \\ \\ \\ \\
 \`\\/ > <     \\ \\ \\  \\ \\  __ \\ \\ \\ \\ \\\`\\ \`\\ /'  \\ \\ \\ \\ \\
    \\/'/\\\`\\   \\_\\ \\__\\ \\ \\/\\ \\ \\ \\_\\ \\ \`\\ \\ \\   \\ \\ \\_\\ \\
    /\\_\\\\ \\_\\ /\\_____\\\\ \\_\\ \\_\\ \\_____\\  \\ \\_\\   \\ \\_____\\
    \\/_/ \\/_/ \\/_____/ \\/_/\\/_/\\/_____/   \\/_/    \\/_____/

 ______  _____   _____   __       ____     _____    __   __
/\\__  _\\/\\  __\`\\/\\  __\`\\/\\ \\     /\\  _\`\\  /\\  __\`\\ /\\ \\ /\\ \\
\\/_/\\ \\/\\ \\ \\/\\ \\ \\ \\/\\ \\ \\ \\    \\ \\ \\L\\ \\\\ \\ \\/\\ \\\\ \`\\\`\\/'/'
   \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\ \\  __\\ \\  _ <'\\ \\ \\ \\ \\\`\\/ > <
    \\ \\ \\ \\ \\ \\_\\ \\ \\ \\_\\ \\ \\ \\L\\ \\\\ \\ \\L\\ \\\\ \\ \\_\\ \\  \\/'/\\\`\\
     \\ \\_\\ \\ \\_____\\ \\_____\\ \\____/ \\ \\____/ \\ \\_____\\ /\\_\\\\ \\_\\
      \\/_/  \\/_____/\\/_____/\\/___/   \\/___/   \\/_____/ \\/_/ \\/_/`
      console.log(
        `%c${art}`,
        'background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 11px; font-weight: bold; font-family: monospace; line-height: 1.2;',
      )
    }
  },
)
