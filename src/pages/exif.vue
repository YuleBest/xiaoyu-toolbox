<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, inject } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import { Camera, Upload, Copy, Download, Trash2, Info } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
// Imports moved to dynamic imports inside functions

const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "exif")!;

// --- Translation Map ---
const exifFieldKeys = [
  "ImageWidth",
  "ImageHeight",
  "Make",
  "Model",
  "Orientation",
  "XResolution",
  "YResolution",
  "ResolutionUnit",
  "ModifyDate",
  "YCbCrPositioning",
  "ExposureTime",
  "FNumber",
  "ExposureProgram",
  "ISO",
  "ExifVersion",
  "DateTimeOriginal",
  "CreateDate",
  "OffsetTimeOriginal",
  "ComponentsConfiguration",
  "ShutterSpeedValue",
  "ApertureValue",
  "BrightnessValue",
  "ExposureCompensation",
  "MaxApertureValue",
  "MeteringMode",
  "LightSource",
  "Flash",
  "FocalLength",
  "SubSecTime",
  "SubSecTimeOriginal",
  "SubSecTimeDigitized",
  "FlashpixVersion",
  "ColorSpace",
  "ExifImageWidth",
  "ExifImageHeight",
  "SensingMethod",
  "SceneType",
  "ExposureMode",
  "WhiteBalance",
  "DigitalZoomRatio",
  "FocalLengthIn35mmFormat",
  "SceneCaptureType",
  "LensModel",
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitudeRef",
  "GPSAltitude",
  "GPSTimeStamp",
  "GPSProcessingMethod",
  "latitude",
  "longitude",
  "InteropIndex",
  "InteropVersion",
  "Software",
  "ColorType",
  "BitDepth",
  "ImageDescription",
  "Compression",
  "Filter",
  "Interlace",
  "ImageUniqueID",
] as const;

const translationMap = computed(() => {
  const map: Record<string, string> = {};
  for (const key of exifFieldKeys) {
    map[key] = t(`exif.fields.${key}`);
  }
  return map;
});

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
          const heic2any = (await import("heic2any")).default;
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
  return `${make} ${model}`.trim() || t("exif.unknownDevice");
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
    error.value = t("exif.selectFirst");
    return;
  }

  loading.value = true;
  try {
    const { parse } = await import("exifr");
    const data = await parse(file.value, {
      tiff: true,
      exif: true,
      gps: true,
      ifd0: {} as any,
    });
    if (!data) {
      error.value = t("exif.noExif");
    } else {
      exif.value = data;
      showToast(t("exif.parseSuccess"));
    }
  } catch (e) {
    console.error(e);
    error.value = t("exif.parseFailed");
  } finally {
    loading.value = false;
  }
};

const translateKey = (key: string): string => {
  return translationMap.value[key] || key;
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
    showToast(t("exif.fileSizeLimit"), "error");
    return;
  }
  file.value = f;
};

const handleDrop = (e: DragEvent) => {
  const f = e.dataTransfer?.files?.[0];
  if (!f) return;
  if (!f.type.startsWith("image/")) {
    showToast(t("exif.dragImageOnly"), "warning");
    return;
  }
  if (f.size > 50 * 1024 * 1024) {
    showToast(t("exif.fileSizeLimit"), "error");
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
    showToast(t("exif.copiedJson"));
  } catch {
    showToast(t("common.copyFailed"), "error");
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
  showToast(t("exif.exportJson"));
};

const copySingle = async (key: string, value: any) => {
  const label = translateKey(key);
  const text = `${label}: ${formatValue(value)}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast(t("exif.copied", { label }));
  } catch {
    showToast(t("common.copyFailed"), "error");
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
          <span class="hidden sm:inline">{{ $t("exif.copyJson") }}</span>
        </button>
        <button
          v-if="exif"
          @click="exportJson"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all active:scale-95"
        >
          <Download class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t("common.export") }}</span>
        </button>
        <button
          v-if="file"
          @click="clearAll"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
        >
          <Trash2 class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t("common.clear") }}</span>
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
              {{ $t("exif.selectOrDrag") }}
            </h3>
            <p class="text-sm text-muted-foreground">
              {{ $t("exif.supportedFormats") }}
            </p>
          </div>

          <button
            @click="fileInput?.click()"
            class="flex items-center gap-2 px-6 py-2.5 bg-background border border-muted text-foreground rounded-2xl font-medium transition-all hover:bg-muted active:scale-95 mt-2"
          >
            <Upload class="h-4 w-4" />
            {{ $t("exif.selectImage") }}
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
          <span class="text-sm text-muted-foreground font-medium">{{
            $t("exif.parsing")
          }}</span>
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
              {{ $t("exif.changeImage") }}
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
                  {{ $t("exif.replaceImage") }}
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
                  {{ $t("exif.exifDetails") }}
                </h3>
                <p class="text-xs text-muted-foreground">
                  {{ $t("exif.totalItems", { count: exifEntryCount }) }}
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
                <span class="text-sm text-muted-foreground">{{
                  $t("exif.hideInvalid")
                }}</span>
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
                        {{ $t("exif.field") }}
                      </th>
                      <th
                        class="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {{ $t("exif.value") }}
                      </th>
                      <th
                        class="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16"
                      >
                        {{ $t("exif.action") }}
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
                          :title="$t('exif.copyItem')"
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
