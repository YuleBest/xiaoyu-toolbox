<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  Upload,
  Loader2,
  Download,
  EyeOff,
  File,
  X,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { inject } from "vue";

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "base64")!;

const sourceText = ref("");
const base64Text = ref("");
const copiedSource = ref(false);
const copiedBase64 = ref(false);
const currentFileName = ref("");

// Encode: Text -> Base64
const encode = (text: string) => {
  try {
    // Encodes UTF-8 properly to avoid issues with Chinese characters
    return btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    return "编码错误";
  }
};

// Decode: Base64 -> Text
const decode = (b64: string) => {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    return "解码错误";
  }
};

watch(sourceText, (newVal) => {
  if (newVal === "") {
    base64Text.value = "";
    return;
  }
  base64Text.value = encode(newVal);
});

const handleBase64Input = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  const val = target.value;
  base64Text.value = val;
  if (val === "") {
    sourceText.value = "";
    return;
  }
  sourceText.value = decode(val);
};

const copyToClipboard = async (text: string, type: "source" | "base64") => {
  if (!text) return;
  await navigator.clipboard.writeText(text);
  if (type === "source") {
    copiedSource.value = true;
    setTimeout(() => (copiedSource.value = false), 2000);
  } else {
    copiedBase64.value = true;
    setTimeout(() => (copiedBase64.value = false), 2000);
  }
};

const clearAll = () => {
  sourceText.value = "";
  base64Text.value = "";
  currentFileName.value = "";
};

const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const maxSize = 20 * 1024 * 1024; // 20MB

  if (file.size > maxSize) {
    showToast("文件大小不能超过 20MB", "error");
    input.value = "";
    return;
  }

  isUploading.value = true;
  const reader = new FileReader();

  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result !== "string") {
      isUploading.value = false;
      return;
    }

    // Extract raw base64 by removing the data URL prefix
    const base64 = result.split(",")[1];
    if (base64) {
      base64Text.value = base64;
      currentFileName.value = file.name;
      sourceText.value = ""; // Clear source text in file mode
    }
    isUploading.value = false;
    input.value = "";
  };

  reader.onerror = () => {
    showToast("文件读取失败", "error");
    isUploading.value = false;
    input.value = "";
  };

  reader.readAsDataURL(file);
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const downloadBase64 = () => {
  if (!base64Text.value) return;

  let fileName = "";
  if (currentFileName.value) {
    fileName = `${currentFileName.value}.base64.txt`;
  } else {
    const timestamp = new Date().getTime();
    fileName = `xiaoyu-toolbox_${timestamp}.base64.txt`;
  }

  const blob = new Blob([base64Text.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const sourceStats = computed(() => {
  if (currentFileName.value) {
    return { label: "文件模式", value: " 加载成功" };
  }
  return {
    label: "原文长度",
    value: `${sourceText.value.length.toLocaleString()} 字`,
  };
});

const base64Stats = computed(() => {
  const b64 = base64Text.value.trim();
  if (!b64) return { chars: 0, size: "0 B" };

  // Use the raw length to represent the size of the Base64 string itself (1 char ≈ 1 byte)
  const totalSize = b64.length;

  return {
    chars: b64.length,
    size: `约 ${formatSize(totalSize)}`,
  };
});

const isCollapsed = ref(true);
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <input
          type="file"
          ref="fileInput"
          class="hidden"
          @change="handleFileUpload"
        />
        <button
          @click="triggerFileUpload"
          :disabled="isUploading"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-sm shadow-blue-500/20"
        >
          <component
            :is="isUploading ? Loader2 : Upload"
            class="h-4 w-4"
            :class="{ 'animate-spin': isUploading }"
          />
          <span class="hidden sm:inline">{{
            isUploading ? "读取中..." : "文件转 Base64"
          }}</span>
        </button>

        <button
          @click="clearAll"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
        >
          <Trash2 class="h-4 w-4" />
          <span class="hidden sm:inline">清空内容</span>
        </button>
      </div>
    </template>

    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <!-- Source Text -->
        <div class="flex flex-col space-y-2 md:space-y-3">
          <div class="flex items-center justify-between px-2 shrink-0">
            <div class="flex items-center gap-2">
              <span
                class="text-[11px] md:text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                >原文</span
              >
              <span
                v-if="sourceText || currentFileName"
                class="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
              >
                {{ sourceStats.label }}: {{ sourceStats.value }}
              </span>
            </div>
            <button
              @click="copyToClipboard(sourceText, 'source')"
              class="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all active:scale-90"
              title="复制原文"
              :disabled="!sourceText || !!currentFileName"
            >
              <Check v-if="copiedSource" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
          </div>

          <div class="relative flex-1">
            <textarea
              v-if="!currentFileName"
              v-model="sourceText"
              placeholder="在此输入需要编码的内容..."
              class="w-full flex-1 min-h-[160px] h-[28vh] md:h-80 bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 text-[14px] md:text-[15px] font-mono resize-none outline-none focus:border-blue-500/50 transition-all focus:bg-card"
            ></textarea>

            <!-- File Info Card -->
            <div
              v-else
              class="w-full h-[28vh] min-h-[220px] md:h-80 bg-blue-500/5 border border-dashed border-blue-500/20 rounded-3xl flex flex-col items-center justify-center p-4 md:p-6 text-center space-y-3 md:space-y-4 group transition-all"
            >
              <div class="p-4 bg-blue-500/10 rounded-2xl">
                <File class="h-8 w-8 text-blue-500" />
              </div>
              <div class="space-y-1 max-w-full overflow-hidden">
                <p class="text-sm font-semibold truncate px-4">
                  {{ currentFileName }}
                </p>
                <p class="text-xs text-muted-foreground">
                  已加载为 Base64 原始数据
                </p>
              </div>
              <button
                @click="clearAll"
                class="flex items-center gap-2 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
              >
                <X class="h-3.5 w-3.5" />
                移除文件
              </button>
            </div>
          </div>
        </div>

        <!-- Intersection Icon (Desktop Only) -->
        <div
          class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-2 h-10 w-10 bg-background border shadow-sm rounded-full items-center justify-center z-10 text-muted-foreground"
        >
          <ArrowRightLeft class="h-5 w-5" />
        </div>

        <!-- Base64 Output/Input -->
        <div class="flex flex-col space-y-2 md:space-y-3">
          <div class="flex items-center justify-between px-2 shrink-0">
            <div class="flex items-center gap-2">
              <span
                class="text-[11px] md:text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                >Base64</span
              >
              <span
                v-if="base64Stats.chars > 0"
                class="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/70 font-medium"
              >
                {{ base64Stats.chars.toLocaleString() }} 字 |
                {{ base64Stats.size }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="downloadBase64"
                class="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all active:scale-90"
                title="下载 Base64"
                :disabled="!base64Text"
              >
                <Download class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
              <button
                @click="copyToClipboard(base64Text, 'base64')"
                class="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all active:scale-90"
                title="复制 Base64"
                :disabled="!base64Text"
              >
                <Check v-if="copiedBase64" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>

          <div class="relative flex-1 group">
            <template v-if="base64Stats.chars > 10000">
              <div
                class="w-full h-[28vh] min-h-[220px] md:h-80 bg-card/30 border border-muted/80 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-4"
              >
                <div class="p-4 bg-amber-500/10 rounded-full">
                  <EyeOff class="h-8 w-8 text-amber-500" />
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-semibold">内容过长已隐藏</p>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    字符数已超过
                    10,000，为防止页面卡顿，不再实时展示。请通过下载或复制按钮查看。
                  </p>
                </div>
              </div>
            </template>
            <template v-else-if="base64Stats.chars > 4000 && isCollapsed">
              <div
                class="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background/90 to-transparent z-10 rounded-b-3xl flex items-center justify-center pt-10"
              >
                <button
                  @click="isCollapsed = false"
                  class="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  展示全部内容 (共 {{ base64Stats.chars }} 字)
                </button>
              </div>
              <textarea
                readonly
                :value="base64Text.slice(0, 4000) + '...'"
                class="w-full h-[28vh] md:h-80 bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 text-[14px] md:text-[15px] font-mono resize-none outline-none overflow-hidden"
              ></textarea>
            </template>
            <template v-else>
              <textarea
                :value="base64Text"
                @input="handleBase64Input"
                placeholder="在此输入 Base64 字符串进行解码..."
                class="w-full h-[28vh] md:h-80 bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 text-[14px] md:text-[15px] font-mono resize-none outline-none focus:border-blue-500/50 transition-all focus:bg-card"
              ></textarea>
            </template>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div
        class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 md:p-5 mt-4"
      >
        <p
          class="text-[12px] md:text-[13px] text-blue-600/80 leading-relaxed font-medium"
        >
          提示: 本工具支持双向转换。在左侧输入原文会自动进行 Base64
          编码；在右侧输入 Base64 字符串会自动进行 解码。
        </p>
      </div>
    </div>
  </ToolContainer>
</template>
