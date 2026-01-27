<template>
  <v-container>
    <div class="d-flex flex-column align-center mb-10 mt-6">
      <h1 class="text-h4 font-weight-bold mb-2">工具列表</h1>
      <div class="text-subtitle-1 text-medium-emphasis">探索所有实用工具</div>
    </div>

    <!-- Compact Controls Header -->
    <v-row class="mb-6 mt-4" justify="center">
      <v-col cols="12" md="10" lg="9">
        <v-card variant="flat" border class="pa-3 bg-surface rounded-xl">
          <div class="d-flex align-center mb-3 px-1">
            <v-icon
              icon="mdi-toolbox-outline"
              color="primary"
              class="mr-2"
            ></v-icon>
            <span class="text-h6 font-weight-bold">工具列表</span>
            <v-spacer></v-spacer>
            <span class="text-caption text-medium-emphasis">
              共 {{ filteredTools.length }} 个工具
            </span>
          </div>

          <v-row no-gutters class="gap-3">
            <v-col class="flex-grow-1">
              <v-text-field
                v-model="searchQuery"
                placeholder="搜索工具关键词..."
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                density="compact"
                rounded="lg"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-menu density="compact">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    variant="tonal"
                    height="40"
                    min-width="40"
                    class="px-2"
                    rounded="lg"
                    title="排序方式"
                  >
                    <v-icon icon="mdi-sort-variant"></v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    @click="sortType = 'default'"
                    :active="sortType === 'default'"
                  >
                    <template v-slot:prepend
                      ><v-icon icon="mdi-history" size="18"></v-icon
                    ></template>
                    <v-list-item-title>默认排序</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    @click="sortType = 'az'"
                    :active="sortType === 'az'"
                  >
                    <template v-slot:prepend
                      ><v-icon
                        icon="mdi-sort-alphabetical-ascending"
                        size="18"
                      ></v-icon
                    ></template>
                    <v-list-item-title>名称 (A-Z)</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>

          <div class="mt-3 d-flex align-center flex-wrap gap-2 px-1">
            <v-chip-group
              v-model="selectedCategory"
              selected-class="text-primary font-weight-bold"
              mandatory
              density="compact"
            >
              <v-chip
                v-for="cat in categories"
                :key="cat"
                :value="cat"
                variant="text"
                size="x-small"
                class="px-2"
              >
                {{ cat }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Compact Tool Grid -->
    <v-row class="px-2">
      <v-col
        v-for="tool in filteredTools"
        :key="tool.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="pa-2"
      >
        <v-card
          :to="tool.path"
          class="tool-card border"
          elevation="0"
          rounded="xl"
        >
          <v-card-item class="pa-3">
            <div class="d-flex align-center">
              <v-avatar
                :color="tool.color"
                variant="tonal"
                rounded="lg"
                size="36"
                class="mr-3"
              >
                <v-icon :icon="tool.icon" size="18"></v-icon>
              </v-avatar>
              <div class="overflow-hidden">
                <v-card-title
                  class="text-body-2 font-weight-bold pa-0 text-truncate"
                >
                  {{ tool.title }}
                </v-card-title>
                <div
                  class="text-caption text-medium-emphasis text-truncate mt-n1"
                >
                  {{ tool.subtitle }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-chip
                v-if="tool.isNew"
                size="x-small"
                color="error"
                variant="flat"
                class="font-weight-black px-1"
                style="height: 16px; min-width: 32px; font-size: 0.6rem"
              >
                NEW
              </v-chip>
            </div>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- No Results State -->
    <div
      v-if="filteredTools.length === 0"
      class="text-center mt-12 py-12 text-medium-emphasis"
    >
      <v-icon
        size="80"
        icon="mdi-magnify-remove-outline"
        color="primary"
        class="mb-6 opacity-20"
      ></v-icon>
      <div class="text-h6 font-weight-bold">未找到相关工具</div>
      <div class="text-body-2">尝试调整搜索关键词或分类筛选</div>
      <v-btn variant="text" color="primary" class="mt-4" @click="resetFilters"
        >重置所有筛选</v-btn
      >
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useHead } from "@unhead/vue";
import toolsData from "@/assets/data/tools.json";

useHead({
  title: "所有工具 - 小于工具箱",
  meta: [
    {
      name: "description",
      content: "浏览并搜索小于在线工具箱提供的所有实用工具。",
    },
  ],
});

const searchQuery = ref("");
const sortType = ref<"default" | "az">("default");
const selectedCategory = ref("全部");

const categories = ["全部", ...Object.keys(toolsData)];

const sortLabel = computed(() => {
  return sortType.value === "default" ? "默认排序" : "名称排序";
});

const allTools = computed(() => {
  const result: any[] = [];
  for (const [category, tools] of Object.entries(toolsData)) {
    tools.forEach((tool: any) => {
      result.push({ ...tool, category });
    });
  }
  return result;
});

const filteredTools = computed(() => {
  let result = [...allTools.value];

  // Category Filter
  if (selectedCategory.value !== "全部") {
    result = result.filter((t) => t.category === selectedCategory.value);
  }

  // Search Filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q),
    );
  }

  // Identify the global top 2 newest tools
  const newestIds = [...allTools.value]
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 2)
    .map((t) => t.id);

  // Enrich with 'isNew' status
  result = result.map((t) => ({
    ...t,
    isNew: newestIds.includes(t.id),
  }));

  // Sort
  if (sortType.value === "az") {
    result.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
  } else {
    // Default: Sort by date descending
    result.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }

  return result;
});

const resetFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "全部";
  sortType.value = "default";
};
</script>

<style scoped>
.v-container {
  padding-top: 100px !important;
}

.gap-4 {
  gap: 16px;
}
.gap-3 {
  gap: 12px;
}
.gap-2 {
  gap: 8px;
}

.tool-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 10px 30px rgba(var(--v-theme-primary), 0.1) !important;
}

.opacity-70 {
  opacity: 0.7;
}
</style>
