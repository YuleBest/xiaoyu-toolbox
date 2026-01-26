<template>
  <ToolContainer id="dydown">
    <div class="max-width-800 mx-auto w-100 py-4 py-md-8">
      <!-- Input Section -->
      <v-card
        variant="flat"
        border
        class="mb-8 rounded-xl overflow-hidden shadow-sm"
      >
        <v-card-text class="pa-6">
          <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
            <v-icon
              icon="mdi-link-variant"
              class="mr-2"
              color="primary"
            ></v-icon>
            视频解析
          </div>
          <v-textarea
            v-model="inputText"
            label="粘贴抖音分享口令或链接"
            placeholder="复制抖音视频链接，在此粘贴..."
            rows="1"
            auto-grow
            variant="solo-filled"
            flat
            bg-color="surface-variant"
            rounded="lg"
            class="mb-4"
            hide-details
            clearable
          ></v-textarea>
          <v-btn
            block
            color="primary"
            size="large"
            rounded="lg"
            :loading="loading"
            elevation="0"
            @click="parseVideo"
            prepend-icon="mdi-magnify-expand"
            class="font-weight-bold"
          >
            立即解析
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Result Section -->
      <v-expand-transition>
        <div v-if="result">
          <v-card
            border
            variant="flat"
            class="rounded-xl overflow-hidden shadow-md"
          >
            <!-- Author Info -->
            <div class="pa-6 border-b bg-surface d-flex align-center">
              <v-avatar color="primary" variant="tonal" size="56" class="mr-4">
                <v-icon icon="mdi-account" size="32"></v-icon>
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold">
                  {{ result.safeNickname }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  发布时间：{{ result.createTime }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-chip
                color="success"
                size="small"
                variant="flat"
                prepend-icon="mdi-check-decagram"
                >状态正常</v-chip
              >
            </div>

            <!-- Content -->
            <v-card-text class="pa-6">
              <!-- Video Preview Area -->
              <div
                v-if="previewUrl"
                class="video-preview-container mb-6 rounded-xl bg-black position-relative"
              >
                <video
                  :src="previewUrl"
                  controls
                  autoplay
                  loop
                  muted
                  playsinline
                  class="rounded-xl"
                ></video>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex flex-column gap-4">
                <v-btn
                  block
                  color="success"
                  size="x-large"
                  rounded="lg"
                  prepend-icon="mdi-download"
                  class="font-weight-bold"
                  elevation="0"
                  @click="downloadVideo"
                >
                  下载无水印视频
                </v-btn>

                <div class="d-flex align-center gap-2">
                  <v-text-field
                    :model-value="fullDownloadUrl"
                    readonly
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    label="直链地址"
                    rounded="lg"
                    class="bg-surface"
                  >
                    <template v-slot:append-inner>
                      <v-btn
                        variant="text"
                        icon="mdi-content-copy"
                        color="primary"
                        density="compact"
                        @click="copy(fullDownloadUrl)"
                      ></v-btn>
                    </template>
                  </v-text-field>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>

      <!-- Empty State / Error Wrapper -->
      <div
        v-if="!result && !loading && !error"
        class="text-center py-10 opacity-30"
      >
        <v-icon size="80" icon="mdi-movie-search-outline" class="mb-4"></v-icon>
        <div class="text-h6">等待解析内容</div>
      </div>

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

.video-preview-container {
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  /* aspect-ratio: 9/16; removed to support all ratios */
  max-height: 600px;
  margin: 0 auto;
  border: 1px solid rgba(var(--v-border-color), 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (min-width: 600px) {
  .video-preview-container {
    max-width: 360px;
  }
}

.video-preview-container video {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain; /* Ensure full video is visible */
}

.gap-2 {
  gap: 8px;
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
</style>

<script lang="ts" setup>
import { ref, computed } from "vue";
import ToolContainer from "@/components/ToolContainer.vue";

const inputText = ref("");
const loading = ref(false);
const result = ref<any>(null);
const error = ref("");

const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("");

const API_BASE = "https://dydown.api.yule.ink";
const API_ENDPOINT = `${API_BASE}/api/parse`;

const fullDownloadUrl = computed(() => {
  if (!result.value || !result.value.downloadApi) return "";
  return `${API_BASE}${result.value.downloadApi}`;
});

const previewUrl = computed(() => {
  if (!result.value || !result.value.videoId) return "";
  return `${API_BASE}/api/preview?videoId=${result.value.videoId}`;
});

const extractShortUrl = (text: string): string | null => {
  if (!text) return null;
  // Clean Unicode
  const cleaned = text
    .normalize("NFKC")
    .replace(/\u200B|\uFEFF/g, "")
    .trim();

  const match = cleaned.match(/https:\/\/v\.douyin\.com\/\S+/);
  return match ? match[0] : null;
};

const parseVideo = async () => {
  error.value = "";
  result.value = null;

  const shortUrl = extractShortUrl(inputText.value);
  if (!shortUrl) {
    error.value = "未识别到有效的抖音短链接";
    return;
  }

  loading.value = true;
  try {
    const resp = await fetch(
      `${API_ENDPOINT}?url=${encodeURIComponent(shortUrl)}`,
    );
    const data = await resp.json();

    if (!data.ok) {
      error.value = data.message || "解析失败";
    } else {
      result.value = data.data;
      showSnackbar("解析成功", "success");
    }
  } catch (e) {
    error.value = "网络请求失败，请稍后重试";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const downloadVideo = () => {
  if (fullDownloadUrl.value) {
    window.open(fullDownloadUrl.value, "_self");
  }
};

const copy = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  showSnackbar("已复制直链", "success");
};

const showSnackbar = (text: string, color: string = "info") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};
</script>
