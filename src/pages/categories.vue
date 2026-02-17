<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { categories } from "@/config/nav";
import { toolsData } from "@/config/tools";
import { useIntersectionObserver } from "@vueuse/core";
import { navigationStore, setActiveCategory } from "@/stores/navigation";

const router = useRouter();
const route = useRoute();

const scrollToCategory = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    setActiveCategory(id); // Set active immediately on click

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

// Intersection Observer Setup
categories.forEach((cat) => {
  onMounted(() => {
    const el = document.getElementById(cat.id);
    if (el) {
      useIntersectionObserver(
        el,
        (entries) => {
          const [entry] = entries;
          if (entry?.isIntersecting) {
            setActiveCategory(cat.id);
          }
        },
        {
          rootMargin: "-100px 0px -70% 0px", // Trigger when section is near top
        },
      );
    }
  });
});

// Handle initial hash and hash changes
onMounted(() => {
  if (route.hash) {
    const id = route.hash.slice(1);
    // Delay slightly to ensure layout is ready
    setTimeout(() => {
      scrollToCategory(id);
    }, 100);
  }
});

watch(
  () => route.hash,
  (newHash) => {
    if (newHash) {
      scrollToCategory(newHash.slice(1));
    }
  },
);

const handleToolClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="space-y-12">
    <!-- Sticky Sub-Nav -->
    <div
      class="sticky top-0 z-40 -mx-6 md:-mx-14 lg:-mx-20 px-6 md:px-14 lg:px-20 py-4 bg-background/80 backdrop-blur-xl border-b border-muted-foreground/5"
    >
      <div
        class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0"
      >
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="scrollToCategory(cat.id)"
          class="shrink-0 px-4 py-1.5 rounded-full"
          :class="[
            navigationStore.activeCategoryId === cat.id
              ? 'btn-primary'
              : 'btn-secondary',
          ]"
        >
          {{ $t(cat.name) }}
        </button>
      </div>
    </div>

    <!-- Category Sections -->
    <div class="space-y-20 mt-8">
      <section
        v-for="cat in categories"
        :key="cat.id"
        :id="cat.id"
        class="scroll-mt-24 space-y-6"
      >
        <div class="flex items-end justify-between px-1">
          <h2>
            {{ $t(cat.name) }}
          </h2>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
        >
          <div
            v-for="tool in toolsData[cat.id] || []"
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
              <h3 class="truncate group-hover:text-blue-500 transition-colors">
                {{ $t(tool.title) }}
              </h3>
              <p class="line-clamp-2 mt-1">
                {{ $t(tool.subtitle) }}
              </p>
            </div>
            <ChevronRight
              class="h-5 w-5 text-muted-foreground/30 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
