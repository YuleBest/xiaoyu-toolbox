<script setup lang="ts">
import { computed, provide, ref } from "vue";
import MainLayout from "./layouts/Main.vue";
import GlobalToast from "@/components/GlobalToast.vue";
import { Toaster } from "@/components/ui/sonner";
import { useToolMeta } from "@/lib/useMeta";
import { useHead } from "@unhead/vue";

useHead({
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "preload",
      as: "style",
      href: "https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap",
    },
  ],
});

const layout = computed(() => {
  return MainLayout;
});

const toastRef = ref();
provide(
  "showToast",
  (message: string, type: "success" | "warning" | "error" = "success") => {
    toastRef.value?.addToast(message, type);
  },
);

// 初始化 Meta 管理
useToolMeta();
</script>

<template>
  <component :is="layout">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </component>

  <Toaster rich-colors position="top-center" />
  <GlobalToast ref="toastRef" />
</template>
