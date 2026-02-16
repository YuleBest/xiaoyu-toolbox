import { createI18n } from "vue-i18n";
import zhCN from "./zh-CN";
import zhTW from "./zh-TW";
import en from "./en";

const STORAGE_KEY = "xiaoyu-toolbox-lang";

const savedLocale = localStorage.getItem(STORAGE_KEY) || "zh-CN";

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: savedLocale,
  fallbackLocale: "zh-CN",
  messages: {
    "zh-CN": zhCN,
    "zh-TW": zhTW,
    en,
  },
});

/** 支持的语言列表 */
export const supportedLocales = [
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "en", label: "English" },
] as const;

export type SupportedLocale = (typeof supportedLocales)[number]["code"];

/**
 * 切换语言并持久化到 localStorage
 */
export function setLanguage(locale: SupportedLocale) {
  (i18n.global.locale as any).value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

export default i18n;
