<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { Search, ArrowLeft, X, ChevronRight, Inbox } from "lucide-vue-next";
import { allTools } from "@/config/tools";

const router = useRouter();
const searchQuery = ref("");
const searchInput = ref<HTMLInputElement | null>(null);

// Focus search input on mount
onMounted(() => {
  nextTick(() => {
    searchInput.value?.focus();
  });
});

const filteredTools = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return [];

  return allTools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(query) ||
      tool.subtitle.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query),
  );
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  searchInput.value?.focus();
};

const handleToolClick = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Search Header -->
    <div class="sticky top-0 z-30 pt-4 pb-6 bg-background/80 backdrop-blur-xl">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="p-2.5 rounded-full hover:bg-muted transition-colors active:scale-90"
        >
          <ArrowLeft class="h-6 w-6" />
        </button>

        <div class="flex-1 relative group">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors"
          />
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索工具、分类或关键词..."
            class="w-full bg-muted/50 rounded-2xl pl-12 pr-12 py-3.5 text-lg font-normal outline-none border border-transparent focus:bg-background focus:border-blue-500 transition-all"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted-foreground/10 hover:bg-muted-foreground/20 transition-colors"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div class="space-y-6">
      <!-- Welcome / Instruction State -->
      <div v-if="!searchQuery" class="text-center py-24 space-y-6">
        <div class="inline-flex p-8 rounded-4xl bg-secondary/30">
          <Search class="h-14 w-14 text-muted-foreground/30" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">输入关键词开始搜索</h2>
          <p class="text-muted-foreground font-normal max-w-sm mx-auto">
            您可以搜索工具名称、功能描述或子标题，快速找到您需要的工具。
          </p>
        </div>
      </div>

      <!-- Result Grid -->
      <div
        v-else-if="filteredTools.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div
          v-for="tool in filteredTools"
          :key="tool.id"
          class="group p-4 rounded-3xl bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-blue-500/10 transition-all duration-300 cursor-pointer flex items-center gap-4"
          @click="handleToolClick(tool.path)"
        >
          <div
            class="h-14 w-14 rounded-[1.1rem] bg-background flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500"
            :class="tool.color"
          >
            <component :is="tool.icon" class="h-7 w-7" />
          </div>
          <div class="flex-1 min-w-0">
            <h3
              class="text-lg font-bold truncate group-hover:text-blue-500 transition-colors"
            >
              {{ tool.title }}
            </h3>
            <p
              class="text-sm text-muted-foreground font-normal truncate mt-0.5"
            >
              {{ tool.subtitle }}
            </p>
          </div>
          <ChevronRight
            class="h-5 w-5 text-muted-foreground/30 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-24 space-y-6 animate-in fade-in zoom-in duration-300"
      >
        <div
          class="inline-flex p-8 rounded-4xl bg-secondary/30 text-muted-foreground/30"
        >
          <Inbox class="h-14 w-14" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">未找到相关工具</h2>
          <p class="text-muted-foreground font-normal max-w-sm mx-auto">
            尝试更换关键词，或者关注后续更新。我们正在不断添加更多工具。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
