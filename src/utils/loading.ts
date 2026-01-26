import { ref } from "vue";

export const isPageLoading = ref(false);
export const loadingProgress = ref(0);

let timer: ReturnType<typeof setInterval> | null = null;

export function startLoading() {
  isPageLoading.value = true;
  loadingProgress.value = 0;

  if (timer) clearInterval(timer);

  // Fake progress animation
  timer = setInterval(() => {
    if (loadingProgress.value < 80) {
      loadingProgress.value += Math.random() * 5;
    } else if (loadingProgress.value < 95) {
      loadingProgress.value += Math.random() * 1;
    }
  }, 100);
}

export function stopLoading() {
  isPageLoading.value = false;
  loadingProgress.value = 100;
  if (timer) clearInterval(timer);

  setTimeout(() => {
    loadingProgress.value = 0;
  }, 300);
}
