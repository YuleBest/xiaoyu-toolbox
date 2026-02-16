<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import {
  Video,
  Search,
  Download,
  Copy,
  Check,
  Heart,
  MessageCircle,
  Share2,
  User,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  parseDyVideo,
  getDownloadUrl,
  getPreviewUrl,
  type DyVideoResult,
} from "@/api/dydown";

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "dydown")!;

const inputText = ref("");
const loading = ref(false);
const result = ref<DyVideoResult | null>(null);
const error = ref("");
const cooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;
const disclaimerVisible = ref(false);
const pendingParse = ref(false);
const copiedUrl = ref(false);

// 24h 免责声明
const DISCLAIMER_KEY = "dydown_disclaimer_accepted";
const isDisclaimerAccepted = () => {
  const ts = localStorage.getItem(DISCLAIMER_KEY);
  if (!ts) return false;
  return Date.now() - parseInt(ts) < 24 * 60 * 60 * 1000;
};

const fullDownloadUrl = computed(() => {
  if (!result.value?.downloadApi) return "";
  return getDownloadUrl(result.value.downloadApi);
});

const previewUrl = computed(() => {
  if (!result.value?.videoId) return "";
  return getPreviewUrl(result.value.videoId);
});

const startCooldown = () => {
  cooldown.value = 5;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
};

const handleParse = async () => {
  if (!inputText.value.trim()) {
    showToast(t("dydown.inputPlaceholder"), "warning");
    return;
  }

  // 检查免责声明
  if (!isDisclaimerAccepted()) {
    disclaimerVisible.value = true;
    pendingParse.value = true;
    return;
  }

  doParse();
};

const acceptDisclaimer = () => {
  localStorage.setItem(DISCLAIMER_KEY, Date.now().toString());
  disclaimerVisible.value = false;
  if (pendingParse.value) {
    pendingParse.value = false;
    doParse();
  }
};

const doParse = async () => {
  error.value = "";
  loading.value = true;
  result.value = null;

  try {
    const resp = await parseDyVideo(inputText.value.trim());
    if (resp.ok && resp.data) {
      result.value = resp.data;
      showToast(t("common.success"));
    } else {
      error.value = resp.message || t("dydown.parseFailed");
    }
  } catch (e: any) {
    error.value = "请求出错: " + (e.message || "网络错误");
  } finally {
    loading.value = false;
    startCooldown();
  }
};

const copyUrl = async () => {
  if (!fullDownloadUrl.value) return;
  try {
    await navigator.clipboard.writeText(fullDownloadUrl.value);
    copiedUrl.value = true;
    showToast(t("common.copySuccess"));
    setTimeout(() => (copiedUrl.value = false), 2000);
  } catch {
    showToast(t("common.copyFailed"), "error");
  }
};

const formatCount = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toString();
};
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6 max-w-3xl mx-auto">
      <!-- Input -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="inputText"
              type="text"
              :placeholder="$t('dydown.inputPlaceholder')"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              @keyup.enter="handleParse"
            />
          </div>
          <button
            @click="handleParse"
            :disabled="!inputText.trim() || loading || cooldown > 0"
            class="px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
          >
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <Video v-else class="h-4 w-4" />
            {{ cooldown > 0 ? `${cooldown}s` : $t("dydown.parse") }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="px-5 py-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-start gap-3"
      >
        <Info class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <p class="text-sm text-destructive font-medium">{{ error }}</p>
      </div>

      <!-- Result -->
      <Transition name="slide">
        <div v-if="result" class="space-y-5">
          <!-- Video Info -->
          <div
            class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
          >
            <!-- Preview -->
            <div v-if="previewUrl" class="relative">
              <video
                :src="previewUrl"
                controls
                preload="metadata"
                class="w-full max-h-[400px] bg-black"
              />
            </div>

            <!-- Info -->
            <div class="p-5 md:p-6 space-y-4">
              <!-- Author -->
              <div class="flex items-center gap-3">
                <div
                  class="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center"
                >
                  <User class="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p class="text-sm font-bold text-foreground">
                    {{ result.safeNickname }}
                  </p>
                  <p
                    v-if="result.createTime"
                    class="text-xs text-muted-foreground"
                  >
                    {{ result.createTime }}
                  </p>
                </div>
              </div>

              <!-- Stats -->
              <div
                v-if="result.statistics"
                class="flex items-center gap-6 text-sm text-muted-foreground"
              >
                <span class="flex items-center gap-1">
                  <Heart class="h-3.5 w-3.5 text-red-500" />
                  {{ formatCount(result.statistics.diggCount) }}
                </span>
                <span class="flex items-center gap-1">
                  <MessageCircle class="h-3.5 w-3.5 text-blue-500" />
                  {{ formatCount(result.statistics.commentCount) }}
                </span>
                <span class="flex items-center gap-1">
                  <Share2 class="h-3.5 w-3.5 text-orange-500" />
                  {{ formatCount(result.statistics.shareCount) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Download Actions -->
          <div class="flex flex-col sm:flex-row gap-3">
            <a
              v-if="fullDownloadUrl"
              :href="fullDownloadUrl"
              target="_blank"
              class="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600 transition-all active:scale-[0.98]"
            >
              <Download class="h-4 w-4" />
              {{ $t("dydown.downloadVideo") }}
            </a>
            <button
              v-if="fullDownloadUrl"
              @click="copyUrl"
              class="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-background border border-muted text-foreground rounded-2xl font-medium transition-all hover:bg-muted active:scale-[0.98]"
            >
              <Check v-if="copiedUrl" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
              {{ copiedUrl ? $t("common.copySuccess") : $t("common.copy") }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- Empty State -->
      <div
        v-if="!result && !loading && !error"
        class="flex flex-col items-center gap-4 py-16 opacity-30"
      >
        <Video class="h-16 w-16" />
        <p class="text-lg font-medium">{{ $t("dydown.inputPlaceholder") }}</p>
      </div>

      <!-- Disclaimer Dialog (Overlay) -->
      <Transition name="fade">
        <div
          v-if="disclaimerVisible"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          @click.self="disclaimerVisible = false"
        >
          <div
            class="bg-card border rounded-3xl p-6 md:p-8 max-w-md w-full mx-4 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center"
              >
                <AlertTriangle class="h-5 w-5 text-amber-500" />
              </div>
              <h3 class="text-lg font-bold">
                {{ $t("dydown.firstUseTitle") }}
              </h3>
            </div>

            <div
              class="text-sm text-muted-foreground space-y-3 leading-relaxed"
            >
              <p>{{ $t("dydown.disclaimerText") }}</p>
              <ul class="list-disc pl-5 space-y-1.5">
                <li>{{ $t("dydown.disclaimerItem1") }}</li>
                <li>{{ $t("dydown.disclaimerItem2") }}</li>
                <li>{{ $t("dydown.disclaimerItem3") }}</li>
                <li>{{ $t("dydown.disclaimerItem4") }}</li>
              </ul>
            </div>

            <div class="flex gap-3">
              <button
                @click="disclaimerVisible = false"
                class="flex-1 px-5 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-all active:scale-95"
              >
                {{ $t("common.cancel") }}
              </button>
              <button
                @click="acceptDisclaimer"
                class="flex-1 px-5 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all active:scale-95"
              >
                {{ $t("dydown.agree") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </ToolContainer>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
