import path from 'node:path'
import { defineConfig } from 'vite'
import vueRouter from 'vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import sitemapPlugin from './src/plugins/vite-plugin-sitemap'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vueRouter(),
      vue({
        include: [/\.vue$/],
      }),
      tailwindcss(),
      sitemapPlugin(),
      {
        name: 'vite-plugin-build-timer',
        apply: 'build' as const,
        buildStart() {
          if (!process.env.__VITE_BUILD_START) {
            process.env.__VITE_BUILD_START = String(Date.now())
          }
        },
        closeBundle() {
          const start = Number(process.env.__VITE_BUILD_START ?? 0)
          delete process.env.__VITE_BUILD_START
          const elapsed = ((Date.now() - start) / 1000).toFixed(2)
          console.log(`\n\x1b[32m✔\x1b[0m \x1b[1mbuild-only\x1b[0m 耗时 \x1b[36m${elapsed}s\x1b[0m`)
        },
      },
      !process.env.npm_lifecycle_event?.startsWith('build') && cloudflare(),
    ],

    build: {
      minify: mode === 'fast' ? false : 'oxc',
      cssMinify: 'lightningcss',
      sourcemap: false,
      cssCodeSplit: true,
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
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
        usePolling: false,
      },
      forwardConsole: true,
    },

    experimental: {
      hmrPartialAccept: true,
    },
  }
})
