<div align="center">

# <img src="./public/favicon.svg" width="25" /> 小于工具箱

一个纯净、开源、无广告的在线工具集

<img src="https://img.shields.io/github/stars/YuleBest/xiaoyu-toolbox?style=for-the-badge&color=4183c4" alt="Stars" /> <img src="https://img.shields.io/github/commit-activity/m/YuleBest/xiaoyu-toolbox?style=for-the-badge&color=f05032" alt="Commits" /> <img src="https://img.shields.io/github/languages/top/YuleBest/xiaoyu-toolbox?style=for-the-badge&color=yellow" alt="Top Language" /> <img src="https://img.shields.io/github/repo-size/YuleBest/xiaoyu-toolbox?style=for-the-badge" alt="Repo Size" />

[![在线使用](https://img.shields.io/badge/在线使用-tool.yule.ink-blue?style=for-the-badge)](https://tool.yule.ink)

</div>

## 特性

- **现代化 UI 设计**：基于 Shadcn UI 构建，界面简洁美观。
- **响应式布局**：适配桌面端和移动端，随时随地高效使用。
- **无广告**：纯净的使用体验，无干扰广告。
- **保护隐私**：大部分工具纯前端运行，数据不上传服务器。

## 开始使用

你可以 [在线使用](https://tool.yule.ink) 或自行部署

## 工具列表

### 开发工具

| 标题                                                     | 副标题                         | 简介                                                                                                                 |
| -------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| [Base64 转换](https://tool.yule.ink/base64)              | 文本与 Base64 互转             | 文本与 Base64 编码的相互转换，支持 UTF-8 中文与特殊字符，防止乱码。                                                  |
| [JSON-YAML 转换](https://tool.yule.ink/json-yaml)        | 配置文件格式互转               | 方便快捷的 JSON 与 YAML 格式互转工具，支持实时校验和格式化。                                                         |
| [JS 演练场](https://tool.yule.ink/playground)            | 浏览器内的 JS / TS 沙盒        | 基于 Sandpack 和 Monaco Editor 的在线代码演练场，支持实时预览 JavaScript/TypeScript 代码运行效果。                   |
| [翻译 (Builtin AI)](https://tool.yule.ink/translator-ai) | 基于 Chrome 内置 AI 的翻译工具 | [仅限 Chrome 131+ 版本] 利用 Chrome 浏览器内置的 Translator API 进行本地翻译。无需联网上传文本，保护隐私且响应迅速。 |
| [代码图片生成](https://tool.yule.ink/codeimg)            | 将代码转换为精美的图片         | 生成类似 Carbon 的精美代码截图，支持多种语言高亮、主题切换、自定义背景和窗口样式。                                   |

### 多媒体工具

| 标题                                                 | 副标题                         | 简介                                                                                                                                  |
| ---------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| [二维码工具](https://tool.yule.ink/qrcode)           | 生成与识别二维码，支持多种样式 | 快速生成自定义二维码，或识别图片中的二维码内容。支持下载生成的二维码图片。                                                            |
| [图片 EXIF 查看](https://tool.yule.ink/exif)         | 查看图片元数据                 | 读取和显示图片的 EXIF 元数据，包括相机信息、拍摄参数、GPS 位置等。                                                                    |
| [抖音视频解析](https://tool.yule.ink/dydown)         | 无水印视频下载                 | 解析抖音分享链接，获取无水印视频直链和作者信息。                                                                                      |
| [B站视频解析](https://tool.yule.ink/bilidown)        | 音视频流合并与下载             | 解析 Bilibili 视频链接，获取音视频直链。内置 FFmpeg WASM 引擎，支持在浏览器中一键合并视频和音频。填写 Cookie 可开启 1080P+ 高清解析。 |
| [BV/AV 号互转](https://tool.yule.ink/bvav)           | 哔哩哔哩 BV 号与 AV 号互转     | 将哔哩哔哩视频的 BV 号转换为 AV 号，或将 AV 号转换为 BV 号。纯前端运算，无需网络请求。                                                |
| [歌词获取](https://tool.yule.ink/lyric)              | 搜索并下载歌词                 | 搜索歌曲并获取标准 LRC 格式歌词，支持下载和复制。基于酷狗音乐数据源，提供海量歌词资源。                                               |
| [网易云歌单](https://tool.yule.ink/ncm-get-playlist) | 网易云音乐歌单歌曲列表解析     | 输入网易云音乐歌单链接或 ID，获取歌单内的所有歌曲名称和歌手信息。突破默认接口限制提取全量数据。                                       |
| [以图搜番](https://tool.yule.ink/anime-search)       | 基于图片搜索动画出处           | 上传动画截图，通过 trace.moe API 快速寻找对应动画名称、集数及精确时间点。                                                             |

### 生活查询

| 标题                                                   | 副标题                  | 简介                                                                                                                                                         |
| ------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [好好说话](https://tool.yule.ink/hhsh)                 | 拼音首字母缩写释义      | 查询网络常见拼音首字母缩写的含义，例如 awsl、xswl 等。支持提交新词条。                                                                                       |
| [机查查](https://tool.yule.ink/jichacha)               | 查找手机机型数据        | 查询手机机型的详细参数、代号、市场名称等信息。                                                                                                               |
| [天气查询](https://tool.yule.ink/weather)              | 全国天气实时查询        | 基于和风天气的全球天气查询工具，支持查看实时天气、每小时预报及未来天气趋势。                                                                                 |
| [汇率查询](https://tool.yule.ink/exchange)             | 实时汇率转换与历史趋势  | 基于 Frankfurter API 的实时汇率查询工具，支持全球主要货币之间的转换查询，以及历史汇率查看。                                                                  |
| [长度单位换算](https://tool.yule.ink/length)           | 常用长度单位双向换算    | 支持常见的公制、英制、市制等多种长度单位的双向实时换算转换。                                                                                                 |
| [归属地查询](https://tool.yule.ink/phone-number)       | 手机号码归属地查询      | 查询手机号码的归属地信息，包括所属省份、城市和运营商。纯离线数据库，无需网络请求。数据库来自 https://github.com/zxc7563598/php-mobile-locator, MIT License。 |
| [微博热搜](https://tool.yule.ink/weibo-hot)            | 获取历史和实时热搜      | 获取指定日期的微博热搜榜单数据，支持按条数筛选和查看原链接。                                                                                                 |
| [月经周期](https://tool.yule.ink/period)               | 生理期计算器            | 计算月经周期各项指标：月经期、卵泡期、排卵日、排卵期、易孕期和黄体期。仅基于 28 天标准周期计算。                                                             |
| [时间距离](https://tool.yule.ink/time-distance)        | 两日期间隔计算          | 计算两个选定日期的相距时间，最细支持到秒。                                                                                                                   |
| [法定节假日](https://tool.yule.ink/statutory-holidays) | 2026 中国法定节假日查询 | 查看 2026 年中国法定节假日及调休安排。                                                                                                                       |
| [中国古诗词](https://tool.yule.ink/poetry)             | 海量古诗词查询          | 快速搜索海量中国古诗词。                                                                                                                                     |

### 游戏工具

| 标题                                             | 副标题                 | 简介                                                                                                                                   |
| ------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [王者荣耀查询](https://tool.yule.ink/hok)        | 英雄装备技能查询       | 王者荣耀游戏数据查询工具，支持查询英雄信息、装备属性和召唤师技能详情。包含完整的英雄皮肤列表、装备效果说明和技能冷却时间等详细信息。   |
| [王者语音鉴赏](https://tool.yule.ink/hok-voices) | 英雄台词在线试听       | 收录王者荣耀各英雄皮肤的大厅、移动、技能、互动等全部语音台词，支持在线播放，按英雄和皮肤筛选。                                         |
| [反应力测试](https://tool.yule.ink/reaction)     | 毫秒级反应速度测试     | 测试你的视觉反应速度。当屏幕颜色变绿时，尽可能快地点击屏幕或按下空格键。注意：本测试仅供娱乐，鼠标或键盘设备可能会引入额外的输入延迟。 |
| [MC PE 下载](https://tool.yule.ink/mcpe)         | Minecrat PE 全版本下载 | 浏览和下载 Minecraft PE 版全版本                                                                                                       |

### 部署指南

```bash
git clone https://github.com/YuleBest/xiaoyu-toolbox.git
cd xiaoyu-toolbox
pnpm install
pnpm run build  # 构建项目
pnpm run dev    # 开发模式
```

## 贡献

欢迎提交 Issue 或 Pull Request 来改进这个项目！

## 感谢

以下项目为本项目提供了数据源或灵感支持：

| 项目                                                                                | 作者                                                 | 开源许可证      |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------- |
| [MobileModels](https://github.com/KHwang9883/MobileModels)                          | [@KHwang9883](https://github.com/KHwang9883)         | CC BY-NC-SA 4.0 |
| [mcapks.net](https://mcapks.net)                                                    |                                                      |                 |
| [能不能好好说话](https://github.com/itorr/nbnhhsh)                                  | [@itorr](https://github.com/itorr)                   | Apache 2.0      |
| [php-mobile-locator](https://github.com/zxc7563598/php-mobile-locator)              | [@zxc7563598](https://github.com/zxc7563598)         | MIT             |
| [weibo-trending-hot-search](https://github.com/justjavac/weibo-trending-hot-search) | [@justjavac](https://github.com/justjavac)           | MIT             |
| [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)           | [@Binaryify](https://github.com/Binaryify)           |                 |
| [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)                  | [@chinese-poetry](https://github.com/chinese-poetry) | MIT             |

## 关联仓库

以下仓库与本项目有部分关联，但由于规模、方便管理等原因需分仓库：

- [chinese-poetry-pinyin](https://github.com/YuleBest/chinese-poetry-pinyin): 对 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) 项目进行拼音首字母分割，并删除了注释、备注等信息

## 相关技术分享

- [B站BV/AV号互转算法原理](./docs/B站BV-AV号互转算法原理.md)
