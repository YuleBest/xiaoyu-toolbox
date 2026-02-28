<script setup lang="ts">
import { ref, inject } from "vue";
import { useI18n } from "vue-i18n";
import { Search, Music, Copy, Info, Download } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { getPlaylistTracks, type NcmSong } from "@/api/ncm";

const { t } = useI18n();
const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "ncm-get-playlist")!;

const inputValue = ref("");
const songs = ref<NcmSong[]>([]);
const loading = ref(false);
const error = ref("");
const parsedId = ref("");
const limit = ref<number>(200);
const offset = ref<number>(0);
const chunkSize = ref<number>(50);

// Added state for incremental loading
const loadingProgress = ref({ fetched: 0, total: 0 });

const extractId = (input: string): string => {
  input = input.trim();
  if (/^\d+$/.test(input)) {
    return input;
  }
  const match = input.match(/[?&]id=(\d+)/);
  if (match) {
    return match[1] || "";
  }
  // Also try to match general number from URL if not formatted right
  const pureNumMatch = input.match(/(\d+)/);
  if (pureNumMatch && input.includes("music.163.com")) {
    return pureNumMatch[1] || "";
  }
  return "";
};

const handleFetch = async () => {
  const id = extractId(inputValue.value);
  if (!id) {
    error.value = t("ncm-get-playlist.parseFailed");
    return;
  }

  const requestedLimit = limit.value || 200;
  let currentOffset = offset.value || 0;
  // Ensure chunk size is at least 1 and capped at a reasonable max (e.g. 500) if user inputs something crazy, though max in UI is 50.
  const currentChunkSize = Math.max(1, Math.min(chunkSize.value || 50, 500));

  parsedId.value = id;
  loading.value = true;
  error.value = "";
  songs.value = [];
  loadingProgress.value = { fetched: 0, total: requestedLimit };

  try {
    const chunks: { limit: number; offset: number }[] = [];
    let tempRemaining = requestedLimit;
    let tempOffset = currentOffset;

    while (tempRemaining > 0) {
      const fetchSize = Math.min(tempRemaining, currentChunkSize);
      chunks.push({ limit: fetchSize, offset: tempOffset });
      tempOffset += fetchSize;
      tempRemaining -= fetchSize;
    }

    const results = new Array(chunks.length).fill([]);

    // Concurrently fetch all chunks
    await Promise.all(
      chunks.map(async (chunk, index) => {
        try {
          const result = await getPlaylistTracks(id, chunk.limit, chunk.offset);
          results[index] = result || [];
          loadingProgress.value.fetched += results[index].length;
        } catch (e) {
          console.error(`Fetch chunk ${index} failed`, e);
          results[index] = [];
        }
      }),
    );

    // Combine results in order. Add everything retrieved.
    for (let i = 0; i < chunks.length; i++) {
      const res = results[i];
      if (res && res.length > 0) {
        songs.value.push(...res);
      }
    }

    if (songs.value.length > 0) {
      showToast(t("common.success"));
    } else {
      error.value = t("ncm-get-playlist.noData");
    }
  } catch (_e) {
    error.value = t("ncm-get-playlist.parseFailed");
  } finally {
    loading.value = false;
  }
};

const copyAll = async () => {
  if (!songs.value.length) return;
  const text = songs.value
    .map((s) => `${s.name} - ${s.ar.map((a) => a.name).join("/")}`)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    showToast(t("common.copySuccess"));
  } catch {
    showToast(t("common.copyFailed"), "error");
  }
};

const triggerDownload = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(t("common.downloadSuccess"));
};

const exportTxt = () => {
  if (!songs.value.length) return;
  const content = songs.value
    .map((s) => `${s.name} - ${s.ar.map((a) => a.name).join("/")}`)
    .join("\r\n");
  triggerDownload(
    `playlist_${parsedId.value}.txt`,
    content,
    "text/plain;charset=utf-8",
  );
};

const exportCsv = () => {
  if (!songs.value.length) return;
  const header = "序号,歌曲名,歌手,专辑\r\n";
  const rows = songs.value
    .map((s, idx) => {
      const name = `"${s.name.replace(/"/g, '""')}"`;
      const artists = `"${s.ar
        .map((a) => a.name)
        .join("/")
        .replace(/"/g, '""')}"`;
      const album = `"${(s.al?.name || "").replace(/"/g, '""')}"`;
      return `${idx + 1},${name},${artists},${album}`;
    })
    .join("\r\n");
  const content = "\ufeff" + header + rows; // Add BOM for Excel UTF-8
  triggerDownload(
    `playlist_${parsedId.value}.csv`,
    content,
    "text/csv;charset=utf-8",
  );
};

const exportJson = () => {
  if (!songs.value.length) return;
  const content = JSON.stringify(songs.value, null, 2);
  triggerDownload(
    `playlist_${parsedId.value}.json`,
    content,
    "application/json;charset=utf-8",
  );
};
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <!-- Operations moved to results list due to space constraints -->
    </template>

    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Input Area -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="inputValue"
              type="text"
              :placeholder="$t('ncm-get-playlist.inputPlaceholder')"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              @keyup.enter="handleFetch"
            />
          </div>
          <button
            :disabled="!inputValue.trim() || loading"
            class="px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
            @click="handleFetch"
          >
            <div
              v-if="loading"
              class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            <Search v-else class="h-4 w-4" />
            {{ $t("ncm-get-playlist.parse") }}
          </button>
        </div>

        <div class="mt-4 flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2">
            <label class="text-xs text-muted-foreground">{{
              $t("ncm-get-playlist.limit")
            }}</label>
            <input
              v-model.number="limit"
              type="number"
              min="1"
              class="w-24 px-3 py-1.5 bg-background border border-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-muted-foreground">{{
              $t("ncm-get-playlist.offset")
            }}</label>
            <input
              v-model.number="offset"
              type="number"
              min="0"
              class="w-24 px-3 py-1.5 bg-background border border-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-xs text-muted-foreground">{{
              $t("ncm-get-playlist.chunkSize")
            }}</label>
            <input
              v-model.number="chunkSize"
              type="number"
              min="1"
              max="1000"
              class="w-24 px-3 py-1.5 bg-background border border-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        <p
          v-if="parsedId && !error && !loading"
          class="mt-3 text-sm text-green-500 flex items-center gap-1.5 ml-1"
        >
          <Info class="h-4 w-4" />
          {{ $t("ncm-get-playlist.idExtracted", { id: parsedId }) }}
        </p>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="px-5 py-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-start gap-3"
      >
        <Info class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <p class="text-sm text-destructive font-medium">{{ error }}</p>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center gap-4 py-16"
      >
        <div
          class="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        ></div>
        <div class="flex flex-col items-center gap-1">
          <span class="text-sm font-medium text-foreground">
            已获取 {{ loadingProgress.fetched }} /
            {{ loadingProgress.total }} 首
          </span>
          <span class="text-xs text-muted-foreground">{{
            $t("ncm-get-playlist.parsing")
          }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && songs.length === 0 && !error"
        class="flex flex-col items-center gap-4 py-16 opacity-30"
      >
        <Music class="h-16 w-16" />
        <p class="text-lg font-medium">
          {{ $t("ncm-get-playlist.inputPlaceholder") }}
        </p>
      </div>

      <!-- Results List -->
      <Transition name="slide">
        <div
          v-if="songs.length > 0 && !loading"
          class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
        >
          <div
            class="px-5 py-4 border-b border-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/10"
          >
            <h3 class="text-sm font-semibold text-foreground shrink-0">
              {{ $t("ncm-get-playlist.songCount", { count: songs.length }) }}
            </h3>

            <div class="flex flex-wrap items-center gap-2">
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-lg transition-all active:scale-95"
                @click="copyAll"
              >
                <Copy class="h-3.5 w-3.5" />
                <span class="hidden sm:inline">{{
                  $t("ncm-get-playlist.copySongs")
                }}</span>
                <span class="sm:hidden">复制</span>
              </button>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-muted hover:bg-muted text-foreground rounded-lg transition-all active:scale-95"
                @click="exportTxt"
              >
                <Download class="h-3.5 w-3.5" />
                <span class="hidden sm:inline">{{
                  $t("ncm-get-playlist.exportTxt")
                }}</span>
                <span class="sm:hidden">TXT</span>
              </button>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-muted hover:bg-muted text-foreground rounded-lg transition-all active:scale-95"
                @click="exportCsv"
              >
                <Download class="h-3.5 w-3.5" />
                <span class="hidden sm:inline">{{
                  $t("ncm-get-playlist.exportCsv")
                }}</span>
                <span class="sm:hidden">CSV</span>
              </button>
              <button
                class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-muted hover:bg-muted text-foreground rounded-lg transition-all active:scale-95"
                @click="exportJson"
              >
                <Download class="h-3.5 w-3.5" />
                <span class="hidden sm:inline">{{
                  $t("ncm-get-playlist.exportJson")
                }}</span>
                <span class="sm:hidden">JSON</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead
                class="text-xs text-muted-foreground bg-muted/30 uppercase"
              >
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-4 font-medium rounded-tl-xl w-16 text-center"
                  >
                    #
                  </th>
                  <th scope="col" class="px-6 py-4 font-medium">
                    {{ $t("ncm-get-playlist.songName") }}
                  </th>
                  <th scope="col" class="px-6 py-4 font-medium">
                    {{ $t("ncm-get-playlist.artist") }}
                  </th>
                  <th scope="col" class="px-6 py-4 font-medium rounded-tr-xl">
                    {{ $t("ncm-get-playlist.album") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-muted/20">
                <tr
                  v-for="(song, index) in songs"
                  :key="song.id"
                  class="hover:bg-muted/10 transition-colors group"
                >
                  <td
                    class="px-6 py-4 text-center text-muted-foreground/60 w-16"
                  >
                    {{ index + 1 }}
                  </td>
                  <td
                    class="px-6 py-4 font-medium text-foreground max-w-[200px] truncate"
                    :title="song.name"
                  >
                    <div class="flex items-center gap-3">
                      <img
                        v-if="song.al?.picUrl"
                        :src="song.al.picUrl + '?param=50y50'"
                        class="w-10 h-10 rounded-lg object-cover shadow-sm bg-muted shrink-0"
                        loading="lazy"
                      />
                      <div
                        v-else
                        class="w-10 h-10 rounded-lg bg-muted shrink-0 flex items-center justify-center"
                      >
                        <Music class="h-4 w-4 text-muted-foreground/30" />
                      </div>
                      <span class="truncate">{{ song.name }}</span>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 text-muted-foreground max-w-[150px] truncate"
                    :title="song.ar.map((a) => a.name).join('/')"
                  >
                    {{ song.ar.map((a) => a.name).join(" / ") }}
                  </td>
                  <td
                    class="px-6 py-4 text-muted-foreground max-w-[150px] truncate"
                    :title="song.al?.name"
                  >
                    {{ song.al?.name || "" }}
                  </td>
                </tr>
              </tbody>
            </table>
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
</style>
