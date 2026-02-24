import path from "node:path";
import { defineConfig } from "vite";
import vueRouter from "unplugin-vue-router/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import sitemapPlugin from "./src/plugins/vite-plugin-sitemap";
import { prismjsPlugin } from "vite-plugin-prismjs";

export default defineConfig({
  plugins: [
    prismjsPlugin({
      languages: [
        "javascript",
        "typescript",
        "css",
        "html",
        "json",
        "yaml",
        "python",
        "bash",
        "java",
        "c",
        "cpp",
        "csharp",
        "go",
        "rust",
      ],
      theme: "tomorrow",
      css: true,
    }),
    sitemapPlugin(),
    vueRouter({
      routesFolder: "src/pages",
      extensions: [".vue"],
    }),
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
      dts: "src/components.d.ts",
      deep: true,
      include: [/\.vue$/, /\.vue\?vue/],
    }),
    tailwindcss(),
    vue({
      include: [/\.vue$/],
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
