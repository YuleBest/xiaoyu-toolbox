import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import "./style.css";
import App from "./App.vue";

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

const hash = window.location.hash;
if (hash.startsWith("#/")) {
  const targetPath = hash.substring(1);
  router.replace(targetPath);
}

createApp(App).use(router).mount("#app");
