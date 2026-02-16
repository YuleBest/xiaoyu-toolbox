<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown, Info, User, Calendar, BookOpen } from "lucide-vue-next";
import type { Tool } from "@/config/tools";

const props = defineProps<{
  tool: Tool;
}>();

const isInfoOpen = ref(false);

const toggleInfo = () => {
  isInfoOpen.value = !isInfoOpen.value;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Tool Header -->
    <header
      class="bg-background/80 backdrop-blur-xl border-b -mx-6 md:-mx-14 lg:-mx-20 px-6 md:px-14 lg:px-20 py-3 md:py-4 transition-all"
    >
      <div class="flex items-center justify-between max-w-7xl mx-auto gap-4">
        <!-- Left: Tool Info -->
        <div class="flex items-center gap-3 md:gap-4 min-w-0">
          <div
            class="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-card flex items-center justify-center shrink-0 border"
            :class="tool.color"
          >
            <component :is="tool.icon" class="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div class="min-w-0">
            <h1 class="text-base md:text-lg font-semibold leading-tight">
              {{ $t(tool.title) }}
            </h1>
            <p
              class="text-[10px] md:text-xs text-muted-foreground font-normal line-clamp-2"
            >
              {{ $t(tool.subtitle) }}
            </p>
          </div>
        </div>

        <!-- Right: Actions & Info Toggle -->
        <div class="flex items-center gap-2">
          <!-- Actions Slot -->
          <slot name="actions" />

          <button
            @click="toggleInfo"
            class="flex items-center gap-2 p-2 md:px-4 md:py-2 rounded-xl hover:bg-muted transition-all active:scale-95 group border border-transparent"
            :class="{
              'bg-blue-500/10 text-blue-500 border-blue-500/20': isInfoOpen,
            }"
            :aria-label="$t('toolContainer.toolInfo')"
          >
            <Info class="h-5 w-5 md:h-4 md:w-4" />
            <span class="text-sm font-medium hidden sm:inline">{{
              $t("toolContainer.details")
            }}</span>
            <ChevronDown
              class="h-4 w-4 transition-transform duration-300 hidden sm:inline"
              :class="{ 'rotate-180': isInfoOpen }"
            />
          </button>
        </div>
      </div>
    </header>

    <!-- Info Drawer / Collapsible -->
    <div
      class="grid transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)]"
      :class="[
        isInfoOpen
          ? 'grid-rows-[1fr] opacity-100'
          : 'grid-rows-[0fr] opacity-0 pointer-events-none',
      ]"
    >
      <div class="overflow-hidden">
        <div
          class="bg-card/50 border rounded-3xl p-5 md:p-8 space-y-5 md:space-y-8 mb-6"
        >
          <!-- Description -->
          <div class="space-y-2">
            <h3
              class="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <Info class="h-3.5 w-3.5" /> {{ $t("toolContainer.description") }}
            </h3>
            <p class="text-[14px] leading-relaxed font-normal opacity-90">
              {{ $t(tool.description) }}
            </p>
          </div>

          <!-- Usage -->
          <div class="space-y-2">
            <h3
              class="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <BookOpen class="h-3.5 w-3.5" /> {{ $t("toolContainer.usage") }}
            </h3>
            <div
              class="text-[14px] leading-relaxed font-normal opacity-90 whitespace-pre-wrap"
            >
              {{ $t(tool.usage) }}
            </div>
          </div>

          <!-- Meta Info -->
          <div
            class="flex flex-wrap gap-4 md:gap-8 pt-4 border-t border-dashed"
          >
            <div class="flex items-center gap-2 text-xs">
              <User class="h-3.5 w-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">{{
                $t("toolContainer.author")
              }}</span>
              <span class="font-medium">{{ tool.author }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <Calendar class="h-3.5 w-3.5 text-muted-foreground" />
              <span class="text-muted-foreground">{{
                $t("toolContainer.publishDate")
              }}</span>
              <span class="font-medium">{{ tool.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tool Content -->
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
