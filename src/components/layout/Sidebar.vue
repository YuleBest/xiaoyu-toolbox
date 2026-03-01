<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  Search,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-vue-next";
import { mainNav, categories } from "@/config/nav";
import { toolsData } from "@/config/tools";
import { navigationStore, toggleSidebar } from "@/stores/navigation";

import ModeToggle from "@/components/ModeToggle.vue";
import LanguageToggle from "@/components/LanguageToggle.vue";
import ConnectionToggle from "@/components/ConnectionToggle.vue";

const route = useRoute();
const settingsOpen = ref(false);

const isCollapsed = computed(() => navigationStore.isCollapsed);

const expandedCategories = ref<Set<string>>(new Set());

// Open the category that contains the current tool
const openActiveCategory = () => {
  for (const [catId, tools] of Object.entries(toolsData)) {
    if (tools.some((tool) => tool.path === route.path)) {
      expandedCategories.value.add(catId);
    }
  }
};

onMounted(() => {
  openActiveCategory();
});

watch(
  () => route.path,
  () => {
    openActiveCategory();
  },
);

const toggleCategory = (catId: string) => {
  if (isCollapsed.value) {
    toggleSidebar();
    expandedCategories.value.add(catId);
    return;
  }

  if (expandedCategories.value.has(catId)) {
    expandedCategories.value.delete(catId);
  } else {
    expandedCategories.value.add(catId);
  }
};
</script>

<template>
  <aside
    class="hidden md:flex flex-col border-r bg-sidebar fixed h-screen overflow-hidden transition-all duration-300 z-50 border-muted/30"
    :class="[isCollapsed ? 'w-[80px]' : 'w-64']"
  >
    <!-- Logo Area -->
    <div class="px-3 h-[60px] mb-3 mt-1">
      <div
        class="flex items-center cursor-pointer w-full group h-full rounded-lg transition-all duration-300 overflow-hidden"
        :class="isCollapsed ? 'px-[14px]' : 'px-1'"
        @click="$router.push('/')"
      >
        <img
          src="/favicon.svg"
          class="h-7 w-7 shrink-0 transition-transform group-hover:scale-110"
          alt="Logo"
        />
        <span
          class="text-[17px] font-bold tracking-tight leading-tight transition-all duration-300 whitespace-nowrap overflow-hidden text-foreground flex-1"
          :class="
            isCollapsed
              ? 'max-w-0 opacity-0 ml-0'
              : 'max-w-[150px] opacity-100 ml-2.5'
          "
        >
          {{ $t("common.appName") }}
        </span>
      </div>
    </div>

    <!-- Search Section -->
    <div class="px-3 mb-5">
      <div
        class="relative flex items-center transition-all duration-300 bg-background hover:bg-muted/50 rounded-lg group cursor-pointer border focus-within:ring-2 focus-within:ring-blue-500/20 overflow-hidden"
        :class="[
          isCollapsed
            ? 'h-10 px-[18px] border-transparent bg-transparent shadow-none'
            : 'h-9 px-3 border-border/50',
        ]"
        @click="$router.push('/search')"
      >
        <Search
          class="h-5 w-5 shrink-0 transition-all text-muted-foreground/60 group-hover:text-foreground/80"
        />
        <span
          class="text-[12.5px] text-muted-foreground/60 transition-all duration-300 whitespace-nowrap overflow-hidden flex-1"
          :class="[
            isCollapsed
              ? 'max-w-0 opacity-0 ml-0'
              : 'max-w-[110px] opacity-100 ml-2',
          ]"
        >
          {{ $t("common.searchTools") }}...
        </span>
      </div>
    </div>

    <!-- Navigation List -->
    <div class="flex-1 px-3 overflow-y-auto no-scrollbar space-y-6">
      <!-- General Nav Section -->
      <nav class="space-y-0.5">
        <RouterLink
          v-for="item in mainNav"
          :key="item.name"
          :to="item.href"
          class="flex items-center rounded-lg text-[13px] transition-all duration-300 group relative h-9 w-full overflow-hidden"
          :class="[
            route.path === item.href
              ? 'bg-muted/80 text-foreground font-semibold'
              : 'text-foreground/70 hover:bg-muted/40 font-medium',
            isCollapsed ? 'px-[18px]' : 'px-3',
          ]"
        >
          <component
            :is="item.icon"
            class="h-5 w-5 shrink-0 transition-all duration-300"
            :class="[
              route.path === item.href
                ? 'stroke-[2.5px] opacity-100'
                : 'stroke-2 group-hover:scale-110 opacity-70 group-hover:opacity-100',
            ]"
          />
          <span
            class="transition-all duration-300 whitespace-nowrap overflow-hidden flex-1"
            :class="[
              isCollapsed
                ? 'max-w-0 opacity-0 ml-0'
                : 'max-w-[150px] opacity-100 ml-3',
            ]"
          >
            {{ $t(item.name) }}
          </span>
        </RouterLink>

        <!-- Settings Section -->
        <div>
          <button
            class="flex items-center rounded-lg text-[13px] transition-all duration-300 group relative h-9 w-full overflow-hidden px-0 py-0 gap-0"
            :class="[
              settingsOpen
                ? 'bg-muted/80 text-foreground font-semibold'
                : 'text-foreground/70 hover:bg-muted/40 font-medium',
              isCollapsed ? 'px-[18px]' : 'px-3',
            ]"
            @click="settingsOpen = !settingsOpen"
          >
            <Settings
              class="h-5 w-5 shrink-0 transition-all duration-300"
              :class="[
                settingsOpen
                  ? 'stroke-[2.5px] opacity-100 text-foreground'
                  : 'stroke-2 group-hover:scale-110 opacity-70 group-hover:opacity-100',
              ]"
            />
            <span
              class="transition-all duration-300 text-left whitespace-nowrap overflow-hidden flex-1"
              :class="[
                isCollapsed
                  ? 'max-w-0 opacity-0 ml-0'
                  : 'max-w-[150px] opacity-100 ml-3',
              ]"
            >
              {{ $t("common.settings") }}
            </span>
            <!-- Chevron -->
            <ChevronDown
              class="h-3.5 w-3.5 transition-all duration-300 shrink-0 opacity-40 overflow-hidden"
              :class="[
                settingsOpen ? 'rotate-180' : '-rotate-90',
                isCollapsed
                  ? 'max-w-0 opacity-0 ml-0'
                  : 'max-w-[14px] opacity-100 ml-auto',
              ]"
            />
          </button>

          <!-- Collapsible Settings Content -->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out pl-[34px] pr-1 space-y-0.5"
            :class="[
              settingsOpen && !isCollapsed
                ? 'max-h-56 opacity-100 mt-0.5 pb-2'
                : 'max-h-0 opacity-0',
            ]"
          >
            <div
              class="flex items-center justify-between px-2 py-1.5 rounded-lg border border-transparent"
            >
              <span
                class="text-[11.5px] font-medium text-muted-foreground/80"
                >{{ $t("connection.label") }}</span
              >
              <ConnectionToggle />
            </div>
            <div
              class="flex items-center justify-between px-2 py-1.5 rounded-lg border border-transparent"
            >
              <span
                class="text-[11.5px] font-medium text-muted-foreground/80"
                >{{ $t("theme.label") }}</span
              >
              <ModeToggle />
            </div>
            <div
              class="flex items-center justify-between px-2 py-1.5 rounded-lg border border-transparent"
            >
              <span
                class="text-[11.5px] font-medium text-muted-foreground/80"
                >{{ $t("lang.label") }}</span
              >
              <LanguageToggle />
            </div>
          </div>
        </div>
      </nav>

      <!-- Build / Categories Section -->
      <div class="space-y-1">
        <h3
          class="font-medium text-muted-foreground/60 transition-all duration-300 overflow-hidden whitespace-nowrap"
          :class="[
            isCollapsed
              ? 'max-h-0 opacity-0 mb-0 px-0 text-[0px]'
              : 'max-h-[20px] opacity-100 mb-2 px-3 text-[11px]',
          ]"
        >
          {{ $t("nav.categoriesLabel") }}
        </h3>

        <div
          v-for="cat in categories"
          :key="cat.id"
          class="flex flex-col mb-1 relative"
        >
          <!-- Category Header -->
          <button
            class="flex items-center rounded-lg text-[13px] transition-all duration-300 group overflow-hidden h-9 w-full px-0 py-0 gap-0"
            :class="[
              expandedCategories.has(cat.id) && !isCollapsed
                ? 'text-foreground font-medium'
                : 'text-foreground/70 hover:bg-muted/40 font-medium',
              isCollapsed ? 'px-[18px]' : 'px-3',
            ]"
            @click="toggleCategory(cat.id)"
          >
            <component
              :is="cat.icon"
              class="h-[18px] w-[18px] shrink-0 transition-all duration-300"
              :class="[
                expandedCategories.has(cat.id) ||
                (!isCollapsed &&
                  toolsData[cat.id]?.some((t) => t.path === route.path))
                  ? 'opacity-100'
                  : 'opacity-50 group-hover:opacity-100 group-hover:scale-110',
              ]"
            />
            <span
              class="transition-all duration-300 text-left whitespace-nowrap overflow-hidden flex-1"
              :class="[
                isCollapsed
                  ? 'max-w-0 opacity-0 ml-0'
                  : 'max-w-[140px] opacity-100 ml-2',
              ]"
            >
              {{ $t(cat.name) }}
            </span>
            <!-- Chevron -->
            <ChevronDown
              class="h-3.5 w-3.5 transition-all duration-300 shrink-0 opacity-40 overflow-hidden"
              :class="[
                expandedCategories.has(cat.id) ? 'rotate-180' : '-rotate-90',
                isCollapsed
                  ? 'max-w-0 opacity-0 mr-0'
                  : 'max-w-[14px] opacity-100 mr-2 ml-auto',
              ]"
            />
          </button>

          <!-- Tools List under Category -->
          <div
            class="overflow-hidden transition-all duration-300 ease-in-out mt-0.5 relative"
            :class="[
              expandedCategories.has(cat.id) && !isCollapsed
                ? 'max-h-[800px] opacity-100 pb-2'
                : 'max-h-0 opacity-0',
            ]"
          >
            <!-- Vertical Tree Line -->
            <div
              class="absolute left-[21px] top-1 bottom-3 w-px bg-border/60 transition-opacity duration-300"
              :class="
                expandedCategories.has(cat.id) ? 'opacity-100' : 'opacity-0'
              "
            ></div>

            <div class="pl-[34px] pr-1 space-y-0.5 w-full">
              <RouterLink
                v-for="tool in toolsData[cat.id]"
                :key="tool.id"
                :to="tool.path"
                class="flex items-center justify-between px-3 py-[6px] rounded-md text-[12.5px] transition-all group overflow-hidden border border-transparent"
                :class="[
                  route.path === tool.path
                    ? 'bg-muted/80 text-foreground font-medium'
                    : 'text-foreground/60 hover:text-foreground hover:bg-muted/40',
                ]"
              >
                <span class="truncate flex-1">{{ $t(tool.title) }}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-auto border-t border-muted/30 p-3 flex">
      <!-- Collapse Action Bar -->
      <button
        class="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground/60 hover:text-foreground transition-all duration-300 active:scale-95 group relative overflow-hidden px-0 py-0 gap-0"
        :class="isCollapsed ? 'ml-3' : 'ml-1.5'"
        @click="toggleSidebar"
      >
        <PanelLeftClose
          class="h-[18px] w-[18px] transition-all duration-300"
          :class="
            isCollapsed
              ? 'opacity-0 absolute scale-50'
              : 'opacity-100 scale-100'
          "
        />
        <PanelLeftOpen
          class="h-[18px] w-[18px] transition-all duration-300"
          :class="
            isCollapsed
              ? 'opacity-100 scale-100'
              : 'opacity-0 absolute scale-50'
          "
        />
        <span class="sr-only">Toggle Sidebar</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

aside {
  background: hsl(var(--sidebar));
  backdrop-filter: blur(10px);
}
</style>
