<template>
  <ToolContainer id="exif">
    <div class="max-width-800 mx-auto w-100 py-4 py-md-8">
      <!-- Input Section -->
      <v-card
        variant="flat"
        border
        class="mb-8 rounded-xl overflow-hidden shadow-sm"
      >
        <v-card-text class="pa-6">
          <div class="text-h6 font-weight-bold mb-4 d-flex align-center">
            <v-icon icon="mdi-camera" class="mr-2" color="primary"></v-icon>
            图片 EXIF 查看
          </div>

          <v-file-input
            v-model="file"
            accept="image/*"
            label="选择一张图片"
            variant="solo-filled"
            flat
            bg-color="surface-variant"
            rounded="lg"
            hide-details
            prepend-icon="mdi-image"
            clearable
          ></v-file-input>

          <v-btn
            block
            color="primary"
            size="large"
            rounded="lg"
            class="mt-4 font-weight-bold"
            :loading="loading"
            prepend-icon="mdi-magnify-expand"
            elevation="0"
            @click="parseExif"
          >
            读取 EXIF 信息
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Result Section -->
      <v-expand-transition>
        <div v-if="exif">
          <v-card
            border
            variant="flat"
            class="rounded-xl overflow-hidden shadow-md"
          >
            <!-- Header -->
            <div
              class="pa-4 pa-sm-6 border-b bg-surface d-flex flex-column flex-sm-row align-sm-center"
            >
              <div
                class="d-flex align-center mb-4 mb-sm-0 flex-grow-1"
                style="min-width: 0"
              >
                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="48"
                  class="mr-3 mr-sm-4 flex-shrink-0"
                >
                  <v-icon icon="mdi-image-outline" size="24"></v-icon>
                </v-avatar>

                <div class="overflow-hidden">
                  <div
                    class="text-subtitle-1 text-sm-h6 font-weight-bold text-truncate"
                  >
                    {{ (Array.isArray(file) ? file[0] : file)?.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis text-truncate">
                    {{ exifSummary }}
                  </div>
                </div>
              </div>

              <div class="d-flex align-center flex-wrap gap-2 justify-sm-end">
                <v-btn
                  variant="tonal"
                  size="small"
                  color="primary"
                  prepend-icon="mdi-content-copy"
                  @click="copyAll"
                >
                  复制 JSON
                </v-btn>
                <v-btn
                  variant="tonal"
                  size="small"
                  color="secondary"
                  prepend-icon="mdi-download"
                  @click="exportJson"
                >
                  导出
                </v-btn>
                <v-chip
                  color="success"
                  size="small"
                  variant="flat"
                  prepend-icon="mdi-check-decagram"
                >
                  解析成功
                </v-chip>
              </div>
            </div>

            <!-- Content -->
            <v-card-text class="pa-6">
              <!-- Image Preview -->
              <div class="image-preview-container mb-6 rounded-xl bg-black">
                <img :src="previewUrl" />
              </div>

              <!-- EXIF Table -->
              <div class="d-flex align-center justify-space-between mb-2 px-1">
                <div
                  class="text-subtitle-2 font-weight-bold text-medium-emphasis"
                >
                  详细参数
                </div>
                <v-switch
                  v-model="hideInvalid"
                  label="隐藏无效信息"
                  color="primary"
                  density="compact"
                  hide-details
                  inset
                  scale="0.8"
                ></v-switch>
              </div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>字段</th>
                    <th>值</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(value, key) in filteredExif" :key="key">
                    <td class="font-weight-medium">
                      <div class="d-flex flex-column">
                        <span>{{ translateKey(key) }}</span>
                        <span
                          v-if="translateKey(key) !== key"
                          class="text-caption text-disabled font-weight-regular"
                        >
                          {{ key }}
                        </span>
                      </div>
                    </td>
                    <td class="text-monospace">
                      {{ formatValue(value) }}
                    </td>
                    <td class="text-right">
                      <v-btn
                        icon="mdi-content-copy"
                        variant="text"
                        size="x-small"
                        color="primary"
                        @click="copySingle(key, value)"
                        title="复制该项"
                      ></v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </div>
      </v-expand-transition>

      <!-- Empty State -->
      <div
        v-if="!exif && !loading && !error"
        class="text-center py-10 opacity-30"
      >
        <v-icon size="80" icon="mdi-image-search-outline" class="mb-4"></v-icon>
        <div class="text-h6">请选择一张图片</div>
      </div>

      <!-- Error -->
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

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import * as exifr from "exifr";
import heic2any from "heic2any";
import ToolContainer from "@/components/ToolContainer.vue";
import zhCN from "./zh-CN.json";

// 将翻译数组转换为对象以方便查找
const translationMap = (zhCN as unknown as Record<string, string>[]).reduce(
  (acc, curr) => {
    return { ...acc, ...curr };
  },
  {} as Record<string, string>,
);

const file = ref<File | null>(null);
const exif = ref<any>(null);
const hideInvalid = ref(true);
const loading = ref(false);
const error = ref("");

const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("info");

const previewUrl = ref("");

// 监听文件变化，清除旧信息并更新预览
watch(
  () => file.value,
  async (newFile) => {
    // 清除旧的预览 URL 防止内存泄漏
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = "";
    }

    // 重置状态
    exif.value = null;
    error.value = "";

    // 如果有新文件，创建预览 URL
    if (newFile) {
      // 处理单个文件或数组的情况 (Vuetify v-file-input 有时返回数组)
      const targetFile = Array.isArray(newFile) ? newFile[0] : newFile;
      if (targetFile) {
        // 检查是否为 HEIC/HEIF 文件 (通过后缀或类型)
        const isHeic =
          targetFile.type === "image/heic" ||
          targetFile.type === "image/heif" ||
          targetFile.name.toLowerCase().endsWith(".heic") ||
          targetFile.name.toLowerCase().endsWith(".heif");

        if (isHeic) {
          loading.value = true;
          try {
            const convertedBlob = await heic2any({
              blob: targetFile,
              toType: "image/jpeg",
              quality: 0.7,
            });
            const resultBlob = Array.isArray(convertedBlob)
              ? convertedBlob[0]
              : convertedBlob;
            if (resultBlob) {
              previewUrl.value = URL.createObjectURL(resultBlob);
            }
          } catch (e) {
            console.error("HEIC 转换预览图失败:", e);
            // 转换失败则显示原始 URL (虽然可能无法预览)
            previewUrl.value = URL.createObjectURL(targetFile);
          } finally {
            loading.value = false;
          }
        } else {
          previewUrl.value = URL.createObjectURL(targetFile);
        }
      }
    }
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

const exifSummary = computed(() => {
  if (!exif.value) return "";
  const make = exif.value.Make || "Unknown";
  const model = exif.value.Model || "";
  return `${make} ${model}`.trim();
});

const filteredExif = computed(() => {
  if (!exif.value) return {};
  if (!hideInvalid.value) return exif.value;

  const result: any = {};
  Object.entries(exif.value).forEach(([key, value]) => {
    if (isValid(value)) {
      result[key] = value;
    }
  });
  return result;
});

const isValid = (val: any): boolean => {
  if (val === null || val === undefined || val === "") return false;
  if (typeof val === "number" && isNaN(val)) return false;

  const strVal = String(val).trim();
  if (strVal === "Not defined") return false;
  // 匹配 NaN:NaN:NaN... 或单个 NaN
  if (/^(NaN)(:NaN)*$/.test(strVal)) return false;
  // 匹配 Unkown
  if (strVal === "Unknown") return false;

  if (Array.isArray(val)) {
    if (val.length === 0) return false;
    return val.some((item) => isValid(item));
  }

  // 检查 {"0":0, "1":0...} 这种全零对象
  if (typeof val === "object" && !(val instanceof Date)) {
    const keys = Object.keys(val);
    if (keys.length > 0) {
      const allZeros = keys.every((k) => val[k] === 0 || val[k] === "0");
      if (allZeros) return false;
    }
  }

  return true;
};

const parseExif = async () => {
  error.value = "";
  exif.value = null;

  const targetFile = Array.isArray(file.value) ? file.value[0] : file.value;
  if (!targetFile) {
    error.value = "请先选择一张图片";
    return;
  }

  loading.value = true;
  try {
    const data = await exifr.parse(targetFile, {
      tiff: true,
      exif: true,
      gps: true,
      ifd0: {},
    });
    if (!data) {
      error.value = "该图片不包含 EXIF 信息";
    } else {
      exif.value = data;
      showSnackbar("EXIF 解析成功", "success");
    }
  } catch (e) {
    console.error(e);
    error.value = "EXIF 解析失败";
  } finally {
    loading.value = false;
  }
};

const translateKey = (key: string | number) => {
  return translationMap[String(key)] || String(key);
};

const formatValue = (v: any) => {
  if (v instanceof Date) return v.toLocaleString();
  if (typeof v === "object") return JSON.stringify(v);
  return v;
};

const copySingle = (key: string | number, value: any) => {
  const label = translateKey(key);
  const text = `${label}: "${formatValue(value)}"`;
  navigator.clipboard.writeText(text);
  showSnackbar(`已复制 ${label}`, "success");
};

const copyAll = () => {
  if (!exif.value) return;
  const text = JSON.stringify(exif.value, null, 2);
  navigator.clipboard.writeText(text);
  showSnackbar("全部信息已复制为 JSON", "success");
};

const exportJson = () => {
  if (!exif.value) return;
  const text = JSON.stringify(exif.value, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const fileName = (Array.isArray(file.value) ? file.value[0] : file.value)
    ?.name;
  link.href = url;
  link.download = `${fileName || "exif"}_metadata.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showSnackbar("正在导出 JSON 文件", "success");
};

const showSnackbar = (text: string, color = "info") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};
</script>

<style scoped>
.max-width-800 {
  max-width: 800px;
}

.image-preview-container {
  max-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.image-preview-container img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.text-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
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

.gap-2 {
  gap: 8px;
}
</style>
