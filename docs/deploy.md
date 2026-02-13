# 部署教程

## 本地部署

1. Clone 本项目的源代码到您的本地

```bash
git clone https://github.com/yule-ink/xiaoyu-toolbox.git
```

2. 安装依赖

```bash
cd xiaoyu-toolbox
npm install
```

3. 运行项目

```bash
npm run dev
```

4. 访问项目

---

## 使用 Cloudflare Pages 部署

1. Fork 本项目到您的 GitHub 账号

2. 登录 Cloudflare 账号

3. 创建一个新的 Pages 项目

4. 选择 Fork 的项目

5. 配置构建设置:

- 构建命令: `pnpm run build`
- 构建产物: `dist`

---

**注意**：此时，您使用的 API 接口还是我的，如果您想部署自己的 API 接口，则需要注册登录 Cloudflare 账号，并创建一个几个 Worker，源代码使用 [src/back-end/cf-workers/](src/back-end/cf-workers/) 目录下的代码，并将使用了 API 接口的页面中的 API 地址替换成你自己的。
