<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Search } from 'lucide-vue-next'
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
    <!-- Hero Section -->
    <section class="px-6 pt-12 pb-8 md:pt-16 md:pb-10 text-center">
      <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
        {{ $t('home.heroTitle') }}
      </h1>
      <div class="relative group mt-6 cursor-pointer" @click="router.push('/search')">
        <Search
          class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-hover:text-blue-500 transition-colors"
        />
        <input
          type="text"
          readonly
          :placeholder="$t('common.searchTools', { count: allTools.length })"
          class="w-full rounded-xl bg-muted/40 py-2.5 pl-11 pr-4 text-sm md:text-base outline-none border border-transparent hover:border-blue-500/30 focus:border-blue-500/50 focus:bg-background transition-all"
          @keydown.enter="router.push('/search')"
        />
      </div>
    </section>

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
