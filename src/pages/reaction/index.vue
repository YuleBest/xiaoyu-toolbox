<template>
  <ToolContainer id="reaction">
    <div
      class="fill-height d-flex flex-column align-center justify-center select-none position-relative overflow-hidden rounded-xl transition-colors"
      :class="currentStateClass"
      @mousedown="handleInteraction"
      @touchstart.prevent="handleInteraction"
      style="cursor: pointer; min-height: 400px"
    >
      <!-- Icon & Text Content -->
      <div class="text-center px-4" style="pointer-events: none">
        <v-slide-y-transition mode="out-in">
          <div :key="gameState">
            <v-icon
              :icon="currentIcon"
              size="80"
              color="white"
              class="mb-6 opacity-90"
            ></v-icon>
            <div class="text-h4 font-weight-bold text-white mb-2 shadow-text">
              {{ currentTitle }}
            </div>
            <div class="text-h6 text-white opacity-80 shadow-text">
              {{ currentSubtitle }}
            </div>
          </div>
        </v-slide-y-transition>

        <!-- Result Display (Only in 'result' state) -->
        <v-scale-transition>
          <div v-if="gameState === 'result'" class="mt-8">
            <div
              class="text-h2 font-weight-black text-white mb-2 font-family-mono shadow-text"
            >
              {{ reactionTime }} ms
            </div>
          </div>
        </v-scale-transition>

        <!-- Live Timer (Only in 'now' state) -->
        <div v-if="gameState === 'now'" class="mt-8">
          <div
            class="text-h1 font-weight-bold text-white font-family-mono shadow-text opacity-90"
          >
            {{ liveTimer ?? 0 }} ms
          </div>
        </div>

        <!-- Rank Message (Only in 'result' state) -->
        <v-slide-y-transition>
          <div v-if="gameState === 'result'" class="mt-4">
            <div class="text-h5 font-weight-bold text-white shadow-text">
              {{ rankMessage }}
            </div>
          </div>
        </v-slide-y-transition>
      </div>

      <!-- Helper Text at bottom -->
      <div
        class="position-absolute bottom-0 mb-8 text-white opacity-60 text-caption"
      >
        <div v-if="gameState === 'waiting'">点击任意区域开始测试</div>
        <div v-else-if="gameState === 'early'">点击任意区域重新开始</div>
      </div>
    </div>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import ToolContainer from "@/components/ToolContainer.vue";

type GameState = "waiting" | "ready" | "now" | "result" | "early";

const gameState = ref<GameState>("waiting");
const startTime = ref(0);
const reactionTime = ref(0);
const liveTimer = ref(0);
let timer: any = null;
let intervalId: any = null;

const rankMessage = computed(() => {
  const time = reactionTime.value;
  if (time < 10) return "你是挂吧？？？";
  if (time < 150) return "荣耀王者";
  if (time < 230) return "至尊星耀";
  if (time < 300) return "永恒钻石";
  if (time < 400) return "荣耀黄金";
  if (time < 600) return "倔强青铜";
  return "挂机了？";
});

// State Helpers
const currentStateClass = computed(() => {
  switch (gameState.value) {
    case "waiting":
      return "bg-blue-grey-lighten-1";
    case "ready":
      return "bg-red-accent-2";
    case "now":
      return "bg-green-accent-3";
    case "result":
      return "bg-blue-accent-3";
    case "early":
      return "bg-orange-accent-3";
    default:
      return "bg-grey";
  }
});

const currentIcon = computed(() => {
  switch (gameState.value) {
    case "waiting":
      return "mdi-lightning-bolt";
    case "ready":
      return "mdi-dots-horizontal";
    case "now":
      return "mdi-cursor-default-click";
    case "result":
      return "mdi-clock-check-outline";
    case "early":
      return "mdi-alert-circle-outline";
    default:
      return "mdi-help";
  }
});

const currentTitle = computed(() => {
  switch (gameState.value) {
    case "waiting":
      return "反应力测试";
    case "ready":
      return "等待绿色...";
    case "now":
      return "点击！！！";
    case "result":
      return "你的成绩";
    case "early":
      return "太快了！";
    default:
      return "";
  }
});

const currentSubtitle = computed(() => {
  switch (gameState.value) {
    case "waiting":
      return "当屏幕变绿时尽快点击";
    case "ready":
      return "保持专注";
    case "now":
      return "";
    case "result":
      return "点击再次尝试";
    case "early":
      return "请等待屏幕变绿后再点击";
    default:
      return "";
  }
});

// Logic
const handleInteraction = () => {
  switch (gameState.value) {
    case "waiting":
    case "result":
    case "early":
      startTest();
      break;
    case "ready":
      handleEarlyClick();
      break;
    case "now":
      finishTest();
      break;
  }
};

const startTest = () => {
  gameState.value = "ready";
  const delay = Math.random() * 2000 + 3000; // 3000ms - 5000ms

  timer = setTimeout(() => {
    gameState.value = "now";
    startTime.value = Date.now();
    startLiveTimer();
  }, delay);
};

const startLiveTimer = () => {
  liveTimer.value = 0;
  stopLiveTimer();
  intervalId = setInterval(() => {
    liveTimer.value = Date.now() - startTime.value;
  }, 16); // ~60fps
};

const stopLiveTimer = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const handleEarlyClick = () => {
  if (timer) clearTimeout(timer);
  stopLiveTimer();
  gameState.value = "early";
};

const finishTest = () => {
  const endTime = Date.now();
  stopLiveTimer();
  reactionTime.value = endTime - startTime.value;
  gameState.value = "result";
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === "Space") {
    e.preventDefault(); // Prevent scrolling
    handleInteraction();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.select-none {
  user-select: none;
  -webkit-user-select: none;
}

.transition-colors {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.font-family-mono {
  font-family: monospace;
}

.shadow-text {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
