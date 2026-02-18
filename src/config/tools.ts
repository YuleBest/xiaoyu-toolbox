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
  Smartphone,
} from "lucide-vue-next";

export interface Tool {
  id: string;
  title: string; // i18n key, e.g. 'tools.base64.title'
  subtitle: string; // i18n key
  description: string; // i18n key
  author: string;
  usage: string; // i18n key
  icon: Component;
  color: string;
  path: string;
  date: string;
  isHot?: boolean;
  isTop?: boolean;
  backEnd?: string;
}

export const toolsData: Record<string, Tool[]> = {
  dev: [
    {
      id: "base64",
      title: "tools.base64.title",
      subtitle: "tools.base64.subtitle",
      description: "tools.base64.description",
      author: "Yule",
      usage: "tools.base64.usage",
      icon: Code2,
      color: "text-blue-500",
      path: "/base64",
      date: "2026-01-01",
    },
    {
      id: "json-yaml",
      title: "tools.json-yaml.title",
      subtitle: "tools.json-yaml.subtitle",
      description: "tools.json-yaml.description",
      author: "Yule",
      usage: "tools.json-yaml.usage",
      icon: FileType,
      color: "text-indigo-500",
      path: "/json-yaml",
      date: "2026-01-02",
    },
    {
      id: "playground",
      title: "tools.playground.title",
      subtitle: "tools.playground.subtitle",
      description: "tools.playground.description",
      author: "Yule",
      usage: "tools.playground.usage",
      icon: Play,
      color: "text-blue-600",
      path: "/playground",
      date: "2026-01-27",
    },
  ],
  image: [
    {
      id: "qrcode",
      title: "tools.qrcode.title",
      subtitle: "tools.qrcode.subtitle",
      description: "tools.qrcode.description",
      author: "Yule",
      usage: "tools.qrcode.usage",
      icon: QrCode,
      color: "text-slate-700 dark:text-slate-300",
      path: "/qrcode",
      date: "2026-01-03",
    },
    {
      id: "exif",
      title: "tools.exif.title",
      subtitle: "tools.exif.subtitle",
      description: "tools.exif.description",
      author: "Yule",
      usage: "tools.exif.usage",
      icon: Camera,
      color: "text-rose-500",
      path: "/exif",
      date: "2026-01-26",
    },
  ],
  media: [
    {
      id: "dydown",
      title: "tools.dydown.title",
      subtitle: "tools.dydown.subtitle",
      description: "tools.dydown.description",
      author: "Yule",
      usage: "tools.dydown.usage",
      icon: Video,
      color: "text-pink-500",
      path: "/dydown",
      backEnd:
        "https://github.com/YuleBest/xiaoyu-toolbox/blob/main/src/back-end/cf-workers/dydown.js",
      date: "2026-01-25",
      isTop: true,
    },
    {
      id: "bilidown",
      title: "tools.bilidown.title",
      subtitle: "tools.bilidown.subtitle",
      description: "tools.bilidown.description",
      author: "Yule",
      usage: "tools.bilidown.usage",
      icon: Video,
      color: "text-sky-400",
      path: "/bilidown",
      backEnd:
        "https://github.com/YuleBest/xiaoyu-toolbox/blob/main/src/back-end/cf-workers/bilidown.js",
      date: "2026-01-27",
      isHot: true,
    },
    {
      id: "lyric",
      title: "tools.lyric.title",
      subtitle: "tools.lyric.subtitle",
      description: "tools.lyric.description",
      author: "Yule",
      usage: "tools.lyric.usage",
      icon: Music,
      color: "text-orange-500",
      path: "/lyric",
      backEnd:
        "https://github.com/YuleBest/xiaoyu-toolbox/blob/main/src/back-end/cf-workers/getlyric.js",
      date: "2026-02-13",
      isHot: true,
    },
  ],
  life: [
    {
      id: "jichacha",
      title: "tools.jichacha.title",
      subtitle: "tools.jichacha.subtitle",
      description: "tools.jichacha.description",
      author: "Yule",
      usage: "tools.jichacha.usage",
      icon: Smartphone,
      color: "text-emerald-500",
      path: "/jichacha",
      backEnd: "/api/jichacha",
      date: "2026-02-19",
      isHot: true,
    },
    {
      id: "weather",
      title: "tools.weather.title",
      subtitle: "tools.weather.subtitle",
      description: "tools.weather.description",
      author: "Yule",
      usage: "tools.weather.usage",
      icon: CloudSun,
      color: "text-amber-400",
      path: "/weather",
      backEnd: "https://open-meteo.com/",
      date: "2026-01-20",
    },
  ],
  game: [
    {
      id: "hok",
      title: "tools.hok.title",
      subtitle: "tools.hok.subtitle",
      description: "tools.hok.description",
      author: "Yule",
      usage: "tools.hok.usage",
      icon: Swords,
      color: "text-violet-500",
      path: "/hok",
      backEnd: "https://github.com/YuleBest/GetHOK",
      date: "2026-01-28",
      isHot: true,
      isTop: true,
    },
    {
      id: "reaction",
      title: "tools.reaction.title",
      subtitle: "tools.reaction.subtitle",
      description: "tools.reaction.description",
      author: "Yule",
      usage: "tools.reaction.usage",
      icon: Zap,
      color: "text-yellow-500",
      path: "/reaction",
      date: "2026-01-28",
    },
  ],
};

export const allTools = Object.values(toolsData).flat();
