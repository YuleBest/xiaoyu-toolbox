/// <reference types="vite-ssg" />
import path from 'node:path'
import { defineConfig } from 'vite'
import vueRouter from 'vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import sitemapPlugin from './src/plugins/vite-plugin-sitemap'
import { cloudflare } from '@cloudflare/vite-plugin'
import { VueRouterAutoImports } from 'vue-router/unplugin'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vueRouter(),
      vue({
        include: [/\.vue$/],
      }),
      tailwindcss(),
      sitemapPlugin(),
      AutoImport({
        imports: ['vue', VueRouterAutoImports],
        dts: !process.env.npm_lifecycle_event?.startsWith('build') && 'src/auto-imports.d.ts',
      }),
      Components({
        dirs: ['src/components'],
        extensions: ['vue'],
        dts: !process.env.npm_lifecycle_event?.startsWith('build') && 'src/components.d.ts',
        deep: true,
        include: [/\.vue$/],
      }),
      !process.env.npm_lifecycle_event?.startsWith('build') && cloudflare(),
    ],

    build: {
      minify: mode === 'fast' ? false : 'oxc',
      cssMinify: 'lightningcss',
      sourcemap: false,
      cssCodeSplit: true,
      outDir: 'dist',
      ssrManifest: true,
      chunkSizeWarningLimit: 2000,
    },

    ssgOptions: {
      script: 'async',
      formatting: 'minify',
      onFinished() {
        console.log('SSG 构建完成!')
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core', 'axios', 'hono', 'lucide-vue-next'],
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    },

    server: {
      port: 5678,
      host: '0.0.0.0',
      watch: {
        usePolling: true,
      },
      forwardConsole: true,
    },
  }
})
