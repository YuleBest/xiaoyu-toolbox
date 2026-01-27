<template>
  <v-container class="fill-height py-16" fluid>
    <div class="max-width-1200 mx-auto w-100">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <v-chip
          variant="tonal"
          color="primary"
          size="small"
          class="mb-6 font-weight-bold"
          rounded="pill"
        >
          ✨ Xiaoyu Toolbox v1.0
        </v-chip>
        <h1
          class="responsive-h1 font-weight-bold mb-6 tracking-tight text-high-emphasis"
        >
          小于<span class="text-primary">在线工具箱</span>
        </h1>
        <p
          class="text-h6 text-medium-emphasis mb-10 font-weight-regular mx-auto"
          style="max-width: 600px; line-height: 1.6"
        >
          于乐的在线工具集
        </p>

        <div class="d-flex flex-column flex-sm-row justify-center gap-4">
          <v-btn
            color="primary"
            size="x-large"
            to="/tools"
            elevation="0"
            rounded="xl"
            class="px-8 font-weight-bold btn-hover"
            height="56"
          >
            开始使用
            <v-icon icon="mdi-arrow-right" end class="ml-2"></v-icon>
          </v-btn>
          <v-btn
            variant="tonal"
            size="x-large"
            href="https://github.com/YuleBest/xiaoyu-toolbox"
            target="_blank"
            rounded="xl"
            class="px-8 font-weight-bold"
            height="56"
          >
            <v-icon icon="mdi-github" start class="mr-2"></v-icon>
            GitHub
          </v-btn>
        </div>
      </div>

      <!-- Compact Tool Preview -->
      <v-row class="mt-8" justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-card
            variant="flat"
            class="bento-card pa-6 border"
            rounded="xl"
            to="/tools"
          >
            <div class="d-flex align-center mb-6">
              <v-icon color="primary" class="mr-2" size="24"
                >mdi-toolbox-outline</v-icon
              >
              <h2 class="text-h6 font-weight-bold">全部工具</h2>
              <v-spacer></v-spacer>
              <span
                class="text-caption text-medium-emphasis font-weight-medium"
              >
                本站已上线
                <span class="text-primary">{{ allTools.length }}</span> 个工具
              </span>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="tool in allTools"
                :key="tool.id"
                variant="tonal"
                :color="tool.color"
                size="small"
                class="px-3 font-weight-medium"
                rounded="lg"
              >
                <v-icon :icon="tool.icon" start size="14"></v-icon>
                {{ tool.title }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import toolsData from "@/assets/data/tools.json";

useHead({
  title: "小于工具箱 - 一个纯净、开源、无广告的在线工具集",
  meta: [
    {
      name: "description",
      content:
        "小于在线工具箱，提供二维码生成、Base64转换、天气查询等多种实用在线工具，无广告，快速便捷。",
    },
  ],
});

const allTools = computed(() => Object.values(toolsData).flat());
</script>

<style scoped>
.max-width-1200 {
  max-width: 1200px;
}

.tracking-tight {
  letter-spacing: -0.03em !important;
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

/* Bento Card Styles */
.bento-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  position: relative;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
}

.bento-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 12px 32px -8px rgba(var(--v-theme-primary), 0.15);
}

.fake-ui-window {
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.bento-card:hover .fake-ui-window {
  transform: translateY(0);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.5;
}

.z-10 {
  z-index: 10;
  position: relative;
}

.btn-hover {
  transition: transform 0.2s;
}
.btn-hover:hover {
  transform: scale(1.02);
}

/* Responsive Typography */
.responsive-h1 {
  font-size: 2rem; /* Mobile first (smaller) */
  line-height: 1.2;
}

.v-container {
  padding-top: 120px !important;
}

@media (min-width: 600px) {
  .responsive-h1 {
    font-size: 3rem; /* ~text-h2 size */
  }
}
</style>
