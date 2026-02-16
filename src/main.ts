import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import "./style.css";
import App from "./App.vue";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果是同页面内的 hash 跳转（例如点击分类），不触发滚动重置
    if (to.path === from.path) {
      return false;
    }

    return new Promise((resolve) => {
      // 延迟时间与 App.vue 中的 transition 保持一致 (0.25s)
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition);
        } else {
          resolve({ top: 0, behavior: "smooth" });
        }
      }, 250);
    });
  },
});

createApp(App).use(router).mount("#app");
