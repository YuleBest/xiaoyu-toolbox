<script setup lang="ts">
import { computed, provide, ref } from "vue";
import MainLayout from "./layouts/Main.vue";
import GlobalToast from "@/components/GlobalToast.vue";
import { Toaster } from "@/components/ui/sonner";
import { useToolMeta } from "@/lib/useMeta";

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

  <Toaster richColors position="top-center" />
  <GlobalToast ref="toastRef" />
</template>
