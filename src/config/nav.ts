import {
  CalendarDays,
  SquareTerminal,
  Tv,
  LayoutGrid,
  Camera,
  Activity,
  Swords,
  CloudSun,
} from "lucide-vue-next";
import type { Component } from "vue";

export interface NavItem {
  name: string;
  icon: Component;
  href: string;
  active?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: Component;
  color: string;
}

export const mainNav: NavItem[] = [
  { name: "首页", icon: CalendarDays, href: "/", active: true },
  { name: "全部工具", icon: LayoutGrid, href: "/categories", active: false },
  { name: "关于本站", icon: Activity, href: "/about", active: false },
];

export const categories: CategoryItem[] = [
  { id: "dev", name: "开发工具", icon: SquareTerminal, color: "text-blue-400" },
  { id: "image", name: "图像工具", icon: Camera, color: "text-blue-400" },
  { id: "media", name: "多媒体工具", icon: Tv, color: "text-blue-400" },
  { id: "life", name: "生活查询", icon: CloudSun, color: "text-blue-400" },
  { id: "game", name: "游戏工具", icon: Swords, color: "text-blue-400" },
];
