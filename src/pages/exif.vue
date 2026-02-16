<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, inject } from "vue";
import { Camera, Upload, Copy, Download, Trash2, Info } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import * as exifr from "exifr";
import heic2any from "heic2any";

const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "exif")!;

// --- Translation Map ---
const translationMap: Record<string, string> = {
  ImageWidth: "图像宽度",
  ImageHeight: "图像高度",
  Make: "相机制造商",
  Model: "相机型号",
  Orientation: "图像方向",
  XResolution: "水平分辨率",
  YResolution: "垂直分辨率",
  ResolutionUnit: "分辨率单位",
  ModifyDate: "文件修改时间",
  YCbCrPositioning: "YCbCr 取样位置",
  ExposureTime: "曝光时间",
  FNumber: "光圈值",
  ExposureProgram: "曝光程序",
  ISO: "ISO 感光度",
  ExifVersion: "Exif 版本",
  DateTimeOriginal: "原始拍摄时间",
  CreateDate: "数字化时间",
  OffsetTimeOriginal: "原始时间偏移",
  ComponentsConfiguration: "色彩分量配置",
  ShutterSpeedValue: "快门速度值",
  ApertureValue: "光圈值（APEX）",
  BrightnessValue: "亮度值",
  ExposureCompensation: "曝光补偿",
  MaxApertureValue: "最大光圈值",
  MeteringMode: "测光模式",
  LightSource: "光源类型",
  Flash: "闪光灯状态",
  FocalLength: "焦距",
  SubSecTime: "亚秒时间",
  SubSecTimeOriginal: "原始拍摄亚秒时间",
  SubSecTimeDigitized: "数字化亚秒时间",
  FlashpixVersion: "FlashPix 版本",
  ColorSpace: "色彩空间",
  ExifImageWidth: "Exif 图像宽度",
  ExifImageHeight: "Exif 图像高度",
  SensingMethod: "感光方式",
  SceneType: "场景类型",
  ExposureMode: "曝光模式",
  WhiteBalance: "白平衡",
  DigitalZoomRatio: "数字变焦倍率",
  FocalLengthIn35mmFormat: "35mm 等效焦距",
  SceneCaptureType: "场景拍摄类型",
  LensModel: "镜头型号",
  GPSLatitude: "GPS 纬度",
  GPSLongitude: "GPS 经度",
  GPSAltitudeRef: "GPS 高度参考",
  GPSAltitude: "GPS 海拔高度",
  GPSTimeStamp: "GPS 时间戳",
  GPSProcessingMethod: "GPS 定位方式",
  latitude: "纬度（解析值）",
  longitude: "经度（解析值）",
  InteropIndex: "互操作索引",
  InteropVersion: "互操作版本",
  Software: "系统",
  ColorType: "色彩类型",
  BitDepth: "位深度",
  ImageDescription: "图像描述",
  Compression: "压缩方式",
  Filter: "滤镜",
  Interlace: "交错模式",
  ImageUniqueID: "图像唯一标识",
};

// --- State ---
const file = ref<File | null>(null);
const exif = ref<any>(null);
const hideInvalid = ref(true);
const loading = ref(false);
const error = ref("");
const previewUrl = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

// --- Watchers ---
watch(
  () => file.value,
  async (newFile) => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = "";
    }

    exif.value = null;
    error.value = "";

    if (newFile) {
      const isHeic =
        newFile.type === "image/heic" ||
        newFile.type === "image/heif" ||
        newFile.name.toLowerCase().endsWith(".heic") ||
        newFile.name.toLowerCase().endsWith(".heif");

      if (isHeic) {
        loading.value = true;
        try {
          const convertedBlob = await heic2any({
            blob: newFile,
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
          previewUrl.value = URL.createObjectURL(newFile);
        } finally {
          loading.value = false;
        }
      } else {
        previewUrl.value = URL.createObjectURL(newFile);
      }

      // Auto-parse on upload
      await parseExif();
    }
  },
);

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});

// --- Computed ---
const exifSummary = computed(() => {
  if (!exif.value) return "";
  const make = exif.value.Make || "";
  const model = exif.value.Model || "";
  return `${make} ${model}`.trim() || "未知设备";
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

const exifEntryCount = computed(() => {
  return Object.keys(filteredExif.value).length;
});

// --- Methods ---
const isValid = (val: any): boolean => {
  if (val === null || val === undefined || val === "") return false;
  if (typeof val === "number" && isNaN(val)) return false;

  const strVal = String(val).trim();
  if (strVal === "Not defined") return false;
  if (/^(NaN)(:NaN)*$/.test(strVal)) return false;
  if (strVal === "Unknown") return false;

  if (Array.isArray(val)) {
    if (val.length === 0) return false;
    return val.some((item) => isValid(item));
  }

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

  if (!file.value) {
    error.value = "请先选择一张图片";
    return;
  }

  loading.value = true;
  try {
    const data = await exifr.parse(file.value, {
      tiff: true,
      exif: true,
      gps: true,
      ifd0: {} as any,
    });
    if (!data) {
      error.value = "该图片不包含 EXIF 信息";
    } else {
      exif.value = data;
      showToast("EXIF 解析成功");
    }
  } catch (e) {
    console.error(e);
    error.value = "EXIF 解析失败，该图片格式可能不受支持";
  } finally {
    loading.value = false;
  }
};

const translateKey = (key: string): string => {
  return translationMap[key] || key;
};

const formatValue = (v: any): string => {
  if (v instanceof Date) return v.toLocaleString();
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const handleFileUpload = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  if (f.size > 50 * 1024 * 1024) {
    showToast("文件大小不能超过 50MB", "error");
    return;
  }
  file.value = f;
};

const handleDrop = (e: DragEvent) => {
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  if (!f.type.startsWith("image/")) {
    showToast("请拖入图片文件", "warning");
    return;
  }
  if (f.size > 50 * 1024 * 1024) {
    showToast("文件大小不能超过 50MB", "error");
    return;
  }
  file.value = f;
};

const clearAll = () => {
  file.value = null;
  exif.value = null;
  error.value = "";
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
  if (fileInput.value) fileInput.value.value = "";
};

const copyAll = async () => {
  if (!exif.value) return;
  try {
    const text = JSON.stringify(exif.value, null, 2);
    await navigator.clipboard.writeText(text);
    showToast("已复制为 JSON");
  } catch {
    showToast("复制失败", "error");
  }
};

const exportJson = () => {
  if (!exif.value) return;
  const text = JSON.stringify(exif.value, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${file.value?.name || "exif"}_metadata.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("正在导出 JSON");
};

const copySingle = async (key: string, value: any) => {
  const label = translateKey(key);
  const text = `${label}: ${formatValue(value)}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast(`已复制 ${label}`);
  } catch {
    showToast("复制失败", "error");
  }
};
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <button
          v-if="exif"
          @click="copyAll"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-all active:scale-95"
        >
          <Copy class="h-4 w-4" />
          <span class="hidden sm:inline">复制 JSON</span>
        </button>
        <button
          v-if="exif"
          @click="exportJson"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all active:scale-95"
        >
          <Download class="h-4 w-4" />
          <span class="hidden sm:inline">导出</span>
        </button>
        <button
          v-if="file"
          @click="clearAll"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
        >
          <Trash2 class="h-4 w-4" />
          <span class="hidden sm:inline">清除</span>
        </button>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Hidden file input -->
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        class="hidden"
        @change="handleFileUpload"
      />

      <!-- Upload Area (shown when no file selected) -->
      <div
        v-if="!file"
        class="relative border-2 border-dashed border-muted/80 rounded-[32px] p-8 md:p-12 text-center transition-all bg-card/10 hover:bg-card/20 hover:border-blue-500/30 group max-w-3xl mx-auto"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div class="flex flex-col items-center gap-4 py-8">
          <div class="relative w-24 h-24 flex items-center justify-center">
            <div
              class="absolute inset-0 bg-blue-500/5 rounded-full scale-125"
            ></div>
            <Camera class="h-12 w-12 text-blue-500 relative z-10" />
          </div>

          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-foreground">
              选择或拖拽图片
            </h3>
            <p class="text-sm text-muted-foreground">
              支持 JPG、PNG、HEIC 等格式，自动读取 EXIF
            </p>
          </div>

          <button
            @click="fileInput?.click()"
            class="flex items-center gap-2 px-6 py-2.5 bg-background border border-muted text-foreground rounded-2xl font-medium transition-all hover:bg-muted active:scale-95 mt-2"
          >
            <Upload class="h-4 w-4" />
            选择图片
          </button>
        </div>
      </div>

      <!-- Content after file selected -->
      <template v-if="file">
        <!-- Loading -->
        <div
          v-if="loading"
          class="flex items-center justify-center gap-3 py-12"
        >
          <div
            class="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <span class="text-sm text-muted-foreground font-medium"
            >正在解析 EXIF 数据...</span
          >
        </div>

        <!-- Error -->
        <div v-if="error" class="space-y-4 max-w-3xl mx-auto">
          <!-- Error with inline preview -->
          <div
            class="bg-card/30 border border-muted/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6"
          >
            <img
              v-if="previewUrl"
              :src="previewUrl"
              class="w-24 h-24 object-cover rounded-2xl border border-muted/50 shadow-sm shrink-0"
              alt="Preview"
            />
            <div class="flex-1 space-y-2 text-center sm:text-left">
              <p class="text-sm font-medium text-foreground truncate">
                {{ file.name }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ (file.size / 1024 / 1024).toFixed(2) }} MB
              </p>
              <div
                class="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/10 rounded-xl"
              >
                <Info class="h-4 w-4 text-destructive shrink-0" />
                <p class="text-sm text-destructive font-medium">{{ error }}</p>
              </div>
            </div>
            <button
              @click="fileInput?.click()"
              class="flex items-center gap-2 px-5 py-2 bg-background border border-muted text-foreground rounded-xl text-sm font-medium transition-all hover:bg-muted active:scale-95 shrink-0"
            >
              <Upload class="h-4 w-4" />
              换一张
            </button>
          </div>
        </div>

        <!-- Result -->
        <div
          v-if="exif && !loading"
          class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <!-- Left: Image Preview (sticky on desktop) -->
          <div class="lg:col-span-4 flex flex-col items-center">
            <div class="sticky top-6 w-full space-y-4">
              <!-- Image Preview Card -->
              <div
                class="bg-card/30 border border-muted/80 rounded-3xl p-4 overflow-hidden"
              >
                <div
                  class="bg-black/60 rounded-2xl overflow-hidden flex items-center justify-center"
                >
                  <img
                    v-if="previewUrl"
                    :src="previewUrl"
                    class="max-w-full max-h-[360px] object-contain"
                    alt="Image Preview"
                  />
                </div>
              </div>

              <!-- File Info -->
              <div
                class="bg-card/30 border border-muted/80 rounded-2xl px-5 py-4 space-y-2"
              >
                <p
                  class="text-sm font-medium text-foreground truncate"
                  :title="file.name"
                >
                  {{ file.name }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ (file.size / 1024 / 1024).toFixed(2) }} MB ·
                  {{ exifSummary }}
                </p>
                <button
                  @click="fileInput?.click()"
                  class="flex items-center gap-2 w-full justify-center px-4 py-2 mt-2 bg-muted/30 hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground rounded-xl font-medium transition-all active:scale-95"
                >
                  <Upload class="h-3.5 w-3.5" />
                  更换图片
                </button>
              </div>
            </div>
          </div>

          <!-- Right: EXIF Table -->
          <div class="lg:col-span-8 space-y-4">
            <!-- Table Header -->
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2"
            >
              <div class="space-y-0.5">
                <h3 class="text-base font-semibold text-foreground">
                  EXIF 详细参数
                </h3>
                <p class="text-xs text-muted-foreground">
                  共 {{ exifEntryCount }} 项数据
                </p>
              </div>
              <label
                class="flex items-center gap-2 cursor-pointer group select-none"
              >
                <input type="checkbox" v-model="hideInvalid" class="sr-only" />
                <div
                  class="w-10 h-5 bg-muted rounded-full relative transition-colors group-has-checked:bg-blue-500"
                >
                  <div
                    class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all group-has-checked:left-6"
                  ></div>
                </div>
                <span class="text-sm text-muted-foreground">隐藏无效信息</span>
              </label>
            </div>

            <!-- Table -->
            <div
              class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
            >
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-muted/50">
                      <th
                        class="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        字段
                      </th>
                      <th
                        class="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        值
                      </th>
                      <th
                        class="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16"
                      >
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(value, key) in filteredExif"
                      :key="key"
                      class="border-b border-muted/20 last:border-b-0 hover:bg-muted/10 transition-colors"
                    >
                      <td class="px-5 py-3">
                        <div class="flex flex-col">
                          <span class="font-medium text-foreground">{{
                            translateKey(String(key))
                          }}</span>
                          <span
                            v-if="translateKey(String(key)) !== String(key)"
                            class="text-[11px] text-muted-foreground/50 font-mono"
                            >{{ key }}</span
                          >
                        </div>
                      </td>
                      <td
                        class="px-5 py-3 font-mono text-[13px] text-foreground/80 break-all max-w-[300px]"
                      >
                        {{ formatValue(value) }}
                      </td>
                      <td class="px-5 py-3 text-right">
                        <button
                          @click="copySingle(String(key), value)"
                          class="p-1.5 rounded-lg hover:bg-muted transition-all active:scale-90"
                          title="复制该项"
                        >
                          <Copy
                            class="h-3.5 w-3.5 opacity-40 hover:opacity-100"
                          />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </ToolContainer>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
