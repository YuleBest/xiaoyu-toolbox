<template>
  <ToolContainer id="dydown">
    <v-card class="h-100 d-flex flex-column" variant="flat">
      <div class="d-flex flex-column h-100">
        <!-- Input Area -->
        <v-card variant="outlined" class="mb-6">
          <v-card-text>
            <v-textarea
              v-model="inputText"
              label="粘贴抖音分享口令或链接"
              placeholder="3.60 i@N.sE 11/17 复制此链接，打开Dou音搜索，直接观看视频！"
              rows="3"
              auto-grow
              variant="outlined"
              color="black"
              hide-details
              class="mb-4"
              clearable
            ></v-textarea>
            <v-btn
              block
              color="black"
              size="large"
              :loading="loading"
              @click="parseVideo"
              prepend-icon="mdi-cloud-download"
            >
              解析视频
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Result Area -->
        <v-expand-transition>
          <div v-if="result" class="flex-grow-1 overflow-auto">
            <v-card border variant="flat" class="bg-grey-lighten-5">
              <v-card-item>
                <template v-slot:prepend>
                  <v-avatar color="surface" variant="flat" size="48">
                    <v-icon icon="mdi-account" color="black"></v-icon>
                  </v-avatar>
                </template>
                <v-card-title>{{ result.safeNickname }}</v-card-title>
                <v-card-subtitle>{{ result.createTime }}</v-card-subtitle>
              </v-card-item>

              <v-card-text>
                <!-- Video Preview -->
                <div
                  v-if="previewUrl"
                  class="mb-4 bg-black rounded-lg overflow-hidden position-relative"
                  style="min-height: 200px; max-height: 500px"
                >
                  <video
                    :src="previewUrl"
                    controls
                    autoplay
                    loop
                    class="w-100 h-100"
                    style="
                      display: block;
                      object-fit: contain;
                      max-height: 500px;
                    "
                  ></video>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <v-btn
                    @click="downloadVideo"
                    color="primary"
                    prepend-icon="mdi-download"
                    variant="flat"
                  >
                    下载视频
                  </v-btn>
                </div>

                <v-alert
                  title="下载提示"
                  text="点击“下载视频”应自动开始下载。如果未开始，请复制下方链接手动下载。"
                  type="info"
                  variant="tonal"
                  class="mt-4"
                  density="compact"
                ></v-alert>

                <v-text-field
                  :model-value="fullDownloadUrl"
                  readonly
                  variant="outlined"
                  density="compact"
                  class="mt-4"
                  label="视频下载链接"
                  append-inner-icon="mdi-content-copy"
                  @click:append-inner="copy(fullDownloadUrl)"
                ></v-text-field>
              </v-card-text>
            </v-card>
          </div>
        </v-expand-transition>

        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>
      </div>
    </v-card>

    <v-snackbar v-model="snackbar" location="top" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </ToolContainer>
</template>

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
      `${API_ENDPOINT}?url=${encodeURIComponent(shortUrl)}`
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
