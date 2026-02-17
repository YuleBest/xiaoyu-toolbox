<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronRight } from "lucide-vue-next";
import { allTools } from "@/config/tools";

const router = useRouter();

// Filters
const topTools = computed(() => allTools.filter((t) => t.isTop));
const hotTools = computed(() => allTools.filter((t) => t.isHot && !t.isTop));
const latestTools = computed(() =>
  [...allTools]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6),
);

const handleToolClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="space-y-10">
    <!-- Top Tools -->
    <section v-if="topTools.length" class="space-y-6">
      <div class="flex items-end justify-between px-1">
        <h2 class="text-[22px] md:text-[24px] font-semibold tracking-tight">
          {{ $t("home.featured") }}
        </h2>
        <span
          class="text-[13px] text-muted-foreground font-medium flex items-center gap-0.5 cursor-pointer hover:text-blue-500 transition-colors"
          @click="router.push('/categories')"
          >{{ $t("common.viewMore") }} <ChevronRight class="h-4 w-4"
        /></span>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
      >
        <div
          v-for="tool in topTools"
          :key="tool.id"
          class="flex items-center gap-4 p-3 rounded-3xl bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-blue-500/10 transition-all duration-300 group cursor-pointer"
          @click="handleToolClick(tool.path)"
        >
          <div
            class="h-14 w-14 shrink-0 rounded-[1.1rem] bg-secondary flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500"
            :class="tool.color"
          >
            <component :is="tool.icon" class="h-7 w-7" />
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-[15.5px] font-medium leading-tight truncate group-hover:text-blue-500 transition-colors"
            >
              {{ $t(tool.title) }}
            </h3>
            <p
              class="text-[12px] text-muted-foreground font-normal line-clamp-2 mt-1"
            >
              {{ $t(tool.subtitle) }}
            </p>
          </div>
          <ChevronRight
            class="h-5 w-5 text-muted-foreground/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </section>

    <!-- Hot Tools -->
    <section v-if="hotTools.length" class="space-y-6">
      <div class="flex items-end justify-between px-1">
        <h2 class="text-[22px] md:text-[24px] font-semibold tracking-tight">
          {{ $t("home.hot") }}
        </h2>
        <span
          class="text-[13px] text-muted-foreground font-medium flex items-center gap-0.5 cursor-pointer hover:text-blue-500 transition-colors"
          @click="router.push('/categories')"
          >{{ $t("common.viewMore") }} <ChevronRight class="h-4 w-4"
        /></span>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
      >
        <div
          v-for="tool in hotTools"
          :key="tool.id"
          class="flex items-center gap-4 p-3 rounded-3xl bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-blue-500/10 transition-all duration-300 group cursor-pointer"
          @click="handleToolClick(tool.path)"
        >
          <div
            class="h-14 w-14 shrink-0 rounded-[1.1rem] bg-secondary flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500"
            :class="tool.color"
          >
            <component :is="tool.icon" class="h-7 w-7" />
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-[15.5px] font-medium leading-tight truncate group-hover:text-blue-500 transition-colors"
            >
              {{ $t(tool.title) }}
            </h3>
            <p
              class="text-[12px] text-muted-foreground font-normal line-clamp-2 mt-1"
            >
              {{ $t(tool.subtitle) }}
            </p>
          </div>
          <ChevronRight
            class="h-5 w-5 text-muted-foreground/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </section>

    <!-- Latest Tools -->
    <section v-if="latestTools.length" class="space-y-6">
      <div class="flex items-end justify-between px-1">
        <h2 class="text-[22px] md:text-[24px] font-semibold tracking-tight">
          {{ $t("home.latest") }}
        </h2>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
      >
        <div
          v-for="tool in latestTools"
          :key="tool.id"
          class="flex items-center gap-4 p-3 rounded-3xl bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-blue-500/10 transition-all duration-300 group cursor-pointer"
          @click="handleToolClick(tool.path)"
        >
          <div
            class="h-14 w-14 shrink-0 rounded-[1.1rem] bg-secondary flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500"
            :class="tool.color"
          >
            <component :is="tool.icon" class="h-7 w-7" />
          </div>
          <div class="flex-1 min-w-0">
            <h4
              class="text-[15.5px] font-medium leading-tight truncate group-hover:text-blue-500 transition-colors"
            >
              {{ $t(tool.title) }}
            </h4>
            <div class="flex items-center gap-2 mt-0.5">
              <p
                class="text-[12px] text-muted-foreground font-normal line-clamp-2"
              >
                {{ $t(tool.subtitle) }}
              </p>
            </div>
          </div>
          <ChevronRight
            class="h-5 w-5 text-muted-foreground/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>
    </section>
  </div>
</template>
