<template>
  <ToolContainer id="bilidown">
    <div class="max-width-800 mx-auto w-100 py-4 py-md-8">
      <!-- Input Section -->
      <v-card
        variant="flat"
        border
        class="mb-8 rounded-xl overflow-hidden shadow-sm"
      >
        <v-card-text class="pa-6">
          <v-textarea
            v-model="inputText"
            label="粘贴 BV 号"
            placeholder="BV..."
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

          <v-expansion-panels variant="accordion" class="mb-4 custom-panels">
            <v-expansion-panel
              elevation="0"
              bg-color="transparent"
              class="border rounded-lg"
            >
              <v-expansion-panel-title
                class="py-2 text-body-2 text-medium-emphasis"
              >
                <v-icon icon="mdi-cookie" size="18" class="mr-2"></v-icon>
                高级设置 (可选 Cookie)
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="text-caption text-medium-emphasis mb-3">
                  未登录状态下最高只能获取 480P。填写 <b>完整 Cookie</b> 可开启
                  1080P+ 高清画质解析。
                </div>

                <div
                  class="bg-surface-variant pa-4 rounded-lg mb-4 text-caption line-height-1-6"
                >
                  <div class="font-weight-bold mb-2 d-flex align-center">
                    <v-icon
                      icon="mdi-help-circle-outline"
                      size="16"
                      class="mr-1"
                    ></v-icon>
                    如何获取完整 Cookie？
                  </div>
                  1. 电脑端浏览器登录 B 站账号<br />
                  2. 按 <b>F12</b> 进入开发者工具，选择
                  <b>“网络 (Network)”</b> 面板<br />
                  3. 按 <b>Ctrl + R</b> 刷新，在列表最上方找到
                  <b>www.bilibili.com</b> 并点击<br />
                  4. 在右侧 <b>“标头 (Headers)”</b> ->
                  <b>“请求标头 (Request Headers)”</b> 中找到 <b>cookie</b><br />
                  5. 复制全部内容并粘贴到下方文本框中
                </div>

                <v-text-field
                  v-model="cookie"
                  label="完整 Cookie"
                  placeholder="在此粘贴 Request Headers 中的 cookie 内容..."
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details
                >
                  <template v-slot:append-inner>
                    <v-tooltip text="从文件导入 Cookie">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-file-import-outline"
                          variant="text"
                          density="compact"
                          @click="triggerCookieImport"
                        ></v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip v-if="cookie" text="导出当前 Cookie 到文件">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-file-export-outline"
                          variant="text"
                          density="compact"
                          @click="exportCookieFile"
                        ></v-btn>
                      </template>
                    </v-tooltip>
                  </template>
                </v-text-field>

                <input
                  type="file"
                  ref="cookieInput"
                  accept=".txt"
                  class="d-none"
                  @change="handleCookieFileChange"
                />

                <v-alert
                  density="compact"
                  variant="text"
                  color="success"
                  class="pa-0 mt-3 text-caption"
                  icon="mdi-shield-check-outline"
                >
                  本站严格保护隐私：您的 Cookie
                  仅用作解析凭据发送至接口，本站不会进行任何持久化存储、记录或挪作他用。
                </v-alert>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-btn
            block
            color="#FB7299"
            size="large"
            rounded="lg"
            :loading="loading"
            :disabled="cooldown > 0"
            elevation="0"
            @click="handleParse(false)"
            prepend-icon="mdi-magnify-expand"
            class="font-weight-bold text-white"
          >
            {{ cooldown > 0 ? `等待冷却 (${cooldown}s)` : "立即解析" }}
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
            <!-- Video Info -->
            <div
              class="pa-6 border-b bg-surface d-flex flex-column flex-sm-row align-center align-sm-start"
            >
              <v-img
                :src="fixCoverUrl(result.cover)"
                min-width="200"
                max-width="200"
                width="200"
                aspect-ratio="16/9"
                cover
                referrerpolicy="no-referrer"
                class="rounded-lg mb-4 mb-sm-0 mr-sm-6 shadow-sm flex-shrink-0 video-cover"
              >
                <template v-slot:placeholder>
                  <div
                    class="d-flex align-center justify-center fill-height bg-surface-variant"
                  >
                    <v-progress-circular
                      indeterminate
                      color="#FB7299"
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>
              <div class="flex-grow-1 text-center text-sm-left">
                <div class="text-h6 font-weight-bold mb-2 line-clamp-2">
                  {{ result.title }}
                </div>
                <div
                  class="d-flex flex-wrap justify-center justify-sm-start gap-2 mb-2"
                >
                  <v-chip size="small" variant="tonal" color="primary">
                    BV号: {{ result.bvid }}
                  </v-chip>
                  <v-chip size="small" variant="tonal" color="secondary">
                    时长: {{ formatDuration(result.duration) }}
                  </v-chip>
                </div>
                <div class="text-caption text-medium-emphasis">
                  CID: {{ result.cid }}
                </div>
              </div>
            </div>

            <v-card-text class="pa-6">
              <!-- Merge Section -->
              <div class="mb-8">
                <v-card
                  variant="tonal"
                  border
                  color="#FB7299"
                  class="rounded-xl overflow-hidden"
                >
                  <v-card-text class="pa-0">
                    <div
                      class="pa-4 font-weight-bold d-flex align-center text-white"
                      style="background-color: #fb7299"
                    >
                      <v-icon icon="mdi-auto-fix" class="mr-2"></v-icon>
                      一键合并音视频 (FFmpeg WASM)
                    </div>
                    <div class="pa-4 bg-surface">
                      <div class="text-body-2 text-medium-emphasis mb-4">
                        直接在浏览器中合并视频与音频流（无需安装
                        FFmpeg，由您的设备完成计算）。
                      </div>

                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="selectedVideo"
                            :items="result.videoStreams"
                            item-title="qualityDesc"
                            label="选择视频流"
                            variant="outlined"
                            density="compact"
                            rounded="lg"
                            return-object
                            hide-details
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="selectedAudio"
                            :items="result.audioStreams"
                            item-title="quality"
                            label="选择音频流"
                            variant="outlined"
                            density="compact"
                            rounded="lg"
                            return-object
                            hide-details
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-btn
                        block
                        color="#FB7299"
                        variant="flat"
                        size="large"
                        rounded="lg"
                        @click="startMergeProcess"
                        :loading="merging"
                        :disabled="!selectedVideo || !selectedAudio"
                        prepend-icon="mdi-arrow-collapse"
                        class="mt-4 font-weight-bold text-white"
                      >
                        {{
                          merging
                            ? `正在合并 (${mergeProgress}%)`
                            : "立即合并并下载"
                        }}
                      </v-btn>

                      <v-progress-linear
                        v-if="merging"
                        :model-value="mergeProgress"
                        color="#FB7299"
                        height="6"
                        class="mt-4 rounded-pill"
                        indeterminate
                      ></v-progress-linear>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Video Streams -->
              <div
                class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center"
              >
                <v-icon
                  icon="mdi-video-outline"
                  class="mr-2"
                  color="primary"
                ></v-icon>
                视频轨道 (无音频)
              </div>
              <v-row class="mb-6">
                <v-col
                  v-for="stream in result.videoStreams"
                  :key="stream.quality"
                  cols="12"
                  sm="6"
                >
                  <div
                    class="stream-card pa-4 border rounded-xl d-flex flex-column hover-bg h-100"
                  >
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <v-icon
                          :icon="getQualityIcon(stream.quality)"
                          size="20"
                          class="mr-2"
                          :color="stream.quality >= 80 ? 'orange' : 'grey'"
                        ></v-icon>
                        <span class="text-body-1 font-weight-bold">{{
                          stream.qualityDesc
                        }}</span>
                        <v-chip
                          v-if="stream.superscript"
                          size="x-small"
                          color="error"
                          class="ml-2"
                          variant="flat"
                        >
                          {{ stream.superscript }}
                        </v-chip>
                      </div>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        class="text-uppercase"
                        >{{ stream.codecs.split(".")[0] }}</v-chip
                      >
                    </div>

                    <div
                      class="text-caption text-medium-emphasis mb-4 flex-grow-1"
                    >
                      <div class="d-flex align-center mb-1">
                        <v-icon
                          icon="mdi-aspect-ratio"
                          size="14"
                          class="mr-1"
                        ></v-icon>
                        分辨率: {{ stream.width }} x {{ stream.height }}
                      </div>
                      <div class="d-flex align-center">
                        <v-icon
                          icon="mdi-database-outline"
                          size="14"
                          class="mr-1"
                        ></v-icon>
                        预估大小:
                        {{
                          formatSize((stream.bandwidth * result.duration) / 8)
                        }}
                      </div>
                    </div>

                    <v-btn
                      color="primary"
                      variant="tonal"
                      block
                      rounded="lg"
                      prepend-icon="mdi-download"
                      @click="downloadStream(stream, 'video')"
                      class="font-weight-bold"
                    >
                      下载轨道
                    </v-btn>
                  </div>
                </v-col>
              </v-row>

              <!-- Audio Streams -->
              <div
                class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center"
              >
                <v-icon
                  icon="mdi-volume-high"
                  class="mr-2"
                  color="secondary"
                ></v-icon>
                音频轨道
              </div>
              <v-row class="mb-6">
                <v-col
                  v-for="stream in result.audioStreams"
                  :key="stream.id"
                  cols="12"
                  sm="6"
                >
                  <div
                    class="stream-card pa-4 border rounded-xl d-flex flex-column hover-bg h-100"
                  >
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <v-icon
                          icon="mdi-music-note"
                          size="20"
                          class="mr-2"
                          color="secondary"
                        ></v-icon>
                        <span class="text-body-1 font-weight-bold">{{
                          stream.quality
                        }}</span>
                      </div>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        class="text-uppercase"
                        >{{ stream.codecs.split(".")[0] }}</v-chip
                      >
                    </div>

                    <div
                      class="text-caption text-medium-emphasis mb-4 flex-grow-1"
                    >
                      <div class="d-flex align-center mb-1">
                        <v-icon
                          icon="mdi-speedometer"
                          size="14"
                          class="mr-1"
                        ></v-icon>
                        码率: {{ (stream.bandwidth / 1024).toFixed(0) }} kbps
                      </div>
                      <div class="d-flex align-center">
                        <v-icon
                          icon="mdi-database-outline"
                          size="14"
                          class="mr-1"
                        ></v-icon>
                        预估大小:
                        {{
                          formatSize((stream.bandwidth * result.duration) / 8)
                        }}
                      </div>
                    </div>

                    <v-btn
                      color="secondary"
                      variant="tonal"
                      block
                      rounded="lg"
                      prepend-icon="mdi-download"
                      @click="downloadStream(stream, 'audio')"
                      class="font-weight-bold"
                    >
                      下载轨道
                    </v-btn>
                  </div>
                </v-col>
              </v-row>

              <v-alert
                type="info"
                variant="tonal"
                class="mt-8 rounded-lg"
                icon="mdi-information-outline"
                density="compact"
              >
                <div class="text-caption">
                  B站采用音视频分离(DASH)技术。您可以使用上述合并工具直接在浏览器中完成合并，或者下载后使用
                  FFmpeg 命令手动合并：
                  <br />
                  <code
                    >ffmpeg -i video.m4s -i audio.m4s -c copy output.mp4</code
                  >
                </div>
              </v-alert>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>

      <!-- Empty State -->
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

    <!-- Snackbars -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top"
      rounded="lg"
    >
      {{ snackbar.text }}
      <template v-slot:actions v-if="exportSuggestionVisible">
        <v-btn
          color="white"
          variant="text"
          size="small"
          @click="
            exportCookieFile();
            exportSuggestionVisible = false;
          "
        >
          立即保存文件
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Disclaimer Dialog -->
    <!-- FFmpeg Notice Dialog -->
    <v-dialog v-model="mergeNoticeVisible" persistent max-width="450">
      <v-card class="rounded-xl pa-4 shadow-md">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-download-network</v-icon>
          准备合并组件
        </v-card-title>
        <v-card-text class="py-4 text-body-1">
          正在为您初始化浏览器合并引擎。
          <br /><br />
          首次使用需要从 CDN 加载约 <b>5MB</b> 的 FFmpeg
          核心库。合并过程将完全在您的设备上本地运行，不会消耗流量。
        </v-card-text>
        <v-card-actions class="justify-end gap-2 pb-2">
          <v-btn
            variant="text"
            rounded="lg"
            @click="mergeNoticeVisible = false"
            class="font-weight-bold"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            @click="confirmMerge"
            class="font-weight-bold text-white"
          >
            立即加载并合并
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="disclaimerVisible" persistent max-width="500">
      <v-card class="rounded-xl pa-4 shadow-md">
        <v-card-title class="text-h5 font-weight-bold text-center pt-4">
          使用须知
        </v-card-title>
        <v-card-text class="py-6 text-body-1">
          <div class="mb-4 d-flex align-start">
            <v-chip color="#FB7299" size="x-small" class="mr-2 mt-1 text-white"
              >1</v-chip
            >
            <div>本工具仅供学习交流使用，请勿用于非法用途或侵犯他人版权；</div>
          </div>
          <div class="mb-4 d-flex align-start">
            <v-chip color="#FB7299" size="x-small" class="mr-2 mt-1 text-white"
              >2</v-chip
            >
            <div>本工具作者不对您使用本工具造成的任何后果负责；</div>
          </div>
          <div class="d-flex align-start">
            <v-chip color="#FB7299" size="x-small" class="mr-2 mt-1 text-white"
              >3</v-chip
            >
            <div>
              解析服务由第三方提供，解析成功率受 B
              站接口变动影响。请勿频繁请求，珍惜公共资源。
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center gap-4 pb-4">
          <v-btn
            variant="tonal"
            rounded="lg"
            min-width="120"
            @click="router.push('/')"
            class="font-weight-bold"
          >
            不接受
          </v-btn>
          <v-btn
            color="#FB7299"
            variant="flat"
            rounded="lg"
            min-width="120"
            @click="acceptDisclaimer"
            class="font-weight-bold text-white"
          >
            接受
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </ToolContainer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import ToolContainer from "@/components/ToolContainer.vue";

const router = useRouter();

// State & Refs
const inputText = ref("");
const cookie = ref("");
const loading = ref(false);
const result = ref<any>(null);
const error = ref("");
const cooldown = ref(0);
let cooldownTimer: any = null;

const disclaimerVisible = ref(false);
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

const cookieInput = ref<HTMLInputElement | null>(null);
const exportSuggestionVisible = ref(false);

const API_BASE = "https://bilidown.api.yule.ink";
const API_PARSE = `${API_BASE}/api/parse`;
const API_DOWNLOAD = `${API_BASE}/api/download`;

// FFmpeg setup
const ffmpeg = new FFmpeg();
const merging = ref(false);
const mergeProgress = ref(0);
const selectedVideo = ref<any>(null);
const selectedAudio = ref<any>(null);
const mergeNoticeVisible = ref(false);

// Watch for result changes to select best quality by default
watch(result, (newVal) => {
  if (newVal) {
    selectedVideo.value = newVal.videoStreams?.[0] || null;
    selectedAudio.value = newVal.audioStreams?.[0] || null;
  }
});

const startMergeProcess = () => {
  // Check if FFmpeg is already loaded
  if (ffmpeg.loaded) {
    mergeAndDownload();
  } else {
    mergeNoticeVisible.value = true;
  }
};

const confirmMerge = () => {
  mergeNoticeVisible.value = false;
  mergeAndDownload();
};

const loadFFmpeg = async () => {
  if (ffmpeg.loaded) return;

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
};

const mergeAndDownload = async () => {
  if (!selectedVideo.value || !selectedAudio.value) return;

  merging.value = true;
  mergeProgress.value = 0;

  try {
    await loadFFmpeg();

    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });

    ffmpeg.on("progress", ({ progress }) => {
      mergeProgress.value = Math.round(progress * 100);
    });

    const vUrl = `${API_DOWNLOAD}?url=${encodeURIComponent(selectedVideo.value.url)}&type=video`;
    const aUrl = `${API_DOWNLOAD}?url=${encodeURIComponent(selectedAudio.value.url)}&type=audio`;

    // Download to FFmpeg virtual FS
    await ffmpeg.writeFile("video.m4s", await fetchFile(vUrl));
    await ffmpeg.writeFile("audio.m4s", await fetchFile(aUrl));

    // Run merge command
    // Note: Bilibili m4s files sometimes need -rewrite_ts_59 1 or just -c copy
    // We use -c copy for speed and quality preservation
    await ffmpeg.exec([
      "-i",
      "video.m4s",
      "-i",
      "audio.m4s",
      "-c",
      "copy",
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const url = URL.createObjectURL(
      new Blob([(data as any).buffer], { type: "video/mp4" }),
    );

    const filename = `${result.value.title}_combined.mp4`;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showMessage("合并完成，已开始下载", "success");
  } catch (e: any) {
    console.error(e);
    error.value = "合并失败: " + e.message;
    showMessage("合并失败", "error");
  } finally {
    merging.value = false;
  }
};

// SEO Settings
useHead({
  title: "B站视频解析 - 小于工具箱",
  meta: [
    {
      name: "description",
      content:
        "免费在线解析Bilibili视频，支持获取音视频直链，支持高清画质解析。",
    },
    {
      name: "keywords",
      content: "B站解析,Bilibili下载,视频下载,音视频分离,BV号解析",
    },
  ],
});

// SEO Settings

onMounted(() => {
  // Check if disclaimer was accepted previously (last 24h)
  const lastAccepted = localStorage.getItem("bilidown_disclaimer_accepted");
  if (
    !lastAccepted ||
    Date.now() - parseInt(lastAccepted) > 24 * 60 * 60 * 1000
  ) {
    // Show it only when they try to parse for the first time or after 24h
  } else {
    // Already accepted
  }
});

const showMessage = (text: string, color = "success") => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

const extractBvid = (text: string): string | null => {
  if (!text) return null;
  const match = text.match(/BV[a-zA-Z0-9]{10}/i);
  return match ? match[0] : null;
};

const acceptDisclaimer = () => {
  localStorage.setItem("bilidown_disclaimer_accepted", Date.now().toString());
  disclaimerVisible.value = false;
  handleParse(true);
};

const handleParse = async (isAccepted = false) => {
  if (cooldown.value > 0) return;

  if (!isAccepted) {
    const lastAccepted = localStorage.getItem("bilidown_disclaimer_accepted");
    if (
      !lastAccepted ||
      Date.now() - parseInt(lastAccepted) > 24 * 60 * 60 * 1000
    ) {
      disclaimerVisible.value = true;
      return;
    }
  }

  const bvid = extractBvid(inputText.value);
  if (!bvid) {
    error.value = "未识别到有效的 BV 号，请检查输入";
    return;
  }

  error.value = "";
  loading.value = true;
  result.value = null;

  try {
    let url = `${API_PARSE}?bvid=${bvid}`;
    if (cookie.value) {
      url += `&cookie=${encodeURIComponent(cookie.value)}`;
    }

    const resp = await fetch(url);
    const data = await resp.json();

    if (data.ok) {
      result.value = data.data;
      if (cookie.value) {
        exportSuggestionVisible.value = true;
        showMessage(
          "解析成功！建议保存 Cookie 文件以便下次自动导入",
          "success",
        );
      } else {
        exportSuggestionVisible.value = false;
        showMessage("解析成功");
      }
    } else {
      error.value = data.message || "解析失败";
    }
  } catch (e: any) {
    error.value = "请求出错: " + e.message;
  } finally {
    loading.value = false;
    startCooldown();
  }
};

const startCooldown = () => {
  cooldown.value = 5;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) clearInterval(cooldownTimer);
  }, 1000);
};

const fixCoverUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("//")) return "https:" + url;
  if (!url.startsWith("http")) return "https://" + url.replace(/^\/+/, "");
  return url;
};

const downloadStream = (stream: any, type: string) => {
  const ext = type === "video" ? "mp4" : "m4a";
  const filename = `${result.value.title}_${stream.qualityDesc || stream.quality}.${ext}`;
  const downloadUrl = `${API_DOWNLOAD}?url=${encodeURIComponent(stream.url)}&filename=${encodeURIComponent(filename)}&type=${type}`;

  // Use a hidden anchor to trigger download
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showMessage("正在准备下载...", "info");
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
      showMessage("Cookie 导入成功", "success");
    }
  };
  reader.readAsText(file);
  // Reset input
  if (cookieInput.value) cookieInput.value.value = "";
};

const exportCookieFile = () => {
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

  showMessage("Cookie 文件已导出", "success");
  exportSuggestionVisible.value = false;
};

const getQualityIcon = (quality: number) => {
  if (quality >= 120) return "mdi-video-4k-box";
  if (quality >= 80) return "mdi-video-high-definition";
  return "mdi-video-outline";
};

const formatSize = (bytes: number) => {
  if (!bytes) return "未知";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDuration = (seconds: number) => {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};
</script>

<style scoped>
.max-width-800 {
  max-width: 800px;
}

.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.stream-item {
  transition: all 0.2s ease;
}

.hover-bg:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.video-cover {
  height: auto;
  min-height: 112.5px; /* 200 / (16/9) */
}

.custom-panels :deep(.v-expansion-panel-text__wrapper) {
  padding: 12px 16px;
}
</style>
