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
  name: string; // i18n key, e.g. 'nav.home'
  icon: Component;
  href: string;
  active?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string; // i18n key, e.g. 'categories.dev'
  icon: Component;
  color: string;
}

export const mainNav: NavItem[] = [
  { name: "nav.home", icon: CalendarDays, href: "/", active: true },
  {
    name: "nav.allTools",
    icon: LayoutGrid,
    href: "/categories",
    active: false,
  },
  { name: "nav.about", icon: Activity, href: "/about", active: false },
];

export const categories: CategoryItem[] = [
  {
    id: "dev",
    name: "categories.dev",
    icon: SquareTerminal,
    color: "text-blue-400",
  },
  {
    id: "image",
    name: "categories.image",
    icon: Camera,
    color: "text-blue-400",
  },
  { id: "media", name: "categories.media", icon: Tv, color: "text-blue-400" },
  {
    id: "life",
    name: "categories.life",
    icon: CloudSun,
    color: "text-blue-400",
  },
  { id: "game", name: "categories.game", icon: Swords, color: "text-blue-400" },
];
