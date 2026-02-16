<script setup lang="ts">
import { ref, inject, nextTick } from "vue";
import {
  Search,
  Music,
  Copy,
  Download,
  ChevronRight,
  Clock,
  AlignLeft,
  User,
  Disc3,
  Pen,
  Info,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  searchSongs as apiSearchSongs,
  getLyricJson,
  getLyricLrc,
  type Song,
  type LyricMetadata,
} from "@/api/lyric";

const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "lyric")!;

// --- Interfaces ---
interface ParsedLyricLine {
  time: string;
  seconds: number;
  text: string;
}

// --- State ---
const searchKeyword = ref("");
const searching = ref(false);
const searchResults = ref<Song[]>([]);
const showSearchResults = ref(true);
const selectedSong = ref<Song | null>(null);
const error = ref("");

// Lyric display
const displayMode = ref<"timeline" | "plain">("timeline");
const lyricMetadata = ref<LyricMetadata>({});
const parsedLyrics = ref<ParsedLyricLine[]>([]);
const currentTime = ref(0);
const lyricContainer = ref<HTMLElement | null>(null);
const lineRefs = ref<HTMLElement[]>([]);
const loadingLyric = ref(false);

// --- Methods ---
const formatDuration = (seconds: number) => {
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const handleSearch = async () => {
  const kw = searchKeyword.value.trim();
  if (!kw) return;

  error.value = "";
  searchResults.value = [];
  selectedSong.value = null;
  parsedLyrics.value = [];
  lyricMetadata.value = {};
  showSearchResults.value = true;
  searching.value = true;

  try {
    const data = await apiSearchSongs(kw);
    if (Array.isArray(data) && data.length > 0) {
      searchResults.value = data;
      showToast(`找到 ${data.length} 首歌曲`);
    } else {
      error.value = "未找到相关歌曲，请尝试其他关键词";
    }
  } catch {
    error.value = "搜索失败，请检查网络连接";
  } finally {
    searching.value = false;
  }
};

const handleGetLyric = async (song: Song) => {
  selectedSong.value = song;
  error.value = "";
  parsedLyrics.value = [];
  lyricMetadata.value = {};
  showSearchResults.value = false;
  loadingLyric.value = true;

  try {
    const data = await getLyricJson(song.hash);

    if (data && data.lyrics && data.lyrics.length > 0) {
      lyricMetadata.value = data.info || {};
      currentTime.value = 0;
      lineRefs.value = [];

      parsedLyrics.value = data.lyrics.map((item) => {
        const parts = item.time.split(":");
        const seconds =
          parseFloat(parts[0] || "0") * 60 + parseFloat(parts[1] || "0");
        return {
          time: item.time,
          seconds,
          text: item.text || "♪",
        };
      });
      showToast("歌词加载成功");
    } else {
      error.value = "该歌曲暂无歌词";
    }
  } catch {
    error.value = "歌词加载失败，请稍后重试";
  } finally {
    loadingLyric.value = false;
  }
};

const downloadLyric = async () => {
  if (!selectedSong.value) return;

  try {
    const text = await getLyricLrc(selectedSong.value.hash);
    if (!text || !text.trim()) {
      showToast("歌词内容为空", "error");
      return;
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedSong.value.artist} - ${selectedSong.value.title}.lrc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("歌词文件已下载");
  } catch {
    showToast("下载失败，请稍后重试", "error");
  }
};

const copyLyric = async () => {
  if (!selectedSong.value) return;

  try {
    const text = await getLyricLrc(selectedSong.value.hash);
    if (!text || !text.trim()) {
      showToast("歌词内容为空", "error");
      return;
    }

    await navigator.clipboard.writeText(text);
    showToast("歌词已复制到剪贴板");
  } catch {
    showToast("复制失败", "error");
  }
};

const backToResults = () => {
  showSearchResults.value = true;
  selectedSong.value = null;
  parsedLyrics.value = [];
  lyricMetadata.value = {};
};

const scrollToTime = () => {
  if (!parsedLyrics.value.length || !lyricContainer.value) return;

  let activeIndex = 0;
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    const line = parsedLyrics.value[i];
    if (line && line.seconds <= currentTime.value) {
      activeIndex = i;
    } else if (line && line.seconds > currentTime.value) {
      break;
    }
  }

  const activeElement = lineRefs.value[activeIndex];
  if (activeElement && lyricContainer.value) {
    const container = lyricContainer.value;
    const top =
      activeElement.offsetTop -
      container.offsetTop -
      container.clientHeight / 2 +
      activeElement.clientHeight / 2;
    container.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  }
};

const isCurrentLine = (index: number) => {
  if (!parsedLyrics.value.length) return false;
  const line = parsedLyrics.value[index];
  const nextLine = parsedLyrics.value[index + 1];
  if (!line) return false;

  if (nextLine) {
    return (
      currentTime.value >= line.seconds && currentTime.value < nextLine.seconds
    );
  }
  return currentTime.value >= line.seconds;
};

const onSliderInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  currentTime.value = parseFloat(target.value);
  nextTick(() => scrollToTime());
};
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <button
          v-if="parsedLyrics.length > 0"
          @click="copyLyric"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-all active:scale-95"
        >
          <Copy class="h-4 w-4" />
          <span class="hidden sm:inline">复制歌词</span>
        </button>
        <button
          v-if="parsedLyrics.length > 0"
          @click="downloadLyric"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all active:scale-95"
        >
          <Download class="h-4 w-4" />
          <span class="hidden sm:inline">下载 LRC</span>
        </button>
      </div>
    </template>

    <div class="space-y-6 max-w-3xl mx-auto">
      <!-- Search Bar -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="输入歌名或歌手名，例如「周杰伦 七里香」"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              @keyup.enter="handleSearch"
            />
          </div>
          <button
            @click="handleSearch"
            :disabled="!searchKeyword.trim() || searching"
            class="px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
          >
            <div
              v-if="searching"
              class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            <Search v-else class="h-4 w-4" />
            搜索
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

      <!-- Search Results -->
      <Transition name="slide">
        <div
          v-if="searchResults.length > 0 && showSearchResults"
          class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
        >
          <div class="px-5 py-4 border-b border-muted/30">
            <h3 class="text-sm font-semibold text-foreground">
              搜索结果
              <span class="text-muted-foreground font-normal ml-1"
                >{{ searchResults.length }} 首</span
              >
            </h3>
          </div>
          <div class="divide-y divide-muted/20 max-h-[400px] overflow-y-auto">
            <button
              v-for="song in searchResults"
              :key="song.hash"
              @click="handleGetLyric(song)"
              class="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-muted/10 transition-colors group"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">
                  {{ song.title }}
                </p>
                <p class="text-xs text-muted-foreground truncate mt-0.5">
                  {{ song.artist }} · {{ song.album }} ·
                  {{ formatDuration(song.duration) }}
                </p>
              </div>
              <ChevronRight
                class="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </button>
          </div>
        </div>
      </Transition>

      <!-- Loading Lyric -->
      <div
        v-if="loadingLyric"
        class="flex items-center justify-center gap-3 py-12"
      >
        <div
          class="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-sm text-muted-foreground font-medium"
          >正在加载歌词...</span
        >
      </div>

      <!-- Lyric Display -->
      <Transition name="slide">
        <div v-if="parsedLyrics.length > 0 && !loadingLyric" class="space-y-5">
          <!-- Song Info Header -->
          <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-foreground truncate">
                  {{ selectedSong?.title }}
                </h3>
                <p class="text-sm text-muted-foreground truncate">
                  {{ selectedSong?.artist }} · {{ selectedSong?.album }}
                </p>
              </div>
              <button
                @click="backToResults"
                class="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl hover:bg-muted/30 transition-all shrink-0"
              >
                返回结果
              </button>
            </div>

            <!-- Metadata Chips -->
            <div
              v-if="
                lyricMetadata &&
                (lyricMetadata.ar || lyricMetadata.al || lyricMetadata.by)
              "
              class="flex flex-wrap gap-2 mb-5"
            >
              <span
                v-if="lyricMetadata.ar"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-medium"
              >
                <User class="h-3 w-3" />
                {{ lyricMetadata.ar }}
              </span>
              <span
                v-if="lyricMetadata.al"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-500 text-xs font-medium"
              >
                <Disc3 class="h-3 w-3" />
                {{ lyricMetadata.al }}
              </span>
              <span
                v-if="lyricMetadata.by"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium"
              >
                <Pen class="h-3 w-3" />
                词：{{ lyricMetadata.by }}
              </span>
            </div>

            <!-- Progress Slider -->
            <div class="space-y-2">
              <div
                class="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>{{ formatDuration(currentTime) }}</span>
                <span>{{ formatDuration(selectedSong?.duration || 0) }}</span>
              </div>
              <input
                type="range"
                :value="currentTime"
                :max="selectedSong?.duration || 0"
                step="0.1"
                class="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue-500/30 [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform"
                @input="onSliderInput"
              />
            </div>
          </div>

          <!-- Display Mode Toggle -->
          <div class="flex items-center justify-between px-2">
            <span class="text-sm text-muted-foreground"
              >{{ parsedLyrics.length }} 行歌词</span
            >
            <div class="flex items-center bg-muted/30 rounded-xl p-1 gap-0.5">
              <button
                @click="displayMode = 'timeline'"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                :class="
                  displayMode === 'timeline'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                "
              >
                <Clock class="h-3.5 w-3.5" />
                时间轴
              </button>
              <button
                @click="displayMode = 'plain'"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                :class="
                  displayMode === 'plain'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                "
              >
                <AlignLeft class="h-3.5 w-3.5" />
                纯文本
              </button>
            </div>
          </div>

          <!-- Lyric Content -->
          <div
            ref="lyricContainer"
            class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden max-h-[500px] overflow-y-auto scroll-smooth"
          >
            <!-- Timeline Mode -->
            <div
              v-if="displayMode === 'timeline'"
              class="p-4 md:p-5 space-y-0.5"
            >
              <div
                v-for="(line, index) in parsedLyrics"
                :key="index"
                :ref="
                  (el) => {
                    if (el) lineRefs[index] = el as HTMLElement;
                  }
                "
                class="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-300"
                :class="{
                  'bg-blue-500/8': isCurrentLine(index),
                }"
              >
                <span
                  class="font-mono text-[12px] font-semibold min-w-[60px] shrink-0 text-center px-2 py-0.5 rounded-md transition-all duration-300"
                  :class="
                    isCurrentLine(index)
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted/50 text-muted-foreground/60'
                  "
                >
                  {{ line.time }}
                </span>
                <span
                  class="text-[14px] leading-relaxed transition-all duration-300"
                  :class="
                    isCurrentLine(index)
                      ? 'text-blue-500 font-bold'
                      : 'text-foreground/70'
                  "
                >
                  {{ line.text }}
                </span>
              </div>
            </div>

            <!-- Plain Text Mode -->
            <div v-else class="p-5 md:p-6 space-y-1">
              <p
                v-for="(line, index) in parsedLyrics"
                :key="index"
                class="text-[14px] leading-loose text-foreground/80"
              >
                {{ line.text }}
              </p>
            </div>
          </div>

          <!-- Action Buttons (mobile-friendly) -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="downloadLyric"
              class="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-background border border-muted text-foreground rounded-2xl font-medium transition-all hover:bg-muted active:scale-[0.98]"
            >
              <Download class="h-4 w-4" />
              下载歌词文件
            </button>
            <button
              @click="copyLyric"
              class="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-background border border-muted text-foreground rounded-2xl font-medium transition-all hover:bg-muted active:scale-[0.98]"
            >
              <Copy class="h-4 w-4" />
              复制歌词
            </button>
          </div>
        </div>
      </Transition>

      <!-- Empty State -->
      <div
        v-if="
          parsedLyrics.length === 0 &&
          !searching &&
          !loadingLyric &&
          searchResults.length === 0 &&
          !error
        "
        class="flex flex-col items-center gap-4 py-16 opacity-30"
      >
        <Music class="h-16 w-16" />
        <p class="text-lg font-medium">搜索歌曲以获取歌词</p>
      </div>
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
</style>
