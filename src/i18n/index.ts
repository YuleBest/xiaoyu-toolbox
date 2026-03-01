import { createI18n } from "vue-i18n";
import zhCN from "./zh-CN";
import zhTW from "./zh-TW";
import en from "./en";
import ja from "./ja";

const STORAGE_KEY = "xiaoyu-toolbox-lang";

// 封装获取逻辑：兼容 Node (SSG阶段) 和 Browser
const getInitialLocale = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem(STORAGE_KEY) || "zh-CN";
  }
  return "zh-CN";
};

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: getInitialLocale(),
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    "zh-TW": zhTW,
    en: en,
    ja: ja,
  },
});

/** 支持的语言列表 */
export const supportedLocales = [
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
] as const;

export type SupportedLocale = (typeof supportedLocales)[number]["code"];

/**
 * 切换语言并持久化到 localStorage
 */
export function setLanguage(locale: SupportedLocale) {
  i18n.global.locale.value = locale;

  // 仅在浏览器环境下执行持久化和 DOM 操作
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }
}

export default i18n;
