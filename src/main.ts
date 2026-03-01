import { ViteSSG } from "vite-ssg";
import { routes } from "vue-router/auto-routes"; // 自动生成的路由依然能用
import "./style.css";
import "./assets/fonts.css";
import App from "./App.vue";
import i18n from "./i18n";

import nprogress from "nprogress";
import "nprogress/nprogress.css";

// 导出 ViteSSG 入口
export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    // 这里的 scrollBehavior 搬过来就行
    scrollBehavior(to, from, savedPosition) {
      if (to.path === from.path) return false;
      if (savedPosition) return savedPosition;
      return { top: 0, behavior: "smooth" };
    },
  },
  ({ app, router, isClient }) => {
    // 注入 i18n
    app.use(i18n);

    // 只有在浏览器环境下（isClient 为 true）才执行的逻辑
    if (isClient) {
      nprogress.configure({ showSpinner: false, speed: 400 });

      router.beforeEach((to) => {
        nprogress.start();

        // --- 兼容旧版 Hash URL ---
        // 注意：这里必须放在 isClient 里，因为打包环境没有 window
        const hash = window.location.hash;
        if (to.path === "/" && hash.startsWith("#/")) {
          const targetPath = hash.substring(1);
          history.replaceState(null, "", targetPath);
          return { path: targetPath, replace: true };
        }
        return true;
      });

      router.afterEach(() => {
        nprogress.done();
      });
    }
  },
);
