import path from "node:path";
import { defineConfig } from "vite";
import vueRouter from "unplugin-vue-router/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
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
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg", "fonts/*.woff2"],
      manifest: {
        name: "小于工具箱",
        short_name: "小于工具箱",
        description: "小于工具箱",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/logo.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/logo.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
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
