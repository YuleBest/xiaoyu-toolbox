<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { categories } from "@/config/nav";
import { toolsData } from "@/config/tools";
import { useIntersectionObserver } from "@vueuse/core";
import { navigationStore, setActiveCategory } from "@/stores/navigation";
import ToolCard from "@/components/tool/ToolCard.vue";

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
          class="shrink-0 px-4 py-1.5 rounded-full"
          :class="[
            navigationStore.activeCategoryId === cat.id
              ? 'btn-primary'
              : 'btn-secondary',
          ]"
          @click="scrollToCategory(cat.id)"
        >
          {{ $t(cat.name) }}
        </button>
      </div>
    </div>

    <!-- Category Sections -->
    <div class="space-y-20 mt-8">
      <section
        v-for="cat in categories"
        :id="cat.id"
        :key="cat.id"
        class="scroll-mt-24 space-y-6"
      >
        <div class="flex items-end justify-between px-1">
          <h2>
            {{ $t(cat.name) }}
          </h2>
        </div>

        <div
          class="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-6"
        >
          <ToolCard
            v-for="tool in toolsData[cat.id] || []"
            :key="tool.id"
            :tool="tool"
          />
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
