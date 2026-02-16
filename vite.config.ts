import path from "node:path";
import { defineConfig } from "vite";
import vueRouter from "unplugin-vue-router/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
// Auto Import
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
// Oxlint
import oxlint from "vite-plugin-oxlint";
import Markdown from "unplugin-vue-markdown/vite";

export default defineConfig({
  plugins: [
    vueRouter({
      routesFolder: "src/pages",
      extensions: [".vue", ".md"],
    }),
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      dirs: ["src/components"],
      extensions: ["vue", ".md"],
      dts: "src/components.d.ts",
      deep: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
    tailwindcss(),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      wrapperComponent: "DocLayout",
    }),
    oxlint({
      path: "src",
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    tsconfigPaths: true,
  },
  server: {
    port: 5678,
    host: "0.0.0.0",
  },
});
