<template>
  <ToolContainer id="lyric">
    <div class="max-width-800 mx-auto w-100 py-4 py-md-8">
      <!-- Search Section -->
      <v-card
        variant="flat"
        border
        class="mb-8 rounded-xl overflow-hidden shadow-sm"
      >
        <v-card-text class="pa-6">
          <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
            搜索歌曲
          </div>
          <v-text-field
            v-model="searchKeyword"
            label="输入歌名或歌手名"
            placeholder="例如：周杰伦 七里香"
            variant="solo-filled"
            flat
            bg-color="surface-variant"
            rounded="lg"
            class="mb-4"
            hide-details
            clearable
            @keyup.enter="searchSongs"
          ></v-text-field>
          <v-btn
            block
            color="primary"
            size="large"
            rounded="lg"
            :loading="searching"
            :disabled="!searchKeyword || searching"
            elevation="0"
            @click="searchSongs"
            prepend-icon="mdi-magnify"
            class="font-weight-bold"
          >
            搜索歌曲
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Search Results -->
      <v-expand-transition>
        <div v-if="searchResults.length > 0 && showSearchResults">
          <v-card
            border
            variant="flat"
            class="rounded-xl overflow-hidden shadow-md mb-8"
          >
            <v-card-text class="pa-4">
              <div class="text-subtitle-1 font-weight-bold mb-3 px-2">
                搜索结果
              </div>
              <v-list lines="two" class="pa-0">
                <v-list-item
                  v-for="(song, index) in searchResults"
                  :key="song.hash"
                  @click="getLyric(song)"
                  class="rounded-lg mb-2 cursor-pointer hover-bg"
                  :class="{
                    'bg-primary-lighten-5': selectedSong?.hash === song.hash,
                  }"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary" variant="tonal" size="48">
                      <v-icon icon="mdi-music" size="24"></v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    {{ song.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ song.artist }} · {{ song.album }}
                    <span class="text-caption ml-2">
                      {{ formatDuration(song.duration) }}
                    </span>
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-chevron-right"
                      variant="text"
                      size="small"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>

      <!-- Lyric Display -->
      <v-expand-transition>
        <div v-if="lyricText">
          <v-card
            border
            variant="flat"
            class="rounded-xl overflow-hidden shadow-md"
          >
            <!-- Song Info Header -->
            <div class="pa-6 border-b bg-surface d-flex align-center">
              <v-avatar color="primary" variant="tonal" size="56" class="mr-4">
                <v-icon icon="mdi-music-note" size="32"></v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-h6 font-weight-bold">
                  {{ selectedSong?.title }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ selectedSong?.artist }} · {{ selectedSong?.album }}
                </div>
              </div>
            </div>

            <!-- Lyric Content -->
            <v-card-text class="pa-6">
              <!-- Display Mode Toggle -->
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-subtitle-2 text-medium-emphasis">显示模式</div>
                <v-btn-toggle
                  v-model="displayMode"
                  mandatory
                  density="compact"
                  rounded="lg"
                  variant="outlined"
                  divided
                >
                  <v-btn value="timeline" size="small">
                    <v-icon start size="small">mdi-clock-outline</v-icon>
                    时间轴
                  </v-btn>
                  <v-btn value="plain" size="small">
                    <v-icon start size="small">mdi-text</v-icon>
                    纯文本
                  </v-btn>
                </v-btn-toggle>
              </div>

              <!-- Lyric Metadata -->
              <v-card
                v-if="lyricMetadata && Object.keys(lyricMetadata).length > 0"
                variant="tonal"
                class="mb-4 rounded-lg"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex flex-wrap gap-3">
                    <v-chip
                      v-if="lyricMetadata.ar"
                      size="small"
                      variant="flat"
                      prepend-icon="mdi-account-music"
                    >
                      {{ lyricMetadata.ar }}
                    </v-chip>
                    <v-chip
                      v-if="lyricMetadata.al"
                      size="small"
                      variant="flat"
                      prepend-icon="mdi-album"
                    >
                      {{ lyricMetadata.al }}
                    </v-chip>
                    <v-chip
                      v-if="lyricMetadata.by"
                      size="small"
                      variant="flat"
                      prepend-icon="mdi-pencil"
                    >
                      词：{{ lyricMetadata.by }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Lyric Display -->
              <div class="lyric-container mb-6">
                <!-- Timeline Mode -->
                <div v-if="displayMode === 'timeline'" class="lyric-timeline">
                  <div
                    v-for="(line, index) in parsedLyrics"
                    :key="index"
                    class="lyric-line"
                  >
                    <span class="lyric-time">{{ line.time }}</span>
                    <span class="lyric-content">{{ line.text }}</span>
                  </div>
                </div>

                <!-- Plain Text Mode -->
                <div v-else class="lyric-plain">
                  <p
                    v-for="(line, index) in parsedLyrics"
                    :key="index"
                    class="lyric-line-plain"
                  >
                    {{ line.text }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex flex-column gap-4">
                <v-btn
                  block
                  color="success"
                  size="large"
                  rounded="lg"
                  prepend-icon="mdi-download"
                  class="font-weight-bold"
                  elevation="0"
                  @click="downloadLyric"
                >
                  下载歌词文件
                </v-btn>

                <v-btn
                  block
                  color="primary"
                  size="large"
                  rounded="lg"
                  variant="outlined"
                  prepend-icon="mdi-content-copy"
                  class="font-weight-bold"
                  @click="copyLyric"
                >
                  复制歌词
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>

      <!-- Empty State -->
      <div
        v-if="!lyricText && !searching && searchResults.length === 0"
        class="text-center py-10 opacity-30"
      >
        <v-icon size="80" icon="mdi-music-note-outline" class="mb-4"></v-icon>
        <div class="text-h6">搜索歌曲以获取歌词</div>
      </div>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mt-6 rounded-lg"
        closable
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>
    </div>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      location="top"
      :color="snackbarColor"
      rounded="lg"
    >
      {{ snackbarText }}
    </v-snackbar>
  </ToolContainer>
</template>

<style scoped>
.max-width-800 {
  max-width: 800px;
}

.lyric-container {
  background-color: transparent;
  border-radius: 12px;
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

/* Timeline Mode Styles */
.lyric-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lyric-line {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.05);
}

.lyric-line:last-child {
  border-bottom: none;
}

.lyric-time {
  font-family: "Courier New", monospace;
  font-size: 13px;
  color: rgba(var(--v-theme-primary), 0.8);
  font-weight: 600;
  min-width: 70px;
  flex-shrink: 0;
  background-color: rgba(var(--v-theme-primary), 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  text-align: center;
}

.lyric-content {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-surface), 0.87);
  flex: 1;
}

/* Plain Text Mode Styles */
.lyric-plain {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lyric-line-plain {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin: 0;
  padding: 6px 0;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.shadow-sm {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
}

.shadow-md {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.opacity-30 {
  opacity: 0.3;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cursor-pointer {
  cursor: pointer;
}

.hover-bg {
  transition: background-color 0.2s;
}

.hover-bg:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>

<script lang="ts" setup>
import { ref, computed } from "vue";
import ToolContainer from "@/components/ToolContainer.vue";

interface Song {
  title: string;
  artist: string;
  album: string;
  hash: string;
  duration: number;
}

interface LyricLine {
  time: string;
  text: string;
}

interface LyricMetadata {
  ar?: string; // artist
  ti?: string; // title
  al?: string; // album
  by?: string; // lyricist
  [key: string]: string | undefined;
}

const searchKeyword = ref("");
const searching = ref(false);
const searchResults = ref<Song[]>([]);
const showSearchResults = ref(true);
const selectedSong = ref<Song | null>(null);
const lyricText = ref("");
const error = ref("");

const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("");

// Lyric display
const displayMode = ref<"timeline" | "plain">("timeline");
const lyricMetadata = ref<LyricMetadata>({});
const parsedLyrics = ref<LyricLine[]>([]);

const API_BASE = "https://lyric.api.yule.ink";

// Parse LRC format lyric
const parseLyric = (lrcText: string) => {
  const lines = lrcText.split("\n");
  const metadata: LyricMetadata = {};
  const lyrics: LyricLine[] = [];

  // Regex patterns
  const metaPattern = /^\[(\w+):([^\]]+)\]$/;
  const timePattern = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$/;

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    // Try to match metadata
    const metaMatch = line.match(metaPattern);
    if (metaMatch && metaMatch[1] && metaMatch[2]) {
      const key = metaMatch[1];
      const value = metaMatch[2];
      metadata[key.toLowerCase()] = value.trim();
      return;
    }

    // Try to match time-stamped lyric
    const timeMatch = line.match(timePattern);
    if (timeMatch && timeMatch[1] && timeMatch[2]) {
      const minutes = timeMatch[1];
      const seconds = timeMatch[2];
      const text = timeMatch[4] || "";
      const timeStr = `${minutes}:${seconds}`;
      lyrics.push({
        time: timeStr,
        text: text.trim() || "♪",
      });
    }
  });

  lyricMetadata.value = metadata;
  parsedLyrics.value = lyrics;
};

const searchSongs = async () => {
  if (!searchKeyword.value.trim()) return;

  error.value = "";
  searchResults.value = [];
  lyricText.value = "";
  selectedSong.value = null;
  parsedLyrics.value = [];
  lyricMetadata.value = {};
  showSearchResults.value = true;
  searching.value = true;

  try {
    const resp = await fetch(
      `${API_BASE}/search?keyword=${encodeURIComponent(searchKeyword.value)}`,
    );
    const data = await resp.json();

    if (Array.isArray(data) && data.length > 0) {
      searchResults.value = data;
      showSnackbar(`找到 ${data.length} 首歌曲`, "success");
    } else {
      error.value = "未找到相关歌曲，请尝试其他关键词";
    }
  } catch (e) {
    error.value = "搜索失败，请检查网络连接";
    console.error(e);
  } finally {
    searching.value = false;
  }
};

const getLyric = async (song: Song) => {
  selectedSong.value = song;
  lyricText.value = "";
  error.value = "";
  parsedLyrics.value = [];
  lyricMetadata.value = {};
  showSearchResults.value = false; // 隐藏搜索结果

  try {
    const resp = await fetch(`${API_BASE}/lyric?hash=${song.hash}`);
    const text = await resp.text();

    if (text && text.trim()) {
      lyricText.value = text;
      parseLyric(text);
      showSnackbar("歌词加载成功", "success");
    } else {
      error.value = "该歌曲暂无歌词";
    }
  } catch (e) {
    error.value = "歌词加载失败，请稍后重试";
    console.error(e);
  }
};

const downloadLyric = () => {
  if (!lyricText.value || !selectedSong.value) return;

  const blob = new Blob([lyricText.value], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${selectedSong.value.artist} - ${selectedSong.value.title}.lrc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showSnackbar("歌词文件已下载", "success");
};

const copyLyric = () => {
  if (!lyricText.value) return;

  navigator.clipboard.writeText(lyricText.value);
  showSnackbar("歌词已复制到剪贴板", "success");
};

const showSnackbar = (text: string, color: string = "info") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
</script>
