<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import {
  Video,
  Search,
  Download,
  Music,
  Settings,
  ChevronDown,
  Upload,
  AlertTriangle,
  Info,
  Loader2,
  Merge,
  FileVideo,
  FileAudio,
} from "lucide-vue-next";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  parseBiliVideo,
  getDownloadUrl,
  type BiliParseResult,
  type VideoStream,
  type AudioStream,
} from "@/api/bilidown";

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "bilidown")!;

// State
const inputText = ref("");
const cookie = ref("");
const loading = ref(false);
const result = ref<BiliParseResult | null>(null);
const error = ref("");
const cooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;
const showAdvanced = ref(false);
const cookieInput = ref<HTMLInputElement | null>(null);
const disclaimerVisible = ref(false);
const pendingParse = ref(false);

// FFmpeg
const ffmpeg = new FFmpeg();
const merging = ref(false);
const mergeProgress = ref(0);
const selectedVideo = ref<VideoStream | null>(null);
const selectedAudio = ref<AudioStream | null>(null);

// 24h 免责声明
const DISCLAIMER_KEY = "bilidown_disclaimer_accepted";
const isDisclaimerAccepted = () => {
  const ts = localStorage.getItem(DISCLAIMER_KEY);
  if (!ts) return false;
  return Date.now() - parseInt(ts) < 24 * 60 * 60 * 1000;
};

// Cookie 自动导入
onMounted(() => {
  const saved = localStorage.getItem("bilidown_cookie");
  if (saved) cookie.value = saved;
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

const extractBvid = (text: string): string => {
  const match = text.match(/BV[a-zA-Z0-9]+/);
  return match ? match[0] : text.trim();
};

const handleParse = async () => {
  if (!inputText.value.trim()) {
    showToast(t("bilidown.inputPlaceholder"), "warning");
    return;
  }

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
  const bvid = extractBvid(inputText.value);
  if (!bvid) {
    showToast(t("bilidown.parseFailed"), "warning");
    return;
  }

  error.value = "";
  loading.value = true;
  result.value = null;

  try {
    // 保存 cookie
    if (cookie.value) {
      localStorage.setItem("bilidown_cookie", cookie.value);
    }

    const resp = await parseBiliVideo(bvid, cookie.value || undefined);
    if (resp.ok && resp.data) {
      result.value = resp.data;
      if (resp.data.videoStreams.length > 0) {
        selectedVideo.value = resp.data.videoStreams[0] ?? null;
      }
      if (resp.data.audioStreams.length > 0) {
        selectedAudio.value = resp.data.audioStreams[0] ?? null;
      }
      showToast(t("common.success"));
    } else {
      error.value = resp.message || t("bilidown.parseFailed");
    }
  } catch (e: any) {
    error.value = "请求出错: " + (e.message || "网络错误");
  } finally {
    loading.value = false;
    startCooldown();
  }
};

const fixCoverUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("//")) return "https:" + url;
  if (!url.startsWith("http")) return "https://" + url.replace(/^\/+/, "");
  return url;
};

const downloadStream = (
  stream: VideoStream | AudioStream,
  type: "video" | "audio",
) => {
  const ext = type === "video" ? "mp4" : "m4a";
  const qualityDesc =
    "qualityDesc" in stream ? stream.qualityDesc : stream.quality;
  const filename = `${result.value?.title || "video"}_${qualityDesc}.${ext}`;
  const url = getDownloadUrl(stream.url, filename, type);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast(t("common.loading"));
};

const mergeAndDownload = async () => {
  if (!selectedVideo.value || !selectedAudio.value || !result.value) return;

  merging.value = true;
  mergeProgress.value = 0;

  try {
    if (!ffmpeg.loaded) {
      showToast(t("bilidown.merging"));
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });
    }

    ffmpeg.on("progress", ({ progress }) => {
      mergeProgress.value = Math.round(progress * 100);
    });

    const videoUrl = getDownloadUrl(
      selectedVideo.value.url,
      "temp.mp4",
      "video",
    );
    const audioUrl = getDownloadUrl(
      selectedAudio.value.url,
      "temp.m4a",
      "audio",
    );

    showToast(t("bilidown.merging"));
    await ffmpeg.writeFile("video.mp4", await fetchFile(videoUrl));
    showToast(t("bilidown.merging"));
    await ffmpeg.writeFile("audio.m4a", await fetchFile(audioUrl));

    showToast(t("bilidown.merging"));
    await ffmpeg.exec([
      "-i",
      "video.mp4",
      "-i",
      "audio.m4a",
      "-c",
      "copy",
      "-shortest",
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: "video/mp4",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.value.title}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(t("bilidown.mergeSuccess"));
  } catch (e: any) {
    showToast(t("bilidown.mergeFailed") + ": " + e.message, "error");
  } finally {
    merging.value = false;
    mergeProgress.value = 0;
  }
};

const triggerCookieImport = () => {
  cookieInput.value?.click();
};

const handleCookieFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    if (content) {
      cookie.value = content.trim();
      localStorage.setItem("bilidown_cookie", cookie.value);
      showToast(t("common.success"));
    }
  };
  reader.readAsText(file);
  if (cookieInput.value) cookieInput.value.value = "";
};

const exportCookie = () => {
  if (!cookie.value) return;
  const blob = new Blob([cookie.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bilibili_cookie.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t("common.downloadSuccess"));
};

const formatSize = (bytes: number) => {
  if (!bytes) return "未知";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
};

const formatDuration = (seconds: number) => {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6 max-w-3xl mx-auto">
      <!-- Input -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
        <div class="flex gap-3 mb-3">
          <div class="relative flex-1">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="inputText"
              type="text"
              :placeholder="$t('bilidown.inputPlaceholder')"
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
            {{ cooldown > 0 ? `${cooldown}s` : $t("bilidown.parseNow") }}
          </button>
        </div>

        <!-- Advanced Settings Toggle -->
        <button
          @click="showAdvanced = !showAdvanced"
          class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings class="h-3.5 w-3.5" />
          {{ $t("bilidown.advancedSettings") }}
          <ChevronDown
            class="h-3.5 w-3.5 transition-transform duration-200"
            :class="{ 'rotate-180': showAdvanced }"
          />
        </button>

        <!-- Advanced Settings -->
        <div
          class="grid transition-all duration-300"
          :class="
            showAdvanced
              ? 'grid-rows-[1fr] opacity-100 mt-3'
              : 'grid-rows-[0fr] opacity-0'
          "
        >
          <div class="overflow-hidden">
            <div class="space-y-3">
              <div>
                <label
                  class="text-xs font-medium text-muted-foreground mb-1.5 block"
                  >{{ $t("bilidown.cookieTip") }}</label
                >
                <textarea
                  v-model="cookie"
                  rows="3"
                  :placeholder="$t('bilidown.cookiePlaceholder')"
                  class="w-full px-4 py-3 bg-background border border-muted rounded-2xl text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all resize-none"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="triggerCookieImport"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all active:scale-95"
                >
                  <Upload class="h-3 w-3" />
                  {{ $t("common.import") }} Cookie
                </button>
                <button
                  v-if="cookie"
                  @click="exportCookie"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all active:scale-95"
                >
                  <Download class="h-3 w-3" />
                  {{ $t("common.export") }} Cookie
                </button>
              </div>
              <input
                ref="cookieInput"
                type="file"
                accept=".txt"
                class="hidden"
                @change="handleCookieFileChange"
              />
            </div>
          </div>
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
          <!-- Video Info Card -->
          <div
            class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
          >
            <div class="md:flex">
              <!-- Cover -->
              <div class="md:w-64 shrink-0">
                <img
                  :src="fixCoverUrl(result.cover)"
                  :alt="result.title"
                  class="w-full h-48 md:h-full object-cover"
                  referrerpolicy="no-referrer"
                />
              </div>
              <!-- Info -->
              <div class="p-5 flex flex-col gap-3 flex-1">
                <h3
                  class="text-base font-bold text-foreground line-clamp-2 leading-snug"
                >
                  {{ result.title }}
                </h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-medium"
                  >
                    {{ result.bvid }}
                  </span>
                  <span
                    v-if="result.duration"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground"
                  >
                    {{ formatDuration(result.duration) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Merge Button -->
          <div
            v-if="selectedVideo && selectedAudio"
            class="bg-card/30 border border-muted/80 rounded-3xl p-5"
          >
            <div class="flex items-center justify-between gap-4 mb-4">
              <div>
                <h4 class="text-sm font-bold mb-0.5">
                  {{ $t("bilidown.mergeDownload") }}
                </h4>
                <p class="text-xs text-muted-foreground">
                  {{ $t("bilidown.firstUseDesc") }}
                </p>
              </div>
            </div>

            <!-- Selected streams -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <!-- Video Stream -->
              <div>
                <label
                  class="text-xs font-medium text-muted-foreground mb-1.5 block"
                  >{{ $t("bilidown.videoStream") }}</label
                >
                <select
                  v-model="selectedVideo"
                  class="w-full px-3 py-2 bg-background border border-muted rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option
                    v-for="vs in result.videoStreams"
                    :key="vs.quality"
                    :value="vs"
                  >
                    {{ vs.qualityDesc }} ({{ vs.width }}×{{ vs.height }})
                  </option>
                </select>
              </div>
              <!-- Audio Stream -->
              <div>
                <label
                  class="text-xs font-medium text-muted-foreground mb-1.5 block"
                  >{{ $t("bilidown.audioStream") }}</label
                >
                <select
                  v-model="selectedAudio"
                  class="w-full px-3 py-2 bg-background border border-muted rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option
                    v-for="as2 in result.audioStreams"
                    :key="as2.id"
                    :value="as2"
                  >
                    {{ as2.quality }} — {{ as2.codecs }}
                  </option>
                </select>
              </div>
            </div>

            <button
              @click="mergeAndDownload"
              :disabled="merging || !selectedVideo || !selectedAudio"
              class="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Loader2 v-if="merging" class="h-4 w-4 animate-spin" />
              <Merge v-else class="h-4 w-4" />
              {{
                merging
                  ? `${$t("bilidown.merging")} ${mergeProgress}%`
                  : $t("bilidown.mergeDownload")
              }}
            </button>

            <!-- Progress Bar -->
            <div
              v-if="merging"
              class="mt-3 h-1.5 bg-muted rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-blue-500 rounded-full transition-all duration-300"
                :style="{ width: `${mergeProgress}%` }"
              />
            </div>
          </div>

          <!-- Video Streams -->
          <div v-if="result.videoStreams.length > 0">
            <h4 class="text-sm font-bold mb-3 px-1 flex items-center gap-2">
              <FileVideo class="h-4 w-4 text-blue-500" />
              {{ $t("bilidown.videoStream") }}
              <span class="text-muted-foreground font-normal">{{
                result.videoStreams.length
              }}</span>
            </h4>
            <div class="space-y-2">
              <div
                v-for="vs in result.videoStreams"
                :key="vs.quality"
                class="bg-card/30 border border-muted/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0"
                  >
                    <FileVideo class="h-4 w-4 text-blue-500" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">
                      {{ vs.qualityDesc }}
                      <span
                        v-if="vs.superscript"
                        class="text-[10px] text-amber-500 ml-1"
                        >{{ vs.superscript }}</span
                      >
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ vs.width }}×{{ vs.height }} · {{ vs.codecs }} ·
                      {{
                        formatSize((vs.bandwidth * (result?.duration || 0)) / 8)
                      }}
                    </p>
                  </div>
                </div>
                <button
                  @click="downloadStream(vs, 'video')"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all active:scale-95 shrink-0"
                >
                  <Download class="h-3 w-3" />
                  {{ $t("common.download") }}
                </button>
              </div>
            </div>
          </div>

          <!-- Audio Streams -->
          <div v-if="result.audioStreams.length > 0">
            <h4 class="text-sm font-bold mb-3 px-1 flex items-center gap-2">
              <FileAudio class="h-4 w-4 text-orange-500" />
              {{ $t("bilidown.audioStream") }}
              <span class="text-muted-foreground font-normal">{{
                result.audioStreams.length
              }}</span>
            </h4>
            <div class="space-y-2">
              <div
                v-for="as2 in result.audioStreams"
                :key="as2.id"
                class="bg-card/30 border border-muted/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0"
                  >
                    <Music class="h-4 w-4 text-orange-500" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">
                      {{ as2.quality }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ as2.codecs }} ·
                      {{
                        formatSize(
                          (as2.bandwidth * (result?.duration || 0)) / 8,
                        )
                      }}
                    </p>
                  </div>
                </div>
                <button
                  @click="downloadStream(as2, 'audio')"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all active:scale-95 shrink-0"
                >
                  <Download class="h-3 w-3" />
                  {{ $t("common.download") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Empty State -->
      <div
        v-if="!result && !loading && !error"
        class="flex flex-col items-center gap-4 py-16 opacity-30"
      >
        <Video class="h-16 w-16" />
        <p class="text-lg font-medium">{{ $t("bilidown.inputPlaceholder") }}</p>
      </div>

      <!-- Disclaimer Dialog -->
      <Transition name="fade">
        <div
          v-if="disclaimerVisible"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          @click.self="disclaimerVisible = false"
        >
          <div
            class="bg-card border rounded-3xl p-6 md:p-8 max-w-md w-full mx-4 space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center"
              >
                <AlertTriangle class="h-5 w-5 text-amber-500" />
              </div>
              <h3 class="text-lg font-bold">
                {{ $t("bilidown.firstUseTitle") }}
              </h3>
            </div>

            <div
              class="text-sm text-muted-foreground space-y-3 leading-relaxed"
            >
              <p>{{ $t("bilidown.disclaimerText") }}</p>
              <ul class="list-disc pl-5 space-y-1.5">
                <li>{{ $t("bilidown.disclaimerItem1") }}</li>
                <li>{{ $t("bilidown.disclaimerItem2") }}</li>
                <li>{{ $t("bilidown.disclaimerItem3") }}</li>
                <li>{{ $t("bilidown.disclaimerItem4") }}</li>
                <li>{{ $t("bilidown.disclaimerItem5") }}</li>
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
                {{ $t("bilidown.agree") }}
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
