# 小于工具箱 — 项目文档

> **在线地址**: [https://tool.yule.ink](https://tool.yule.ink)
> **GitHub**: [https://github.com/YuleBest/xiaoyu-toolbox](https://github.com/YuleBest/xiaoyu-toolbox)

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈总览](#2-技术栈总览)
3. [项目结构](#3-项目结构)
4. [核心架构](#4-核心架构)
   - [4.1 前端架构](#41-前端架构)
   - [4.2 后端架构（Cloudflare Workers）](#42-后端架构cloudflare-workers)
   - [4.3 路由系统](#43-路由系统)
   - [4.4 国际化（i18n）](#44-国际化i18n)
   - [4.5 状态管理](#45-状态管理)
   - [4.6 样式系统](#46-样式系统)
   - [4.7 SEO 与 Meta 管理](#47-seo-与-meta-管理)
5. [工具系统详解](#5-工具系统详解)
   - [5.1 工具注册机制](#51-工具注册机制)
   - [5.2 工具分类](#52-工具分类)
   - [5.3 工具页面模板](#53-工具页面模板)
   - [5.4 完整工具列表](#54-完整工具列表)
6. [Worker 后端 API](#6-worker-后端-api)
   - [6.1 API 路由列表](#61-api-路由列表)
   - [6.2 API 客户端封装](#62-api-客户端封装)
7. [构建与部署](#7-构建与部署)
   - [7.1 本地开发](#71-本地开发)
   - [7.2 构建流程](#72-构建流程)
   - [7.3 部署到 Cloudflare Pages](#73-部署到-cloudflare-pages)
   - [7.4 环境变量与绑定](#74-环境变量与绑定)
8. [数据与资源](#8-数据与资源)
9. [UI 组件库](#9-ui-组件库)
10. [代码规范与检查](#10-代码规范与检查)
11. [新增工具页面流程](#11-新增工具页面流程)
12. [常见问题与故障排除](#12-常见问题与故障排除)

---

## 1. 项目概述

**小于工具箱**是一个**开源、免费、无广告**的在线工具集合网站。它汇集了 40+ 个实用工具，涵盖开发、多媒体、生活查询和游戏四大类别。所有工具均采用纯前端或 Cloudflare Workers 代理实现，注重用户隐私保护。

### 核心特性

- **40+ 在线工具**：Base64 转换、JSON/YAML 互转、二维码生成、视频解析、汇率查询等
- **零广告**：纯净的用户体验
- **隐私优先**：大部分工具纯前端计算，数据不上传服务器
- **现代化 UI**：基于 Shadcn Vue + Tailwind CSS v4，支持亮/暗/系统主题
- **响应式设计**：完美适配桌面端和移动端
- **SSG 静态生成**：使用 Vite + vite-ssg 构建，SEO 友好
- **国际化**：支持多语言（简体中文为核心，框架已预留繁体中文/英文/日文）
- **Edge 部署**：后端 API 运行在 Cloudflare Workers 上，前端部署于 Cloudflare Pages

---

## 2. 技术栈总览

| 维度         | 技术选型                                                | 版本     |
| ------------ | ------------------------------------------------------- | -------- |
| **前端框架** | Vue 3 (Composition API + `<script setup>`)              | ^3.5.29  |
| **语言**     | TypeScript 5.9（严格模式）                              | ~5.9.3   |
| **构建工具** | Vite 8 + vite-ssg（SSG 静态站点生成）                   | ^8.0.0   |
| **路由**     | vue-router 5（文件系统自动路由）                        | ^5.0.3   |
| **样式**     | Tailwind CSS v4 + Shadcn Vue (new-york 风格, zinc 色调) | ^4.2.1   |
| **UI 组件**  | reka-ui（无头 UI）+ Shadcn Vue 封装组件                 | ^2.8.2   |
| **图标**     | lucide-vue-next                                         | ^0.564.0 |
| **国际化**   | vue-i18n v11                                            | ^11.2.8  |
| **状态管理** | Pinia + @vueuse/core (useStorage)                       |          |
| **SEO**      | @unhead/vue                                             | ^2.1.9   |
| **后端框架** | Hono (Cloudflare Workers)                               | ^4.12.5  |
| **部署平台** | Cloudflare Pages + Workers                              |          |
| **代码检查** | ESLint 10 + oxlint + oxfmt + prettier                   |          |
| **类型检查** | golar (Vue TypeScript 类型检查器)                       | ^0.0.15  |
| **图表**     | @unovis/ts + @unovis/vue                                | ^1.6.4   |
| **包管理器** | pnpm                                                    | 10.30.0  |

### 关键依赖说明

| 依赖                              | 用途                                       |
| --------------------------------- | ------------------------------------------ |
| `@ffmpeg/ffmpeg` + `@ffmpeg/util` | 浏览器端 FFmpeg WASM（B 站视频音视频合并） |
| `@internationalized/date`         | 日期国际化处理                             |
| `axios`                           | HTTP 请求客户端                            |
| `exifr`                           | 图片 EXIF 元数据读取                       |
| `fuse.js`                         | 模糊搜索                                   |
| `html-to-image`                   | DOM 元素截图（代码图片生成）               |
| `jsqr`                            | 二维码识别                                 |
| `opencc-js`                       | 简繁中文转换                               |
| `openmeteo`                       | 天气数据 API 客户端                        |
| `pinyin-pro`                      | 拼音转换                                   |
| `qrcode`                          | 二维码生成                                 |
| `shiki`                           | 代码语法高亮（代码图片生成）               |
| `vue-sonner`                      | 通知提示组件                               |
| `nprogress`                       | 页面加载进度条                             |

---

## 3. 项目结构

```
xiaoyu-toolbox/
├── docs/                              # 文档目录（API 文档、Shadcn 组件文档等）
│   ├── shadcn-components/             # Shadcn Vue 组件使用文档
│   ├── 网易云音乐API.md               # 第三方 API 文档
│   └── ...
├── public/                            # 静态资源（不经过构建处理）
│   ├── _headers                       # Cloudflare Pages 自定义响应头
│   ├── favicon.svg                    # 网站图标
│   ├── fileauth.txt                   # 文件认证
│   ├── database/                      # 静态数据文件（JSON）
│   │   ├── poetry-tree.json           # 古诗词数据库
│   │   ├── hok/                       # 王者荣耀数据
│   │   ├── hok-voices/                # 王者语音数据
│   │   ├── jichacha/                  # 手机机型数据
│   │   ├── mbti/                      # MBTI 测试数据
│   │   ├── phone_number/              # 手机归属地离线数据库
│   │   ├── alarm/                     # 气象预警数据
│   │   └── demographics-of-China/     # 中国人口统计数据
│   └── fonts/                         # 自定义字体文件
├── scripts/                           # 构建辅助脚本
│   ├── build.ts                       # 完整构建脚本（commitlog + lint + type-check + build）
│   ├── commitLog.ts                   # Git 提交日志生成（用于页面更新日志）
│   └── readme.ts                      # README 自动生成脚本
├── src/
│   ├── main.ts                        # 应用入口（ViteSSG 模式）
│   ├── App.vue                        # 根组件（布局 + 路由 + 全局组件）
│   ├── style.css                      # 全局样式（Tailwind CSS 入口 + CSS 变量主题）
│   ├── fonts.css                      # 字体加载
│   ├── auto-imports.d.ts              # unplugin-auto-import 类型声明
│   ├── components.d.ts                # unplugin-vue-components 类型声明
│   ├── api/                           # API 请求模块
│   │   ├── request.ts                 # axios 实例封装
│   │   ├── dydown.ts                  # 抖音视频解析 API
│   │   ├── bilidown.ts                # B 站视频解析 API
│   │   ├── lyric.ts                   # 歌词获取 API
│   │   ├── ncm.ts                     # 网易云音乐 API
│   │   ├── weather.ts                 # 天气查询 API
│   │   ├── alarm.ts                   # 气象预警 API
│   │   ├── hhsh.ts                    # "好好说话" API
│   │   ├── hok.ts                     # 王者荣耀数据 API
│   │   ├── jichacha.ts                # 手机机型查询 API
│   │   ├── mcpe.ts                    # Minecraft PE 下载 API
│   │   ├── frankfurter.ts             # 汇率查询 API
│   │   ├── phoneNumber.ts             # 手机归属地查询
│   │   └── brand_map.ts               # 品牌映射数据
│   ├── assets/database/               # 前端静态数据（编译时引入）
│   ├── components/
│   │   ├── layout/                    # 布局组件
│   │   │   ├── Sidebar.vue            # 桌面端侧边栏
│   │   │   ├── MobileNav.vue          # 移动端导航栏
│   │   │   ├── Footer.vue             # 页脚
│   │   │   └── BackButton.vue         # 返回按钮
│   │   ├── tool/                      # 工具页面通用组件
│   │   │   ├── ToolCard.vue           # 工具卡片（首页/分类页使用）
│   │   │   └── ToolContainer.vue      # 工具容器（每个工具页面的外壳）
│   │   ├── ui/                        # Shadcn Vue UI 组件
│   │   │   ├── button/                # 按钮
│   │   │   ├── dropdown-menu/         # 下拉菜单
│   │   │   ├── sheet/                 # 滑出面板
│   │   │   ├── sonner/                # 通知
│   │   │   ├── select/                # 选择器
│   │   │   ├── switch/                # 开关
│   │   │   ├── scroll-area/           # 滚动区域
│   │   │   ├── popover/               # 弹出面板
│   │   │   ├── dialog/ → alert-dialog/ # 弹窗
│   │   │   ├── checkbox/              # 复选框
│   │   │   ├── label/                 # 标签
│   │   │   ├── separator/             # 分隔线
│   │   │   ├── slider/                # 滑块
│   │   │   ├── calendar/              # 日历
│   │   │   ├── chart/                 # 图表
│   │   │   └── native-select/         # 原生选择
│   │   ├── GlobalToast.vue            # 全局 Toast 通知
│   │   ├── LanguageToggle.vue         # 语言切换组件
│   │   ├── ModeToggle.vue             # 主题切换组件
│   │   └── UpdateLog.vue              # 页面更新日志
│   ├── config/
│   │   ├── nav.ts                     # 导航配置（主导航 + 分类定义）
│   │   └── tools.ts                   # 工具列表配置（核心：所有工具的元数据）
│   ├── i18n/
│   │   ├── index.ts                   # vue-i18n 初始化 + 语言切换逻辑
│   │   └── zh-CN.ts                   # 简体中文语言包（唯一完整实现）
│   ├── layouts/
│   │   └── Main.vue                   # 主布局（侧边栏 + 移动导航 + 内容区域 + 页脚）
│   ├── lib/
│   │   ├── utils.ts                   # cn() 工具函数（clsx + tailwind-merge）
│   │   └── useMeta.ts                 # SEO/Meta 头部管理（自动按页面设置标题/描述/关键词）
│   ├── pages/                         # 文件系统路由页面（约 42 个 .vue 文件）
│   │   ├── index.vue                  # 首页（精选推荐 + 热门 + 最新 + 收藏）
│   │   ├── about.vue                  # 关于页面
│   │   ├── categories.vue            # 全部分类页面
│   │   ├── search.vue                # 搜索页面
│   │   ├── base64.vue                 # Base64 转换工具
│   │   ├── dydown.vue                 # 抖音视频解析
│   │   ├── bilidown.vue               # B 站视频解析
│   │   ├── qrcode.vue                 # 二维码工具
│   │   ├── weather.vue                # 天气查询
│   │   ├── hok.vue                    # 王者荣耀查询
│   │   └── ...                        # 更多工具页面
│   ├── plugins/
│   │   └── vite-plugin-sitemap.ts     # Vite 插件：自动生成 sitemap.xml + robots.txt
│   ├── stores/
│   │   ├── favorites.ts               # Pinia 收藏状态（持久化到 localStorage）
│   │   └── navigation.ts             # 导航状态（当前分类、侧边栏折叠）
│   ├── style.css                      # 全局样式
│   └── worker/                        # Cloudflare Worker 后端（Hono 框架）
│       ├── index.ts                   # Worker 入口（注册所有路由）
│       └── routes/                    # 路由处理器
│           ├── dydown.ts              # 抖音视频解析
│           ├── bilidown.ts            # B 站视频解析
│           ├── lyric.ts               # 歌词获取
│           ├── weather.ts             # 天气代理
│           ├── alarm.ts               # 气象预警代理
│           ├── hhsh.ts                # "好好说话" API
│           ├── frankfurter.ts         # 汇率查询代理
│           ├── getmcpe.ts             # Minecraft PE 下载
│           └── anime-search.ts        # 以图搜番代理
├── components.json                    # Shadcn Vue 配置
├── tailwind.config.js                 # Tailwind 扫描路径配置
├── vite.config.ts                     # Vite 构建配置
├── wrangler.toml                      # Cloudflare Workers 部署配置
├── tsconfig.json                      # TypeScript 项目引用
├── tsconfig.app.json                  # TypeScript 应用配置（严格模式）
├── tsconfig.node.json                 # TypeScript Node 配置
├── eslint.config.mjs                  # ESLint 扁平化配置
├── typed-router.d.ts                  # vue-router 文件系统路由类型声明（自动生成）
├── package.json                       # 项目依赖与脚本
└── pnpm-lock.yaml                     # pnpm 锁文件
```

---

## 4. 核心架构

### 4.1 前端架构

#### 入口流程

```
index.html
  └─ src/main.ts                  # 应用初始化
      ├─ 创建 Vue 应用
      ├─ 创建 vue-router（文件系统自动路由）
      ├─ 创建 @unhead/vue（SEO 管理）
      ├─ 注册 vue-i18n
      ├─ 配置 NProgress 进度条
      ├─ 处理 Hash 路由兼容（`/#/xxx` → `/xxx`）
      ├─ HMR 热更新支持
      └─ 挂载到 #app
```

#### 布局层级

```
App.vue
  └─ MainLayout (layouts/Main.vue)
      ├─ BackButton                  # 浮动返回按钮
      ├─ Sidebar                     # 桌面端侧边栏（Logo + 搜索 + 导航 + 分类 + 设置）
      ├─ MobileNav                   # 移动端底部/顶部导航
      ├─ <router-view>               # 页面内容（带 transition 动画）
      │   └─ <page>.vue              # 具体的工具页面
      │       └─ ToolContainer       # 工具容器（标题栏 + 信息面板 + 收藏）
      │           └─ ...             # 工具具体内容
      ├─ UpdateLog                   # 页面 Git 更新日志
      └─ Footer                      # 页脚（版权 + 链接）
```

### 4.2 后端架构（Cloudflare Workers）

后端基于 **Hono** 框架，运行在 Cloudflare Workers 上，作为 API 代理层。

```
Worker 入口 (src/worker/index.ts)
  └─ Hono app.basePath('/api')
      ├─ /api/dydown/*               # 抖音视频解析
      ├─ /api/bilidown/*             # B 站视频解析
      ├─ /api/lyric/*                # 歌词获取
      ├─ /api/weather/*              # 天气代理
      ├─ /api/alarm/*                # 气象预警代理
      ├─ /api/hhsh/*                 # "好好说话"
      ├─ /api/frankfurter/*          # 汇率代理
      ├─ /api/getmcpe/*              # MC PE 下载
      └─ /api/anime-search/*         # 以图搜番
```

**wrangler.toml** 配置了：

- 静态资源目录 `dist`（Cloudflare Pages 集成）
- SPA 回退路由（`not_found_handling = "single-page-application"`）
- API 请求优先由 Worker 处理（`run_worker_first = ["/api/*"]`）
- KV Namespace（`HOK_DATA`，王者荣耀数据缓存）
- D1 Database（`DB`，手机归属地离线数据库）
- Observability 可观测性已启用

### 4.3 路由系统

项目使用 **vue-router 的文件系统自动路由**（`vue-router/vite` 插件），规则如下：

| 文件路径                   | 生成的路由路径 |
| -------------------------- | -------------- |
| `src/pages/index.vue`      | `/`            |
| `src/pages/about.vue`      | `/about`       |
| `src/pages/categories.vue` | `/categories`  |
| `src/pages/search.vue`     | `/search`      |
| `src/pages/base64.vue`     | `/base64`      |
| `src/pages/dydown.vue`     | `/dydown`      |
| ...                        | ...            |

每个 `.vue` 文件自动注册为一个路由，无需手动配置 `router.ts`。类型声明自动生成在 `typed-router.d.ts` 中。

**路由守卫**：

- `beforeEach`：启动 NProgress 进度条 + 处理 `/#/xxx` 哈希路由兼容
- `afterEach`：结束 NProgress
- `scrollBehavior`：过渡动画完成后恢复滚动位置

### 4.4 国际化（i18n）

采用 **vue-i18n v11**（Composition API 模式）。

#### 当前状态

- **简体中文 (`zh-CN`)**：唯一完整的语言文件（覆盖所有工具描述、导航、通用文本等）
- **繁体中文/英文/日文**：语言切换 UI 已就绪（`LanguageToggle.vue`），但翻译文件尚未实现

#### 核心机制

```typescript
// src/i18n/index.ts
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN', // 从 localStorage 读取或默认
  fallbackLocale: 'zh-CN',
  messages: { 'zh-CN': zhCN },
})
```

- 语言选择持久化到 `localStorage`（key: `xiaoyu-toolbox-lang`）
- HTML `<html>` 标签的 `lang` 属性同步更新
- 支持 HMR 热更新语言文件
- `supportedLocales` 数组定义了支持的语言列表

#### 使用方式

在 Vue 模板中：

```vue
{{ $t('common.appName') }} {{ $t('tools.base64.title') }}
```

在 `<script setup>` 中：

```typescript
const { t } = useI18n()
t('nav.home')
t('tools.qrcode.description')
```

### 4.5 状态管理

采用轻量级状态管理方案，无需完整的 Pinia store：

| Store             | 文件                       | 用途                            | 持久化                                    |
| ----------------- | -------------------------- | ------------------------------- | ----------------------------------------- |
| `favoriteIds`     | `src/stores/favorites.ts`  | 收藏的工具 ID 列表              | ✅ localStorage (`xiaoyu_favorite_tools`) |
| `navigationStore` | `src/stores/navigation.ts` | 当前活跃分类 ID、侧边栏折叠状态 | ❌ 内存                                   |

通过 `@vueuse/core` 的 `useStorage` 实现自动持久化，收藏数据在页面刷新后保持。

### 4.6 样式系统

#### Tailwind CSS v4

使用 Tailwind CSS v4 的最新 `@import` 方式：

```css
@import 'tailwindcss';
@plugin "@tailwindcss/typography";
@import 'tw-animate-css';
```

#### CSS 变量主题（Shadcn Vue zinc 色调）

- `:root` 亮色模式变量
- `.dark` 暗色模式变量（通过 `@custom-variant dark` 定义）
- 通过 `useColorMode()`（来自 `@vueuse/core`）切换

#### 自定义字体

```css
--font-sans: 'Geist', 'PingFang SC', ...;
--font-mono: 'Google Sans Code', 'Fira Code', ...;
```

#### cn() 工具函数

```typescript
// src/lib/utils.ts
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4.7 SEO 与 Meta 管理

使用 `@unhead/vue` 自动管理每个页面的 SEO Meta 信息。

#### `useToolMeta()` — 自动设置

位于 `src/lib/useMeta.ts`，在每个页面加载时自动运行：

- 匹配当前路由路径到工具配置
- 自动设置 `<title>`、`<meta description>`、`<meta keywords>`
- 设置 Open Graph 标签（`og:title`、`og:description`、`og:type`）
- 设置 `<link rel="canonical">`

#### Sitemap 自动生成

`src/plugins/vite-plugin-sitemap.ts` 在构建时自动生成：

- `sitemap.xml`（包含所有工具页面 + 静态页面）
- `robots.txt`

---

## 5. 工具系统详解

### 5.1 工具注册机制

每个工具在 `src/config/tools.ts` 中注册，通过 `Tool` 接口定义：

```typescript
export interface Tool {
  id: string // 唯一标识，也是路由文件名（无扩展名）
  title: string // i18n key，如 'tools.base64.title'
  subtitle: string // i18n key
  description: string // i18n key
  author: string // 作者
  usage: string // i18n key
  icon: Component // lucide-vue-next 图标组件
  color: string // Tailwind 颜色类名
  path: string // 路由路径，如 '/base64'
  date: string // 发布日期 YYYY-MM-DD
  backEnd?: string // 后端 API URL 或链接
  license?: string // 许可证
  copyright?: string // 版权声明
}
```

#### 特殊标记

```typescript
// 精选推荐（首页展示）
export const tops = ['ncm-get-playlist', 'hhsh', 'exchange', 'length']

// 热门使用（首页展示）
export const hots = [
  'ncm-get-playlist',
  'dydown',
  'bilidown',
  'lyric',
  'jichacha',
  'weibo-hot',
  'hok',
]
```

### 5.2 工具分类

| 分类       | ID      | 图标           | 工具数  |
| ---------- | ------- | -------------- | ------- |
| 开发工具   | `dev`   | SquareTerminal | 10      |
| 多媒体工具 | `media` | Tv             | 9       |
| 生活查询   | `life`  | CloudSun       | 15      |
| 游戏工具   | `game`  | Swords         | 4       |
| **合计**   |         |                | **38+** |

### 5.3 工具页面模板

每个工具页面遵循以下模式：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ToolContainer from '@/components/tool/ToolContainer.vue'
import { allTools } from '@/config/tools'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const tool = allTools.find((t) => t.id === 'example')!

// 工具逻辑...
</script>

<template>
  <ToolContainer :tool="tool">
    <!-- 可选：右侧操作按钮 -->
    <template #actions>
      <!-- 如下载、设置等按钮 -->
    </template>

    <!-- 工具主体内容 -->
    <div>
      <!-- 工具实现 -->
    </div>
  </ToolContainer>
</template>
```

`ToolContainer` 组件自动提供：

- 工具标题栏（图标 + 名称 + 副标题）
- 收藏按钮
- 详情面板（作者、日期、描述、使用指南、许可证）
- `actions` 插槽供自定义操作按钮

### 5.4 完整工具列表

#### 🔧 开发工具（10 个）

| ID                   | 工具名称                  | 说明                 |
| -------------------- | ------------------------- | -------------------- |
| `adoc`               | 行政区划代码              | 中国大陆行政区划查询 |
| `url-encode`         | URL 编码                  | URL 编码与解码       |
| `unicode`            | Unicode 编解码            | Unicode 编码与解码   |
| `base64`             | Base64 转换               | 文本与 Base64 互转   |
| `json-yaml`          | JSON-YAML 转换            | 配置文件格式互转     |
| `markdown-table-csv` | Markdown Table - CSV 互转 | 表格格式双向转换     |
| `playground`         | JS 演练场                 | 浏览器内 JS/TS 沙盒  |
| `translator-ai`      | 翻译 (Builtin AI)         | Chrome 内置 AI 翻译  |
| `codeimg`            | 代码图片生成              | 代码转精美图片       |
| `password-gen`       | 强密码生成器              | 自定义安全密码生成   |

#### 🎬 多媒体工具（9 个）

| ID                 | 工具名称       | 说明               |
| ------------------ | -------------- | ------------------ |
| `qrcode`           | 二维码工具     | 生成与识别二维码   |
| `exif`             | 图片 EXIF 查看 | 查看图片元数据     |
| `decibel`          | 分贝仪         | 实时麦克风音量检测 |
| `dydown`           | 抖音视频解析   | 无水印视频下载     |
| `bilidown`         | B站视频解析    | 音视频流合并与下载 |
| `bvav`             | BV/AV 号互转   | 哔哩哔哩编号互转   |
| `lyric`            | 歌词获取       | 搜索并下载歌词     |
| `ncm-get-playlist` | 网易云歌单     | 歌单歌曲列表解析   |
| `anime-search`     | 以图搜番       | 图片搜索动画出处   |

#### 🌤️ 生活查询（15 个）

| ID                   | 工具名称      | 说明                   |
| -------------------- | ------------- | ---------------------- |
| `mbti`               | MBTI 人格测试 | 16 型人格测试          |
| `hhsh`               | 好好说话      | 拼音首字母缩写释义     |
| `jichacha`           | 机查查        | 手机机型数据查询       |
| `weather`            | 天气查询      | 全国天气实时查询       |
| `alarm`              | 气象预警      | 中央气象台气象预警     |
| `exchange`           | 汇率查询      | 实时汇率转换与历史趋势 |
| `length`             | 长度单位换算  | 常用长度单位换算       |
| `phone-number`       | 归属地查询    | 手机号码归属地查询     |
| `weibo-hot`          | 微博热搜      | 获取历史和实时热搜     |
| `period`             | 月经周期      | 生理期计算器           |
| `time-distance`      | 时间距离      | 两日期间隔计算         |
| `statutory-holidays` | 法定节假日    | 节假日查询（2026）     |
| `poetry`             | 中国古诗词    | 海量古诗词查询         |
| `china-demographics` | 中国大陆人口  | 1949-2025 人口数据     |
| `qq-avatar`          | QQ 头像获取   | 通过 QQ 号获取头像     |

#### 🎮 游戏工具（4 个）

| ID           | 工具名称     | 说明                    |
| ------------ | ------------ | ----------------------- |
| `hok`        | 王者荣耀查询 | 英雄装备技能查询        |
| `hok-voices` | 王者语音鉴赏 | 英雄台词在线试听        |
| `reaction`   | 反应力测试   | 毫秒级反应速度测试      |
| `mcpe`       | MC PE 下载   | Minecraft PE 全版本下载 |

---

## 6. Worker 后端 API

### 6.1 API 路由列表

所有 API 均挂载在 `/api` 基路径下。

| 路由                       | 方法 | 描述                           | 源站              |
| -------------------------- | ---- | ------------------------------ | ----------------- |
| `/api/dydown/parse`        | GET  | 解析抖音分享链接               | 抖音              |
| `/api/dydown/download`     | GET  | 下载无水印视频（直接流式代理） | 抖音              |
| `/api/dydown/preview`      | GET  | 获取视频预览流                 | 抖音              |
| `/api/bilidown/parse`      | GET  | 解析 B 站视频信息              | Bilibili          |
| `/api/lyric/search`        | GET  | 搜索歌曲                       | 酷狗音乐          |
| `/api/lyric/get`           | GET  | 获取 LRC 歌词                  | 酷狗音乐          |
| `/api/frankfurter/latest`  | GET  | 最新汇率数据                   | Frankfurter API   |
| `/api/weather/forecast`    | GET  | 天气预报代理                   | Open-Meteo        |
| `/api/weather/search`      | GET  | 城市搜索代理                   | Open-Meteo        |
| `/api/alarm/list`          | GET  | 全国气象预警列表               | 中央气象局        |
| `/api/alarm/detail`        | GET  | 气象预警详情                   | 中央气象局        |
| `/api/hhsh/guess`          | GET  | 拼音缩写查询                   | lab.magiconch.com |
| `/api/hhsh/contribute`     | POST | 提交新词条                     | lab.magiconch.com |
| `/api/getmcpe/list`        | GET  | MC PE 版本列表                 | MCAPKS API        |
| `/api/getmcpe/url`         | GET  | 获取下载链接                   | MCAPKS API        |
| `/api/anime-search/search` | POST | 以图搜番                       | trace.moe         |

### 6.2 API 客户端封装

前端 API 调用位于 `src/api/` 目录，每个工具对应一个模块：

- 使用统一的 `axios` 实例（`src/api/request.ts`，15 秒超时）
- 部分工具使用原生 `fetch`（如 dydown，追求轻量）
- 响应拦截器处理错误日志

---

## 7. 构建与部署

### 7.1 本地开发

```bash
# 安装依赖（必须使用 pnpm）
pnpm install

# 启动开发服务器（前端 + Worker）
pnpm dev

# 仅启动前端
pnpm dev     # → http://localhost:5678

# 单独启动 Worker 开发
pnpm worker:dev   # → wrangler dev
```

### 7.2 构建流程

```bash
# 完整构建（commitlog → lint → type-check → vite build）
pnpm build

# 仅构建前端
pnpm build-only

# 代码检查
pnpm lint           # oxlint + eslint（修复）
pnpm lint-check     # oxlint + eslint（仅检查）
pnpm type-check     # 类型检查
pnpm format         # 代码格式化（oxfmt）
```

**构建脚本 `scripts/build.ts`** 的执行顺序：

1. `commitlog` — 生成 Git 提交日志 `public/_commit.log.json`
2. `lint` — oxlint + ESLint 自动修复
3. `type-check` — golar 类型检查
4. `build-only` — Vite 构建（SSG 静态生成）

### 7.3 部署到 Cloudflare Pages

项目通过 Cloudflare Workers + Pages 部署：

1. **Vite 构建**输出静态文件到 `dist/` 目录
2. **Cloudflare Workers** 处理 `/api/*` 请求
3. **Cloudflare Pages** 托管静态资源（`dist/` 目录）
4. **自定义域名**：`https://tool.yule.ink`

### 7.4 环境变量与绑定

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "HOK_DATA"       # 王者荣耀数据缓存

[[d1_databases]]
binding = "DB"             # 手机归属地数据库
database_name = "phone-db"

[observability]
enabled = true             # Workers 可观测性
```

---

## 8. 数据与资源

### 静态数据文件（`public/database/`）

| 目录/文件                | 用途                       | 来源                                                                       |
| ------------------------ | -------------------------- | -------------------------------------------------------------------------- |
| `poetry-tree.json`       | 古诗词数据库               | 自有整理                                                                   |
| `hok/`                   | 王者荣耀英雄/装备/技能数据 | 游戏数据                                                                   |
| `hok-voices/`            | 王者语音台词数据           | 游戏数据                                                                   |
| `jichacha/`              | 手机机型数据               | [MobileModels](https://github.com/KHwang9883/MobileModels) CC BY-NC-SA 4.0 |
| `mbti/`                  | MBTI 测试题目数据          | 自有整理                                                                   |
| `phone_number/`          | 手机归属地离线数据库       | [php-mobile-locator](https://github.com/zxc7563598/php-mobile-locator) MIT |
| `demographics-of-china/` | 中国人口统计数据           | 国家统计局 CC BY 4.0                                                       |
| `alarm/`                 | 气象预警数据（缓存）       | 中央气象局                                                                 |
| `adoc/`                  | 行政区划代码数据           | 自有整理                                                                   |

### 字体文件（`public/fonts/`）

Geist 和 Google Sans Code 字体，用于界面渲染。

---

## 9. UI 组件库

项目使用 **Shadcn Vue**（new-york 风格，zinc 基础色）作为 UI 组件库。

组件文档位于 `docs/shadcn-components/`，每个组件一个 `.md` 文件。

已安装的组件：

| 组件            | 用途                            |
| --------------- | ------------------------------- |
| `button`        | 按钮                            |
| `dropdown-menu` | 下拉菜单（主题/语言切换用）     |
| `sheet`         | 滑出面板                        |
| `sonner`        | Toast 通知（`vue-sonner` 封装） |
| `select`        | 下拉选择器                      |
| `switch`        | 开关                            |
| `scroll-area`   | 滚动区域                        |
| `popover`       | 弹出面板                        |
| `alert-dialog`  | 警告对话框                      |
| `checkbox`      | 复选框                          |
| `label`         | 标签                            |
| `separator`     | 分隔线                          |
| `slider`        | 滑块                            |
| `calendar`      | 日历选择                        |
| `chart`         | 图表组件                        |
| `native-select` | 原生选择框                      |

所有 UI 组件自动注册（通过 `unplugin-vue-components`），使用时无需手动 import。

---

## 10. 代码规范与检查

### TypeScript 严格模式

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "erasableSyntaxOnly": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedSideEffectImports": true
}
```

### 代码检查工具链

| 工具         | 用途                           | 命令               |
| ------------ | ------------------------------ | ------------------ |
| **oxlint**   | Rust 编写的快速 Linter（主要） | `pnpm lint:oxlint` |
| **ESLint**   | 传统 Linter（辅助）            | `pnpm lint:eslint` |
| **oxfmt**    | Rust 代码格式化                | `pnpm format`      |
| **golar**    | Vue TypeScript 类型检查器      | `pnpm type-check`  |
| **prettier** | 代码格式化（备用）             | 集成在 ESLint 中   |

### 自动导入

- `unplugin-auto-import`：自动导入 Vue / Vue Router 的 Composition API（`ref`、`computed`、`watch`、`useRouter` 等）
- `unplugin-vue-components`：自动注册 `src/components/` 下的组件

### 命名规范

- **页面文件**：小写 kebab-case（`base64.vue`、`json-yaml.vue`）
- **组件文件**：PascalCase（`ToolContainer.vue`、`ModeToggle.vue`）
- **工具 ID**：小写 kebab-case（`json-yaml`、`phone-number`）

---

## 11. 新增工具页面流程

1. **创建页面**：在 `src/pages/` 下新建 `工具名.vue`
   - 使用 `ToolContainer` 包裹
   - 自动注册路由（vue-router 文件系统路由）

2. **注册工具信息**：在 `src/config/tools.ts` 中
   - 添加到对应分类的 `toolsData` 数组
   - 可选：添加到 `tops`（精选）或 `hots`（热门）

3. **添加国际化翻译**：在 `src/i18n/zh-CN.ts` 中添加翻译
   - 格式：`tools.{id}.{title|subtitle|description|usage}`

4. **添加 API 模块**（如需后端代理）
   - 在 `src/api/` 中添加调用模块
   - 在 `src/worker/routes/` 中添加 Hono 路由
   - 在 `src/worker/index.ts` 中注册路由

5. **添加静态数据**（如需离线数据）
   - 放入 `public/database/` 目录
   - 通过 `fetch()` 或构建时引入

---

## 12. 常见问题与故障排除

### 开发相关

| 问题                   | 解决方案                                            |
| ---------------------- | --------------------------------------------------- |
| `pnpm install` 失败    | 确保 pnpm 版本 ≥ 10.30.0                            |
| `golar` 类型检查失败   | 运行 `pnpm type-check` 查看具体错误                 |
| 构建时 Worker 相关错误 | 运行 `pnpm dev` 或 `pnpm worker:dev` 单独调试       |
| SPA 路由刷新 404       | 部署时需配置 SPA fallback（`wrangler.toml` 已配置） |

### 新增工具注意事项

- 所有用户可见字符串必须通过 `$t()` 使用 i18n，**禁止硬编码**
- 工具页面路径必须与 `tools.ts` 中的 `path` 一致
- 图片/字体资源放在 `public/` 目录，构建后可直接通过 `/` 引用
- 工具组件可以使用 `inject('showToast')` 调用全局 Toast 提示

### Worker 调试

```bash
# 本地启动 Worker
pnpm worker:dev

# 查看日志
# wrangler.toml 已启用 observability
```

### 部署检查清单

- [ ] `pnpm build` 构建成功
- [ ] 所有 i18n key 已添加
- [ ] `tools.ts` 中日期正确
- [ ] `sitemap.xml` 自动生成验证
- [ ] 响应式布局验证（桌面 + 移动端）

---

> **文档生成日期**：2026-07-11
> **项目版本**：2.2.0
