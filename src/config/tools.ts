import type { Component } from "vue";
import {
  Code2,
  FileType,
  Play,
  QrCode,
  Camera,
  Video,
  Music,
  CloudSun,
  Swords,
  Zap,
} from "lucide-vue-next";

export interface Tool {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  usage: string;
  icon: Component;
  color: string;
  path: string;
  date: string;
  isHot?: boolean;
  isTop?: boolean;
  backEnd?: string;
}

export const toolsData: Record<string, Tool[]> = {
  开发工具: [
    {
      id: "base64",
      title: "Base64 转换",
      subtitle: "文本与 Base64 互转",
      description:
        "文本与 Base64 编码的相互转换，支持 UTF-8 中文与特殊字符，防止乱码。",
      author: "Yule",
      usage:
        "1. 编码：在左侧输入原文，右侧自动显示 Base64 编码结果。\n2. 解码：在右侧输入 Base64 字符串，左侧自动显示解码后的原文。\n3. 点击复制按钮可快速复制内容。",
      icon: Code2,
      color: "text-blue-500",
      path: "/base64",
      date: "2026-01-01",
      isTop: true,
    },
    {
      id: "json-yaml",
      title: "JSON-YAML 转换",
      subtitle: "配置文件格式互转",
      description:
        "方便快捷的 JSON 与 YAML 格式互转工具，支持实时校验 and 格式化。",
      author: "Yule",
      usage:
        "1. 粘贴 JSON 或 YAML 内容。\n2. 点击转换按钮即可进行格式转换。\n3. 支持一键复制和清空。",
      icon: FileType,
      color: "text-indigo-500",
      path: "/json-yaml",
      date: "2026-01-02",
    },
    {
      id: "playground",
      title: "TypeScript 演练场",
      subtitle: "浏览器内的 JS / TS 沙盒",
      description:
        "基于 Sandpack 和 Monaco Editor 的在线代码演练场，支持实时预览 JavaScript/TypeScript 代码运行效果。",
      author: "Yule",
      usage:
        "1. 编写代码：在左侧编辑器中编写 JS/TS 代码。\n2. 点击运行：日志栏将运行您的代码，并展示输出。\n3. 切换模板：支持 JS/TS 运行环境切换。",
      icon: Play,
      color: "text-blue-600",
      path: "/playground",
      date: "2026-01-27",
      isHot: true,
    },
  ],
  图像工具: [
    {
      id: "qrcode",
      title: "二维码工具",
      subtitle: "生成与识别二维码",
      description:
        "快速生成自定义二维码，或识别图片中的二维码内容。支持下载生成的二维码图片。",
      author: "Yule",
      usage:
        "1. 生成：在“生成”标签页输入文本，即可实时预览二维码。\n2. 识别：在“识别”标签页上传或拖拽二维码图片，即可获取解析内容。",
      icon: QrCode,
      color: "text-slate-700 dark:text-slate-300",
      path: "/qrcode",
      date: "2026-01-03",
    },
    {
      id: "exif",
      title: "图片 EXIF 查看",
      subtitle: "查看图片元数据",
      description:
        "读取和显示图片的 EXIF 元数据，包括相机信息、拍摄参数、GPS 位置等。",
      author: "Yule",
      usage:
        "1. 上传图片：点击“选择一张图片”按钮，选择本地图片文件。\n2. 查看信息：上传后自动解析 EXIF 数据，并在下方表格中显示。\n3. 预览：会显示图片预览，方便核对。",
      icon: Camera,
      color: "text-rose-500",
      path: "/exif",
      date: "2026-01-26",
    },
  ],
  多媒体工具: [
    {
      id: "dydown",
      title: "抖音视频解析",
      subtitle: "无水印视频下载",
      description: "解析抖音分享链接，获取无水印视频直链和作者信息。",
      author: "Yule",
      usage:
        "1. 在抖音APP中复制分享链接。\n2. 粘贴到输入框中，点击“解析”。\n3. 获取下载链接或直接下载视频。",
      icon: Video,
      color: "text-pink-500",
      path: "/dydown",
      backEnd:
        "https://github.com/YuleBest/xiaoyu-toolbox/blob/main/src/back-end/cf-workers/dydown.js",
      date: "2026-01-25",
      isHot: true,
    },
    {
      id: "bilidown",
      title: "B站视频解析",
      subtitle: "音视频流合并与下载",
      description:
        "解析 Bilibili 视频链接，获取音视频直链。内置 FFmpeg WASM 引擎，支持在浏览器中一键合并视频和音频。填写 Cookie 可开启 1080P+ 高清解析。",
      author: "Yule",
      usage:
        "1. 复制 B 站视频链接（BV号）。\n2. 粘贴到输入框后点击“立即解析”。\n3. 若需高清画质，请在高级设置中填写完整 Cookie。\n4. 点击“一键合并”即可在浏览器内自动合并并下载 mp4 文件。",
      icon: Video,
      color: "text-sky-400",
      path: "/bilidown",
      backEnd:
        "https://github.com/YuleBest/xiaoyu-toolbox/blob/main/src/back-end/cf-workers/bilidown.js",
      date: "2026-01-27",
      isHot: true,
      isTop: true,
    },
    {
      id: "lyric",
      title: "歌词获取",
      subtitle: "搜索并下载歌词",
      description:
        "搜索歌曲并获取标准 LRC 格式歌词，支持下载和复制。基于酷狗音乐数据源，提供海量歌词资源。",
      author: "Yule",
      usage:
        "1. 输入歌名或歌手名进行搜索。\n2. 从搜索结果中选择目标歌曲。\n3. 查看歌词内容，支持下载 LRC 文件或复制歌词文本。",
      icon: Music,
      color: "text-orange-500",
      path: "/lyric",
      backEnd:
        "https://github.com/YuleBest/xiaoyu-toolbox/blob/main/src/back-end/cf-workers/getlyric.js",
      date: "2026-02-13",
    },
  ],
  生活查询: [
    {
      id: "weather",
      title: "天气查询",
      subtitle: "全国天气实时查询",
      description:
        "基于 Open-Meteo 的全球天气查询工具，支持查看实时天气、每小时预报及未来天气趋势。",
      author: "Yule",
      usage:
        "1. 输入城市名称（支持中文拼音或英文）进行搜索。\n2. 选择正确的城市。\n3. 查看详细的天气信息。\n\nTip: 由于使用非本土化接口，搜索不到国内城市时，可尝试使用拼音。例如：beijing 代替北京",
      icon: CloudSun,
      color: "text-amber-400",
      path: "/weather",
      backEnd: "https://open-meteo.com/",
      date: "2026-01-20",
    },
  ],
  游戏工具: [
    {
      id: "hok",
      title: "王者荣耀战斗查询",
      subtitle: "英雄装备技能查询",
      description:
        "王者荣耀游戏数据查询工具，支持查询英雄信息、装备属性和召唤师技能详情。包含完整的英雄皮肤列表、装备效果说明和技能冷却时间等详细信息。",
      author: "Yule",
      usage:
        "1. 选择查询类别：英雄、装备或召唤师技能。\n2. 使用搜索框输入关键词快速查找。\n3. 英雄查询支持按职业筛选（战士、法师、坦克等）。\n4. 装备查询支持按类型筛选（攻击、法术、防御等）。\n5. 点击英雄卡片可查看详细信息和皮肤列表。",
      icon: Swords,
      color: "text-violet-500",
      path: "/hok",
      backEnd: "https://github.com/YuleBest/GetHOK",
      date: "2026-01-28",
      isHot: true,
    },
    {
      id: "reaction",
      title: "反应力测试",
      subtitle: "毫秒级反应速度测试",
      description:
        "测试你的视觉反应速度。当屏幕颜色变绿时，尽可能快地点击屏幕或按下空格键。注意：本测试仅供娱乐，鼠标或键盘设备可能会引入额外的输入延迟。",
      author: "Yule",
      usage:
        "1. 点击屏幕任意区域或按下空格键开始测试。\n2. 等待屏幕变红，保持专注。\n3. 屏幕变绿时立即点击或按空格！\n4. 查看你的毫秒级反应数据。",
      icon: Zap,
      color: "text-yellow-500",
      path: "/reaction",
      date: "2026-01-28",
    },
  ],
};

export const allTools = Object.values(toolsData).flat();
