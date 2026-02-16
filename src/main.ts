import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import "./style.css";
import App from "./App.vue";
import i18n from "./i18n";

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) {
      return false;
    }
    return new Promise((resolve) => {
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

// --- 兼容旧版 Hash URL ---
router.beforeEach((to) => {
  const hash = window.location.hash;

  if (to.path === "/" && hash.startsWith("#/")) {
    const targetPath = hash.substring(1);
    history.replaceState(null, "", targetPath);

    return { path: targetPath, replace: true };
  }

  return true;
});

createApp(App).use(router).use(i18n).mount("#app");
