<template>
  <v-container>
    <div class="d-flex flex-column align-center mb-10 mt-6">
      <h1 class="text-h4 font-weight-bold mb-2">工具列表</h1>
      <div class="text-subtitle-1 text-medium-emphasis">探索所有实用工具</div>
    </div>

    <!-- Search & Sort Controls -->
    <v-row class="mb-6" justify="center">
      <v-col cols="12" sm="8" md="6" class="d-flex gap-4">
        <v-text-field
          v-model="searchQuery"
          label="搜索工具..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="flex-grow-1"
          clearable
        ></v-text-field>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              height="56"
              class="ml-4"
              prepend-icon="mdi-sort"
            >
              {{ sortLabel }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="sortType = 'default'" value="default"
              >默认排序</v-list-item
            >
            <v-list-item @click="sortType = 'az'" value="az"
              >名称 (A-Z)</v-list-item
            >
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <!-- Tool Grid -->
    <v-row>
      <v-col
        v-for="tool in filteredTools"
        :key="tool.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card :to="tool.path" class="h-100 tool-card" elevation="0" border>
          <v-card-item class="pa-4">
            <template v-slot:prepend>
              <v-avatar
                :color="tool.color"
                variant="tonal"
                rounded="lg"
                size="48"
                class="mr-2"
              >
                <v-icon :icon="tool.icon" size="24"></v-icon>
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">{{
              tool.title
            }}</v-card-title>
            <v-card-subtitle class="text-caption text-wrap opacity-70">{{
              tool.subtitle
            }}</v-card-subtitle>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- No Results State -->
    <div
      v-if="filteredTools.length === 0"
      class="text-center mt-12 text-medium-emphasis"
    >
      <v-icon size="64" icon="mdi-magnify-remove-outline" class="mb-4"></v-icon>
      <div class="text-h6">未找到相关工具</div>
      <div>换个关键词试试看？</div>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import toolsData from "@/assets/data/tools.json";

const searchQuery = ref("");
const sortType = ref<"default" | "az">("default");

const sortLabel = computed(() => {
  return sortType.value === "default" ? "默认排序" : "名称排序";
});

const filteredTools = computed(() => {
  let result = [...toolsData];

  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sortType.value === "az") {
    result.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
  }

  return result;
});
</script>

<style scoped>
.gap-4 {
  gap: 16px;
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
