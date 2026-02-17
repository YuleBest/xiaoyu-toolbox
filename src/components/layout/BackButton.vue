<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const showBackButton = ref(false);

watch(
  () => route.path,
  (newPath) => {
    showBackButton.value =
      newPath !== "/" && newPath.split("/").filter(Boolean).length >= 1;
  },
  { immediate: true },
);

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-x-2"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 -translate-x-2"
  >
    <button
      v-if="showBackButton"
      @click="goBack"
      class="fixed bottom-10 md:bottom-12 left-6 md:left-[304px] z-[60] flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-2xl border border-muted/50 hover:border-blue-500/50 hover:bg-card/90 transition-all active:scale-95 group shadow-lg overflow-hidden"
    >
      <ArrowLeft
        class="h-4 w-4 text-blue-500 group-hover:-translate-x-0.5 transition-transform"
      />
      <span
        class="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors mr-1"
      >
        {{ $t("common.back") }}
      </span>
    </button>
  </Transition>
</template>

<style scoped>
/* 可以在这里添加一些特殊的微交互动画 */
</style>
