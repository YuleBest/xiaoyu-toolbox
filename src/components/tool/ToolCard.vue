<script setup lang="ts">
import { Star } from "lucide-vue-next";
import { type Tool } from "@/config/tools";
import { isFavorite, toggleFavorite } from "@/stores/favorites";
import { useRouter } from "vue-router";

defineProps<{
  tool: Tool;
}>();

const router = useRouter();

const handleToolClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div
    class="aspect-square flex flex-col justify-between items-start p-4 sm:p-5 rounded-3xl bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-blue-500/10 transition-all duration-300 group cursor-pointer relative"
    @click="handleToolClick(tool.path)"
  >
    <!-- Star Icon Overlay -->
    <div
      class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1 flex items-center justify-center rounded-full hover:bg-background/80 transition-colors"
      @click.stop="toggleFavorite(tool.id)"
    >
      <Star
        class="h-4 w-4 md:h-5 md:w-5"
        :class="
          isFavorite(tool.id)
            ? 'fill-amber-500 text-amber-500'
            : 'text-muted-foreground/30 hover:text-amber-500'
        "
      />
    </div>

    <!-- Icon -->
    <div
      class="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-[0.9rem] sm:rounded-[1.1rem] bg-secondary flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500"
      :class="tool.color"
    >
      <component :is="tool.icon" class="h-6 w-6 sm:h-7 sm:w-7" />
    </div>

    <!-- Text Content -->
    <div class="flex-1 flex flex-col justify-end min-w-0 w-full mt-2">
      <h3
        class="truncate group-hover:text-blue-500 transition-colors text-sm sm:text-base font-semibold"
      >
        {{ $t(tool.title) }}
      </h3>
      <p
        class="line-clamp-2 mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground"
      >
        {{ $t(tool.subtitle) }}
      </p>
    </div>
  </div>
</template>
