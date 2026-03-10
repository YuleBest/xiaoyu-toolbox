/// <reference types="vite-ssg" />
import path from 'node:path'
import { defineConfig } from 'vite'
import vueRouter from 'vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import sitemapPlugin from './src/plugins/vite-plugin-sitemap'
import { prismjsPlugin } from 'vite-plugin-prismjs'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/],
    }),
    tailwindcss(),
    vueRouter({
      routesFolder: 'src/pages',
      extensions: ['.vue'],
      dts: 'src/route-map.d.ts',
    }),
    prismjsPlugin({
      languages: [
        'javascript',
        'typescript',
        'css',
        'html',
        'json',
        'yaml',
        'python',
        'bash',
        'java',
        'c',
        'cpp',
        'csharp',
        'go',
        'rust',
      ],
      theme: 'tomorrow',
      css: true,
    }),
    sitemapPlugin(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      dts: 'src/components.d.ts',
      deep: true,
      include: [/\.vue$/, /\.vue\?vue/],
    }),
    cloudflare(),
  ],

  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    onFinished() {
      console.log('SSG 构建完成')
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5678,
    host: '0.0.0.0',
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    outDir: 'dist',
    ssrManifest: true,
  },
})
