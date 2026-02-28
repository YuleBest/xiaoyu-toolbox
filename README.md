<div align="center">

# <img src="./public/favicon.svg" width="25"> 小于工具箱

一个纯净、开源、无广告的在线工具集

<img src="https://img.shields.io/github/stars/YuleBest/xiaoyu-toolbox?style=for-the-badge&color=4183c4" alt="Stars"> <img src="https://img.shields.io/github/commit-activity/m/YuleBest/xiaoyu-toolbox?style=for-the-badge&color=f05032" alt="Commits"> <img src="https://img.shields.io/github/languages/top/YuleBest/xiaoyu-toolbox?style=for-the-badge&color=yellow" alt="Top Language">

[![在线使用](https://img.shields.io/badge/在线使用-tool.yule.ink-blue?style=for-the-badge)](https://tool.yule.ink)

</div>

## 特性

- **现代化 UI 设计**：基于 Vuetify 3 构建，采用 Material Design 风格，界面简洁美观。
- **响应式布局**：适配桌面端和移动端，随时随地高效使用。
- **无广告**：纯净的使用体验，无任何干扰广告。
- **保护隐私**：大部分工具纯前端运行，数据不上传服务器。

## 开始使用

你可以 [在线使用](https://tool.yule.ink) 或自行部署

## 工具列表

- 开发工具
  - [Base64 转换](https://tool.yule.ink/base64)
  - [JSON-YAML 转换](https://tool.yule.ink/json-yaml)
  - [JS 演练场](https://tool.yule.ink/playground)
  - [翻译 (Builtin AI)](https://tool.yule.ink/translator-ai)
  - [代码图片生成](https://tool.yule.ink/codeimg)

- 图像工具
  - [二维码工具](https://tool.yule.ink/qrcode)
  - [图片 EXIF 查看](https://tool.yule.ink/exif)

- 多媒体工具
  - [抖音视频解析](https://tool.yule.ink/dydown)
  - [B站视频解析](https://tool.yule.ink/bilidown)
  - [BV/AV 号互转](https://tool.yule.ink/bvav)
  - [歌词获取](https://tool.yule.ink/lyric)

- 生活查询
  - [好好说话](https://tool.yule.ink/hhsh)
  - [机查查](https://tool.yule.ink/jichacha)
  - [天气查询](https://tool.yule.ink/weather)
  - [汇率查询](https://tool.yule.ink/exchange)
  - [长度单位换算](https://tool.yule.ink/length)
  - [归属地查询](https://tool.yule.ink/phone-number)
  - [微博热搜](https://tool.yule.ink/weibo-hot)
  - [月经周期](https://tool.yule.ink/period)

- 游戏工具
  - [王者荣耀查询](https://tool.yule.ink/hok)
  - [反应力测试](https://tool.yule.ink/reaction)
  - [MC PE 下载](https://tool.yule.ink/mcpe)

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

以下项目为本项目提供了数据或灵感支持：

- [MobileModels](https://github.com/KHwang9883/MobileModels), [@KHwang9883](https://github.com/KHwang9883), CC BY-NC-SA 4.0 license.

- [mcapks.net](https://mcapks.net)

- [能不能好好说话](https://github.com/itorr/nbnhhsh), [@itorr](https://github.com/itorr), Apache-2.0 license.

- [php-mobile-locator](https://github.com/zxc7563598/php-mobile-locator), [@zxc7563598](https://github.com/zxc7563598), MIT license.

- [weibo-trending-hot-search](https://github.com/justjavac/weibo-trending-hot-search), [@justjavac](https://github.com/justjavac), MIT license.

## 关联仓库

以下仓库与本项目有部分关联，但由于规模、方便管理等原因需分仓库：

- [GetHOK](https://github.com/YuleBest/GetHOK): 自动化爬取王者荣耀英雄、装备、召唤师技能

- [MobileModels-JSON](https://github.com/YuleBest/MobileModels-JSON): 将 [MobileModels](https://github.com/KHwang9883/MobileModels) 中的数据转为 JSON

## 相关技术分享

- [B站BV/AV号互转算法原理](./DEV-DOCS/B站BV-AV号互转算法原理.md)
