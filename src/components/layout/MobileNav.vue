<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { User, Search, ChevronRight, ArrowLeft } from "lucide-vue-next";
import { mainNav, categories } from "@/config/nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navigationStore } from "@/stores/navigation";
import ModeToggle from "@/components/ModeToggle.vue";

const isMobileMenuOpen = ref(false);
const route = useRoute();
const router = useRouter();

const showBackButton = computed(() => {
  return (
    route.path !== "/" && route.path.split("/").filter(Boolean).length >= 1
  );
});

// 路由改变自动关闭
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  },
);
</script>

<template>
  <header
    class="md:hidden fixed top-0 w-full z-50 border-b overflow-hidden mobile-nav-transition"
    :style="{
      height: isMobileMenuOpen ? '100dvh' : '64px',
      backgroundColor: isMobileMenuOpen
        ? 'var(--card)'
        : 'color-mix(in srgb, var(--card), transparent 20%)',
      backdropFilter: isMobileMenuOpen ? 'blur(0px)' : 'blur(24px)',
      transform: 'translateZ(0)',
    }"
  >
    <div
      class="h-16 px-5 flex items-center justify-between relative z-10 shrink-0"
    >
      <div class="flex items-center gap-1">
        <button
          class="w-10 h-10 flex items-center justify-start active:scale-95 transition-all outline-none"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <div class="relative w-6 h-6">
            <div
              class="absolute top-1/2 left-0 w-6 h-0.5 bg-foreground rounded-full transition-all duration-500"
              :class="[
                isMobileMenuOpen ? 'rotate-45 bg-blue-500' : '-translate-y-1',
              ]"
            ></div>
            <div
              class="absolute top-1/2 left-0 w-6 h-0.5 bg-foreground rounded-full transition-all duration-500"
              :class="[
                isMobileMenuOpen
                  ? '-rotate-45 bg-blue-500'
                  : 'translate-y-1 w-4',
              ]"
            ></div>
          </div>
        </button>

        <!-- Back Button -->
        <button
          v-if="showBackButton && !isMobileMenuOpen"
          @click="router.back()"
          class="flex items-center gap-1 px-2 py-1 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground active:scale-95 transition-all group"
        >
          <ArrowLeft
            class="h-4 w-4 text-blue-500 group-hover:-translate-x-0.5 transition-transform"
          />
          返回
        </button>
      </div>

      <div
        class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none"
      >
        <img src="/logo.svg" class="h-5 w-5" alt="Logo" />
        <span class="font-semibold text-[16px] tracking-tight">小于工具箱</span>
        <span
          class="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium"
          >NEXT</span
        >
      </div>

      <div class="flex items-center gap-2">
        <ModeToggle
          :class="[
            isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100',
          ]"
          class="transition-opacity duration-300"
        />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <div
              class="h-10 w-10 bg-muted/30 rounded-full flex items-center justify-center border border-muted-foreground/10 cursor-pointer active:scale-95 transition-all"
            >
              <User class="h-5 w-5 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            class="w-56 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg z-60"
          >
            <div
              class="px-2 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60"
            >
              探索与支持
            </div>
            <a href=" " target="_blank" rel="noopener noreferrer">
              <DropdownMenuItem
                class="rounded-lg py-2.5 px-3 font-medium focus:bg-blue-500 focus:text-white"
                >GitHub 仓库</DropdownMenuItem
              >
            </a>
            <a href="mailto:yule-best@outlook.com">
              <DropdownMenuItem
                class="rounded-lg py-2.5 px-3 font-medium focus:bg-blue-500 focus:text-white"
                >联系作者</DropdownMenuItem
              >
            </a>
            <RouterLink to="/about">
              <DropdownMenuItem
                class="rounded-lg py-2.5 px-3 font-medium focus:bg-blue-500 focus:text-white"
                >关于本站</DropdownMenuItem
              >
            </RouterLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div
      class="transition-all duration-500 ease-in-out px-6"
      :class="[
        isMobileMenuOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none',
      ]"
    >
      <div
        class="py-6 space-y-8 h-[calc(100dvh-64px)] overflow-y-auto no-scrollbar"
      >
        <div class="relative group">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500"
          />
          <input
            type="text"
            placeholder="搜索工具"
            class="w-full bg-muted/40 rounded-xl pl-11 pr-4 py-3 text-base font-medium outline-none border border-transparent focus:bg-background focus:border-blue-500/10 shadow-sm transition-all"
            readonly
            @click="
              () => {
                isMobileMenuOpen = false;
                $router.push('/search');
              }
            "
          />
        </div>

        <div class="space-y-1">
          <RouterLink
            v-for="item in mainNav"
            :key="item.name"
            :to="item.href"
            class="flex items-center gap-4 px-4 py-3 rounded-xl text-[18px] font-medium transition-all active:scale-[0.98]"
            :class="[
              route.path === item.href
                ? 'bg-muted/80 text-foreground'
                : 'text-foreground/90',
            ]"
          >
            <div
              class="flex items-center justify-center p-2 rounded-lg bg-blue-500/10 text-blue-500"
            >
              <component :is="item.icon" class="h-5 w-5 stroke-[2.5px]" />
            </div>
            {{ item.name }}
          </RouterLink>
        </div>

        <div>
          <h3
            class="px-4 text-[12px] font-medium text-muted-foreground/50 uppercase tracking-widest mb-4"
          >
            浏览类别
          </h3>
          <div class="grid grid-cols-1 gap-1">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[17px] font-medium transition-all active:scale-[0.98] group border-b border-muted/20"
              :class="[
                route.path === '/categories' &&
                navigationStore.activeCategoryId === cat.id
                  ? 'text-blue-500'
                  : 'text-foreground/90',
              ]"
              @click="
                () => {
                  isMobileMenuOpen = false;
                  $router.push(`/categories#${cat.id}`);
                }
              "
            >
              <component :is="cat.icon" class="h-6 w-6" :class="cat.color" />
              <span class="flex-1 text-left truncate">{{ cat.name }}</span>
              <ChevronRight
                class="h-5 w-5 text-muted-foreground/30 group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>

        <div class="pt-10 flex flex-col items-center gap-6 pb-20">
          <ModeToggle />
          <p class="text-[12px] text-muted-foreground font-medium opacity-50">
            © 2026 小于工具箱 NEXT
          </p>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mobile-nav-transition {
  transition:
    height 500ms cubic-bezier(0.4, 0, 0.2, 1),
    background-color 500ms ease,
    backdrop-filter 500ms ease;
  will-change: height, background-color;
}
</style>
