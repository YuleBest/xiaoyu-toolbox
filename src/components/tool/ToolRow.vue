<script setup lang="ts">
import { Star, ChevronRight } from 'lucide-vue-next'
import { type Tool } from '@/config/tools'
import { isFavorite, toggleFavorite } from '@/stores/favorites'
import { useRouter } from 'vue-router'

defineProps<{
  tool: Tool
}>()

const router = useRouter()

const handleToolClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div
    class="flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-blue-500/10 transition-all duration-300 group cursor-pointer"
    @click="handleToolClick(tool.path)"
  >
    <!-- Icon -->
    <div
      class="h-12 w-12 shrink-0 rounded-xl bg-secondary flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500"
      :class="tool.color"
    >
      <component :is="tool.icon" class="h-6 w-6" />
    </div>

    <!-- Two-line Text -->
    <div class="flex-1 min-w-0">
      <h3
        class="truncate group-hover:text-blue-500 transition-colors text-sm sm:text-base font-semibold"
      >
        {{ $t(tool.title) }}
      </h3>
      <p class="truncate mt-0.5 text-xs sm:text-sm text-muted-foreground">
        {{ $t(tool.subtitle) }}
      </p>
    </div>

    <!-- Star Favorite -->
    <button
      class="shrink-0 p-1.5 rounded-full hover:bg-background/80 transition-colors"
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
    </button>

    <ChevronRight
      class="h-5 w-5 shrink-0 text-muted-foreground/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
    />
  </div>
</template>
