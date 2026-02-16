<script setup lang="ts">
import { ref } from "vue";
import { TriangleAlert, OctagonX, X, Check } from "lucide-vue-next";

export interface ToastItem {
  id: number;
  message: string;
  type: "success" | "warning" | "error";
}

const toasts = ref<ToastItem[]>([]);
let counter = 0;

const addToast = (
  message: string,
  type: "success" | "warning" | "error" = "success",
) => {
  const id = ++counter;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    removeToast(id);
  }, 5000);
};

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

defineExpose({ addToast });
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-6 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-3 w-full max-w-[90vw] sm:max-w-md pointer-events-none"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-500"
          :class="[
            toast.type === 'error'
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : toast.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
          ]"
        >
          <div class="mt-0.5 shrink-0">
            <OctagonX v-if="toast.type === 'error'" class="h-5 w-5" />
            <TriangleAlert
              v-else-if="toast.type === 'warning'"
              class="h-5 w-5"
            />
            <Check v-else class="h-5 w-5" />
          </div>
          <p class="flex-1 text-[14px] font-medium leading-tight pt-0.5">
            {{ toast.message }}
          </p>
          <button
            @click="removeToast(toast.id)"
            class="shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg active:scale-90 transition-all font-mono"
          >
            <X class="h-4 w-4 opacity-50" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.toast-move {
  transition: transform 0.4s ease;
}
</style>
