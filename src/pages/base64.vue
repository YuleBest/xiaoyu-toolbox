<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
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
    return t("base64.encodeError");
  }
};

// Decode: Base64 -> Text
const decode = (b64: string) => {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (e) {
    return t("base64.decodeError");
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
    showToast(t("base64.fileSizeLimit"), "error");
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
    showToast(t("base64.fileReadError"), "error");
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
    return { label: t("base64.fileMode"), value: t("base64.fileLoaded") };
  }
  return {
    label: t("base64.sourceLength"),
    value: `${sourceText.value.length.toLocaleString()} ${t("common.chars")}`,
  };
});

const base64Stats = computed(() => {
  const b64 = base64Text.value.trim();
  if (!b64) return { chars: 0, size: "0 B" };

  // Use the raw length to represent the size of the Base64 string itself (1 char ≈ 1 byte)
  const totalSize = b64.length;

  return {
    chars: b64.length,
    size: `${t("common.approx")} ${formatSize(totalSize)}`,
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
          class="btn-primary px-3 py-1.5 md:px-4 md:py-2"
        >
          <component
            :is="isUploading ? Loader2 : Upload"
            class="h-4 w-4"
            :class="{ 'animate-spin': isUploading }"
          />
          <span class="hidden sm:inline">{{
            isUploading ? $t("base64.uploading") : $t("base64.uploadFile")
          }}</span>
        </button>

        <button
          @click="clearAll"
          class="btn-destructive px-3 py-1.5 md:px-4 md:py-2"
        >
          <Trash2 class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t("common.clearAll") }}</span>
        </button>
      </div>
    </template>

    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <!-- Source Text -->
        <div class="flex flex-col space-y-2 md:space-y-3">
          <div class="flex items-center justify-between px-2 shrink-0">
            <div class="flex items-center gap-2">
              <span class="label-uppercase">{{ $t("base64.source") }}</span>
              <span
                v-if="sourceText || currentFileName"
                class="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/70 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
              >
                {{ sourceStats.label }}: {{ sourceStats.value }}
              </span>
            </div>
            <button
              @click="copyToClipboard(sourceText, 'source')"
              class="btn-icon"
              :title="$t('base64.copySource')"
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
              :placeholder="$t('base64.inputPlaceholder')"
              class="flex-1 min-h-[160px] h-[28vh] md:h-80"
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
                <p class="text-sm text-important truncate px-4">
                  {{ currentFileName }}
                </p>
                <p class="text-xs">
                  {{ $t("base64.loadedAsBase64") }}
                </p>
              </div>
              <button
                @click="clearAll"
                class="btn-destructive px-4 py-2 text-xs"
              >
                <X class="h-3.5 w-3.5" />
                {{ $t("base64.removeFile") }}
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
              <span class="label-uppercase">Base64</span>
              <span
                v-if="base64Stats.chars > 0"
                class="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground/70 font-medium"
              >
                {{ base64Stats.chars.toLocaleString() }}
                {{ $t("common.chars") }} |
                {{ base64Stats.size }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="downloadBase64"
                class="btn-icon"
                :title="$t('base64.downloadBase64')"
                :disabled="!base64Text"
              >
                <Download class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
              <button
                @click="copyToClipboard(base64Text, 'base64')"
                class="btn-icon"
                :title="$t('base64.copyBase64')"
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
                  <p class="text-sm text-important">
                    {{ $t("base64.contentHidden") }}
                  </p>
                  <p class="text-xs">
                    {{ $t("base64.contentHiddenDesc") }}
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
                  class="btn-primary px-5 py-2.5 rounded-full"
                >
                  {{ $t("base64.showAll", { count: base64Stats.chars }) }}
                </button>
              </div>
              <textarea
                readonly
                :value="base64Text.slice(0, 4000) + '...'"
                class="h-[28vh] md:h-80 overflow-hidden"
              ></textarea>
            </template>
            <template v-else>
              <textarea
                :value="base64Text"
                @input="handleBase64Input"
                :placeholder="$t('base64.base64Placeholder')"
                class="h-[28vh] md:h-80"
              ></textarea>
            </template>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div
        class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 md:p-5 mt-4"
      >
        <p class="text-blue-600/80 font-medium leading-relaxed">
          {{ $t("base64.tip") }}
        </p>
      </div>
    </div>
  </ToolContainer>
</template>
