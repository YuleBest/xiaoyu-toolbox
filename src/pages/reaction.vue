<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import { Zap, AlertCircle, MousePointerClick, Clock } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";

const tool = allTools.find((t) => t.id === "reaction")!;

type GameState = "waiting" | "ready" | "now" | "result" | "early";

const gameState = ref<GameState>("waiting");
const startTime = ref(0);
const reactionTime = ref(0);
const liveTimer = ref(0);
let timer: ReturnType<typeof setTimeout> | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

const rankMessage = computed(() => {
  const time = reactionTime.value;
  if (time < 10) return t("reaction.rank.cheat");
  if (time < 150) return t("reaction.rank.king");
  if (time < 230) return t("reaction.rank.star");
  if (time < 300) return t("reaction.rank.diamond");
  if (time < 400) return t("reaction.rank.gold");
  if (time < 600) return t("reaction.rank.bronze");
  return t("reaction.rank.afk");
});

const stateConfig = computed(() => {
  switch (gameState.value) {
    case "waiting":
      return {
        bg: "bg-slate-500",
        title: t("reaction.waiting.title"),
        subtitle: t("reaction.waiting.subtitle"),
        hint: t("reaction.waiting.hint"),
      };
    case "ready":
      return {
        bg: "bg-red-500",
        title: t("reaction.ready.title"),
        subtitle: t("reaction.ready.subtitle"),
        hint: "",
      };
    case "now":
      return {
        bg: "bg-green-500",
        title: t("reaction.now.title"),
        subtitle: "",
        hint: "",
      };
    case "result":
      return {
        bg: "bg-blue-500",
        title: t("reaction.result.title"),
        subtitle: t("reaction.result.subtitle"),
        hint: "",
      };
    case "early":
      return {
        bg: "bg-orange-500",
        title: t("reaction.early.title"),
        subtitle: t("reaction.early.subtitle"),
        hint: t("reaction.early.hint"),
      };
    default:
      return { bg: "bg-gray-500", title: "", subtitle: "", hint: "" };
  }
});

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
  const delay = Math.random() * 2000 + 3000;
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
  }, 16);
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
  stopLiveTimer();
  reactionTime.value = Date.now() - startTime.value;
  gameState.value = "result";
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === "Space") {
    e.preventDefault();
    handleInteraction();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (timer) clearTimeout(timer);
  stopLiveTimer();
});
</script>

<template>
  <ToolContainer :tool="tool">
    <div
      class="w-full min-h-[500px] md:min-h-[600px] rounded-3xl flex flex-col items-center justify-center select-none cursor-pointer relative overflow-hidden transition-colors duration-300"
      :class="stateConfig.bg"
      @mousedown="handleInteraction"
      @touchstart.prevent="handleInteraction"
    >
      <!-- Content -->
      <div class="text-center px-6 pointer-events-none z-10">
        <!-- Icon -->
        <div class="mb-6">
          <Zap
            v-if="gameState === 'waiting'"
            class="h-20 w-20 text-white/80 mx-auto"
          />
          <div
            v-else-if="gameState === 'ready'"
            class="flex items-center justify-center gap-2"
          >
            <div class="h-3 w-3 bg-white/60 rounded-full animate-pulse" />
            <div
              class="h-3 w-3 bg-white/60 rounded-full animate-pulse"
              style="animation-delay: 0.2s"
            />
            <div
              class="h-3 w-3 bg-white/60 rounded-full animate-pulse"
              style="animation-delay: 0.4s"
            />
          </div>
          <MousePointerClick
            v-else-if="gameState === 'now'"
            class="h-20 w-20 text-white/80 mx-auto animate-bounce"
          />
          <Clock
            v-else-if="gameState === 'result'"
            class="h-20 w-20 text-white/80 mx-auto"
          />
          <AlertCircle
            v-else-if="gameState === 'early'"
            class="h-20 w-20 text-white/80 mx-auto"
          />
        </div>

        <!-- Title -->
        <h2
          class="text-3xl md:text-4xl font-bold text-white mb-2"
          style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
        >
          {{ stateConfig.title }}
        </h2>
        <p
          v-if="stateConfig.subtitle"
          class="text-lg text-white/80"
          style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
        >
          {{ stateConfig.subtitle }}
        </p>

        <!-- Live Timer -->
        <div v-if="gameState === 'now'" class="mt-8">
          <span
            class="text-6xl md:text-7xl font-bold text-white font-mono"
            style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
          >
            {{ liveTimer ?? 0 }} ms
          </span>
        </div>

        <!-- Result -->
        <div v-if="gameState === 'result'" class="mt-8 space-y-4">
          <div
            class="text-6xl md:text-7xl font-black text-white font-mono"
            style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
          >
            {{ reactionTime }} ms
          </div>
          <div
            class="text-2xl font-bold text-white"
            style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)"
          >
            {{ rankMessage }}
          </div>
        </div>
      </div>

      <!-- Bottom Hint -->
      <div
        v-if="stateConfig.hint"
        class="absolute bottom-8 text-white/50 text-sm"
      >
        {{ stateConfig.hint }}
      </div>
    </div>
  </ToolContainer>
</template>
