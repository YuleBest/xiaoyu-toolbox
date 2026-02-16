<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChevronDown, Search, ArrowLeft } from "lucide-vue-next";
import { mainNav, categories } from "@/config/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigationStore } from "@/stores/navigation";

import ModeToggle from "@/components/ModeToggle.vue";

const route = useRoute();
const router = useRouter();

const showBackButton = computed(() => {
  return (
    route.path !== "/" && route.path.split("/").filter(Boolean).length >= 1
  );
});

defineProps<{
  userEmail?: string;
  userName?: string;
}>();
</script>

<template>
  <aside
    class="hidden md:flex w-72 flex-col border-r bg-sidebar fixed h-screen overflow-hidden px-4 py-6"
  >
    <!-- Profile / Header -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <button
          class="w-full flex items-center justify-between px-2 mb-6 hover:opacity-80 transition-all outline-none group text-left cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-muted-foreground/10"
            >
              <img src="/logo.svg" class="h-5 w-5" alt="Logo" />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-[13px] font-semibold truncate leading-tight"
                >小于工具箱</span
              >
            </div>
          </div>
          <ChevronDown
            class="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        class="w-64 p-1.5 rounded-xl border-muted/50 backdrop-blur-lg"
      >
        <div
          class="px-2 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
        >
          探索与支持
        </div>
        <a
          href="https://github.com/YuleBest/xiaoyu-toolbox-next"
          target="_blank"
        >
          <DropdownMenuItem
            class="rounded-lg cursor-pointer py-2 px-3 font-medium focus:bg-blue-500 focus:text-white transition-colors"
          >
            GitHub 仓库
          </DropdownMenuItem>
        </a>
        <a href="mailto:yule-best@outlook.com">
          <DropdownMenuItem
            class="rounded-lg cursor-pointer py-2 px-3 font-medium focus:bg-blue-500 focus:text-white transition-colors"
          >
            联系作者
          </DropdownMenuItem>
        </a>
        <RouterLink to="/about">
          <DropdownMenuItem
            class="rounded-lg cursor-pointer py-2 px-3 font-medium focus:bg-blue-500 focus:text-white transition-colors"
          >
            关于本站
          </DropdownMenuItem>
        </RouterLink>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Back Button -->
    <button
      v-if="showBackButton"
      @click="router.back()"
      class="flex items-center gap-2.5 px-3 py-1.5 mb-4 mx-1 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all active:scale-[0.98] group"
    >
      <ArrowLeft
        class="h-4 w-4 text-blue-500 group-hover:-translate-x-0.5 transition-transform"
      />
      返回
    </button>

    <!-- Search -->
    <div class="relative mb-6 group px-1">
      <Search
        class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-blue-500 transition-colors"
      />
      <input
        type="text"
        placeholder="搜索"
        class="w-full bg-muted/40 rounded-lg pl-10 pr-4 py-1.5 text-sm outline-none transition-all placeholder:text-muted-foreground/50 border border-transparent focus:bg-background focus:border-muted-foreground/10 cursor-pointer"
        readonly
        @click="$router.push('/search')"
      />
    </div>

    <!-- Main Nav Items -->
    <nav class="space-y-0.5 mb-8">
      <RouterLink
        v-for="item in mainNav"
        :key="item.name"
        :to="item.href"
        class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13.5px] font-medium transition-all duration-200 group"
        :class="[
          route.path === item.href
            ? 'bg-muted/80 text-foreground'
            : 'text-foreground/80 hover:bg-muted/30 hover:text-foreground',
        ]"
      >
        <div
          class="flex items-center justify-center transition-all duration-200"
          :class="[
            route.path === item.href
              ? 'text-blue-500'
              : 'text-blue-500 group-hover:scale-105',
          ]"
        >
          <component :is="item.icon" class="h-4 w-4 stroke-[2.5px]" />
        </div>
        {{ item.name }}
      </RouterLink>
    </nav>

    <!-- Categories Section -->
    <div class="px-1 flex-1 flex flex-col min-h-0">
      <h3
        class="px-3 text-[11px] font-medium text-muted-foreground/40 uppercase tracking-widest mb-3"
      >
        类别
      </h3>
      <div class="space-y-0.5 overflow-hidden">
        <button
          v-for="cat in categories"
          :key="cat.name"
          class="w-full flex items-center gap-3.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group active:scale-[0.98] cursor-pointer"
          :class="[
            route.path === '/categories' &&
            navigationStore.activeCategoryId === cat.id
              ? 'bg-muted/80 text-foreground'
              : 'text-foreground/80 hover:bg-muted/30 hover:text-foreground',
          ]"
          @click="$router.push(`/categories#${cat.id}`)"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <component
              :is="cat.icon"
              class="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105"
              :class="cat.color"
            />
          </div>
          <span class="flex-1 text-left line-clamp-1">{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Theme Switcher -->
    <div class="px-2 pt-4 border-t border-muted-foreground/5 mt-auto">
      <div
        class="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20"
      >
        <span class="text-[12px] font-medium text-muted-foreground"
          >显示模式</span
        >
        <ModeToggle />
      </div>
    </div>
  </aside>
</template>
