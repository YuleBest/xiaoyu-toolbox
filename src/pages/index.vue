<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'
import { allTools, hots, tops } from '@/config/tools'
import { favoriteIds } from '@/stores/favorites'
import ToolCard from '@/components/tool/ToolCard.vue'

const router = useRouter()

// Filters
const favoriteTools = computed(() => allTools.filter((t) => favoriteIds.value.includes(t.id)))
const topTools = computed(() => allTools.filter((t) => tops.includes(t.id)))
const hotTools = computed(() => allTools.filter((t) => hots.includes(t.id) && !tops.includes(t.id)))
const latestTools = computed(() =>
  [...allTools].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
)
</script>

<template>
  <div class="space-y-10">
    <!-- Favorite Tools -->
    <section v-if="favoriteTools.length" class="space-y-6">
      <div class="flex items-end justify-between px-1">
        <h2>
          {{ $t('home.favorites') }}
        </h2>
      </div>

      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3 md:gap-6"
      >
        <ToolCard v-for="tool in favoriteTools" :key="'fav-' + tool.id" :tool="tool" />
      </div>
    </section>

    <!-- Top Tools -->
    <section v-if="topTools.length" class="space-y-6">
      <div class="flex items-end justify-between px-1">
        <h2>
          {{ $t('home.featured') }}
        </h2>
        <span class="view-more-link" @click="router.push('/categories')"
          >{{ $t('common.viewMore') }} <ChevronRight class="h-4 w-4"
        /></span>
      </div>

      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3 md:gap-6"
      >
        <ToolCard v-for="tool in topTools" :key="tool.id" :tool="tool" />
      </div>
    </section>

    <!-- Hot Tools -->
    <section v-if="hotTools.length" class="space-y-6">
      <div class="flex items-end justify-between px-1">
        <h2>
          {{ $t('home.hot') }}
        </h2>
        <span class="view-more-link" @click="router.push('/categories')"
          >{{ $t('common.viewMore') }} <ChevronRight class="h-4 w-4"
        /></span>
      </div>

      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3 md:gap-6"
      >
        <ToolCard v-for="tool in hotTools" :key="tool.id" :tool="tool" />
      </div>
    </section>

    <!-- Latest Tools -->
    <section v-if="latestTools.length" class="space-y-6">
      <div class="flex items-end justify-between px-1">
        <h2>
          {{ $t('home.latest') }}
        </h2>
      </div>

      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3 md:gap-6"
      >
        <ToolCard v-for="tool in latestTools" :key="tool.id" :tool="tool" />
      </div>
    </section>
  </div>
</template>
