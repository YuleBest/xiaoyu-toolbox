/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from "./vuetify";
import router from "../router";
import { createHead } from "@unhead/vue/client";

// Types
import type { App } from "vue";

const head = createHead();

export function registerPlugins(app: App) {
  app.use(vuetify).use(router).use(head);
}
