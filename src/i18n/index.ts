import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'

const STORAGE_KEY = 'xiaoyu-toolbox-lang'

// 封装获取逻辑：兼容 Node (SSG阶段) 和 Browser
const getInitialLocale = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(STORAGE_KEY) || 'zh-CN'
  }
  return 'zh-CN'
}

const initialLocale = getInitialLocale()

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: initialLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
  },
})

// 初始化时同步 HTML lang 属性
if (typeof window !== 'undefined') {
  document.documentElement.lang = initialLocale
}

/** 支持的语言列表 */
export const supportedLocales = [
  { code: 'zh-CN', label: '简体中文' },
] as const

export type SupportedLocale = (typeof supportedLocales)[number]['code']

/**
 * 切换语言并持久化到 localStorage
 */
export function setLanguage(locale: SupportedLocale) {
  i18n.global.locale.value = locale

  // 仅在浏览器环境下执行持久化和 DOM 操作
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }
}

export default i18n

// HMR support for i18n
if (import.meta.hot) {
  const localeFiles = supportedLocales.map((l) => `./${l.code}.ts`)
  import.meta.hot.accept(localeFiles, (newModules) => {
    newModules.forEach((mod, i) => {
      if (mod) {
        const locale = supportedLocales[i]?.code
        if (locale) {
          i18n.global.setLocaleMessage(locale, mod.default)
        }
      }
    })
    console.log('[HMR] i18n messages updated')
  })
}
