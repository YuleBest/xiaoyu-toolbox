<script setup lang="ts">
import { ref, inject, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import {
  QrCode,
  Scan,
  Download,
  // Upload,
  Wifi,
  Mail,
  Link,
  Type,
  Trash2,
  Copy,
  // Check,
  // RefreshCw,
  Image as ImageIcon,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import QRCode from "qrcode";
import jsQR from "jsqr";

const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "qrcode")!;

// Tab switching
const activeTab = ref<"generate" | "scan">("generate");

// --- Generate State ---
const qrType = ref<"text" | "link" | "wifi" | "mail">("text");
const qrContent = ref("");
const qrOptions = ref({
  errorCorrectionLevel: "M" as "L" | "M" | "Q" | "H",
  margin: 4,
  scale: 10,
  width: 300,
  color: {
    dark: "#000000",
    light: "#ffffff",
  },
});

// WiFi fields
const wifiSsid = ref("");
const wifiPassword = ref("");
const wifiEncryption = ref<"WPA" | "WEP" | "nopass">("WPA");
const wifiHidden = ref(false);

// Mail fields
const mailTo = ref("");
const mailSubject = ref("");
const mailBody = ref("");

const qrDataUrl = ref("");

// --- Scan State ---
const scanResult = ref("");
const isScanning = ref(false);
const scanPreviewUrl = ref("");
const scannerInput = ref<HTMLInputElement | null>(null);

// --- Methods ---

const generateQR = async () => {
  let content = "";
  if (qrType.value === "text" || qrType.value === "link") {
    content = qrContent.value;
  } else if (qrType.value === "wifi") {
    content = `WIFI:S:${wifiSsid.value};T:${wifiEncryption.value};P:${wifiPassword.value};H:${wifiHidden.value ? "true" : "false"};;`;
  } else if (qrType.value === "mail") {
    content = `mailto:${mailTo.value}?subject=${encodeURIComponent(mailSubject.value)}&body=${encodeURIComponent(mailBody.value)}`;
  }

  if (!content.trim()) {
    qrDataUrl.value = "";
    return;
  }

  try {
    qrDataUrl.value = await QRCode.toDataURL(content, {
      ...qrOptions.value,
      errorCorrectionLevel: qrOptions.value.errorCorrectionLevel,
    });
  } catch (err) {
    console.error(err);
    showToast(t("qrcode.generateFailed"), "error");
  }
};

const downloadQR = () => {
  if (!qrDataUrl.value) return;
  const a = document.createElement("a");
  a.href = qrDataUrl.value;
  a.download = `qrcode_${Date.now()}.png`;
  a.click();
  showToast(t("common.downloadSuccess"));
};

const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast(t("qrcode.imageSizeLimit"), "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const url = event.target?.result as string;
    scanPreviewUrl.value = url;
    recognizeQR(url);
  };
  reader.readAsDataURL(file);
};

const recognizeQR = (dataUrl: string) => {
  isScanning.value = true;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      scanResult.value = code.data;
      showToast(t("qrcode.scanSuccess"));
    } else {
      scanResult.value = "";
      showToast(t("qrcode.noQrFound"), "warning");
    }
    isScanning.value = false;
  };
  img.src = dataUrl;
};

const copyResult = async () => {
  if (!scanResult.value) return;
  try {
    await navigator.clipboard.writeText(scanResult.value);
    showToast(t("common.copySuccess"));
  } catch (err) {
    showToast(t("common.copyFailed"), "error");
  }
};

const clearScan = () => {
  scanResult.value = "";
  scanPreviewUrl.value = "";
  if (scannerInput.value) scannerInput.value.value = "";
};

// --- Watchers ---
watch(
  [
    qrType,
    qrContent,
    qrOptions,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    mailTo,
    mailSubject,
    mailBody,
  ],
  () => {
    if (activeTab.value === "generate") {
      generateQR();
    }
  },
  { deep: true },
);

onMounted(() => {
  generateQR();
});
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6">
      <!-- Tabs -->
      <div class="flex p-1 bg-muted/30 rounded-2xl w-fit">
        <button
          @click="activeTab = 'generate'"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm"
          :class="
            activeTab === 'generate'
              ? 'bg-background text-foreground'
              : 'btn-ghost'
          "
        >
          <QrCode class="h-4 w-4" />
          {{ $t("qrcode.generateTab") }}
        </button>
        <button
          @click="activeTab = 'scan'"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium text-sm"
          :class="
            activeTab === 'scan' ? 'bg-background text-foreground' : 'btn-ghost'
          "
        >
          <Scan class="h-4 w-4" />
          {{ $t("qrcode.scanTab") }}
        </button>
      </div>

      <!-- Generate Tab -->
      <div
        v-if="activeTab === 'generate'"
        class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <!-- Configuration Area -->
        <div class="lg:col-span-8 space-y-6">
          <div
            class="bg-card/30 border border-muted/80 rounded-3xl p-6 space-y-6"
          >
            <!-- Content Type -->
            <div class="space-y-4">
              <label class="label-uppercase px-1">{{
                $t("qrcode.contentType")
              }}</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="type in [
                    { id: 'text', label: $t('qrcode.text'), icon: Type },
                    { id: 'link', label: $t('qrcode.link'), icon: Link },
                    { id: 'wifi', label: 'WiFi', icon: Wifi },
                    { id: 'mail', label: $t('qrcode.mail'), icon: Mail },
                  ]"
                  :key="type.id"
                  @click="qrType = type.id as any"
                  class="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95"
                  :class="
                    qrType === type.id
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-600'
                      : 'bg-background border-muted/50 text-muted-foreground hover:border-muted-foreground/30'
                  "
                >
                  <component :is="type.icon" class="h-5 w-5" />
                  <span class="text-xs font-medium">{{ type.label }}</span>
                </button>
              </div>
            </div>

            <!-- Dynamic Input -->
            <div class="space-y-4">
              <label class="label-uppercase px-1">{{
                $t("qrcode.inputContent")
              }}</label>

              <!-- Text/Link -->
              <div
                v-if="qrType === 'text' || qrType === 'link'"
                class="space-y-2"
              >
                <textarea
                  v-model="qrContent"
                  :placeholder="
                    qrType === 'text'
                      ? $t('qrcode.textPlaceholder')
                      : $t('qrcode.linkPlaceholder')
                  "
                  class="min-h-[120px] bg-background/50"
                ></textarea>
              </div>

              <!-- WiFi -->
              <div
                v-if="qrType === 'wifi'"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div class="space-y-2">
                  <span class="text-xs text-muted-foreground px-1">{{
                    $t("qrcode.wifiSsid")
                  }}</span>
                  <input
                    v-model="wifiSsid"
                    type="text"
                    :placeholder="$t('qrcode.wifiSsidPlaceholder')"
                    class="w-full bg-background/50 border border-muted/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <span class="text-xs text-muted-foreground px-1">{{
                    $t("qrcode.securityType")
                  }}</span>
                  <select
                    v-model="wifiEncryption"
                    class="w-full bg-background/50 border border-muted/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all appearance-none"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">
                      {{ $t("qrcode.noPassword") }}
                    </option>
                  </select>
                </div>
                <div v-if="wifiEncryption !== 'nopass'" class="space-y-2">
                  <span class="text-xs text-muted-foreground px-1">{{
                    $t("qrcode.password")
                  }}</span>
                  <input
                    v-model="wifiPassword"
                    type="text"
                    :placeholder="$t('qrcode.wifiPasswordPlaceholder')"
                    class="w-full bg-background/50 border border-muted/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div class="flex items-end pb-2 px-1">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      v-model="wifiHidden"
                      class="sr-only"
                    />
                    <div
                      class="w-10 h-5 bg-muted rounded-full relative transition-colors group-has-checked:bg-blue-500"
                    >
                      <div
                        class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all group-has-checked:left-6"
                      ></div>
                    </div>
                    <span class="text-sm text-muted-foreground">{{
                      $t("qrcode.hiddenNetwork")
                    }}</span>
                  </label>
                </div>
              </div>

              <!-- Mail -->
              <div v-if="qrType === 'mail'" class="space-y-4">
                <div class="space-y-2">
                  <span class="text-xs text-muted-foreground px-1">{{
                    $t("qrcode.recipient")
                  }}</span>
                  <input
                    v-model="mailTo"
                    type="email"
                    placeholder="yule-best@outlook.com"
                    class="w-full bg-background/50 border border-muted/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <span class="text-xs text-muted-foreground px-1">{{
                    $t("qrcode.subjectOptional")
                  }}</span>
                  <input
                    v-model="mailSubject"
                    type="text"
                    :placeholder="$t('qrcode.subjectPlaceholder')"
                    class="w-full bg-background/50 border border-muted/80 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <span class="text-xs text-muted-foreground px-1">{{
                    $t("qrcode.bodyLabel")
                  }}</span>
                  <textarea
                    v-model="mailBody"
                    :placeholder="$t('qrcode.bodyPlaceholder')"
                    class="min-h-[80px] bg-background/50"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Appearance Options -->
            <div class="space-y-4 pt-2">
              <label class="label-uppercase px-1">{{
                $t("qrcode.appearance")
              }}</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <div class="flex justify-between items-center px-1">
                    <span class="text-xs text-muted-foreground">{{
                      $t("qrcode.errorLevel")
                    }}</span>
                    <span
                      class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                      >{{ qrOptions.errorCorrectionLevel }}</span
                    >
                  </div>
                  <div class="flex p-1 bg-muted/50 rounded-xl">
                    <button
                      v-for="level in ['L', 'M', 'Q', 'H']"
                      :key="level"
                      @click="qrOptions.errorCorrectionLevel = level as any"
                      class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                      :class="
                        qrOptions.errorCorrectionLevel === level
                          ? 'bg-background text-blue-600'
                          : 'btn-ghost'
                      "
                    >
                      {{ level }}
                    </button>
                  </div>
                  <p
                    class="text-[10px] text-muted-foreground/60 px-1 leading-normal"
                  >
                    {{ $t("qrcode.errorLevelDesc") }}
                  </p>
                </div>

                <div class="space-y-3">
                  <div class="flex justify-between items-center px-1">
                    <span class="text-xs text-muted-foreground">{{
                      $t("qrcode.qrColor")
                    }}</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <div
                      class="flex-1 flex items-center gap-2 bg-muted/50 p-2 rounded-xl"
                    >
                      <div
                        class="w-6 h-6 rounded-md border border-muted/80"
                        :style="{ backgroundColor: qrOptions.color.dark }"
                      >
                        <input
                          type="color"
                          v-model="qrOptions.color.dark"
                          class="opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <span class="text-[11px] font-mono uppercase">{{
                        qrOptions.color.dark
                      }}</span>
                    </div>
                    <div
                      class="flex-1 flex items-center gap-2 bg-muted/50 p-2 rounded-xl"
                    >
                      <div
                        class="w-6 h-6 rounded-md border border-muted/80"
                        :style="{ backgroundColor: qrOptions.color.light }"
                      >
                        <input
                          type="color"
                          v-model="qrOptions.color.light"
                          class="opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <span class="text-[11px] font-mono uppercase">{{
                        qrOptions.color.light
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <div class="flex justify-between items-center px-1">
                    <span class="text-xs text-muted-foreground">{{
                      $t("qrcode.margin")
                    }}</span>
                    <span class="text-xs font-mono text-blue-600">{{
                      qrOptions.margin
                    }}</span>
                  </div>
                  <input
                    type="range"
                    v-model.number="qrOptions.margin"
                    min="0"
                    max="20"
                    step="1"
                    class="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center px-1">
                    <span class="text-xs text-muted-foreground">{{
                      $t("qrcode.size")
                    }}</span>
                    <span class="text-xs font-mono text-blue-600"
                      >{{ qrOptions.width }}px</span
                    >
                  </div>
                  <input
                    type="range"
                    v-model.number="qrOptions.width"
                    min="100"
                    max="1000"
                    step="50"
                    class="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Area -->
        <div class="lg:col-span-4 flex flex-col items-center">
          <div class="sticky top-6 w-full space-y-6">
            <div
              class="bg-card/40 border border-muted/80 rounded-3xl p-6 flex flex-col items-center gap-6"
            >
              <label class="label-uppercase w-full text-center">{{
                $t("qrcode.preview")
              }}</label>

              <div
                class="relative group bg-white p-4 rounded-2xl overflow-hidden min-w-[200px] min-h-[200px] flex items-center justify-center"
              >
                <img
                  v-if="qrDataUrl"
                  :src="qrDataUrl"
                  alt="QR Preview"
                  class="w-full h-auto max-w-[280px] image-render-pixel"
                />
                <div
                  v-else
                  class="text-muted-foreground/30 flex flex-col items-center gap-3"
                >
                  <QrCode class="h-16 w-16 opacity-10" />
                  <span class="text-xs">{{ $t("qrcode.waitInput") }}</span>
                </div>

                <div
                  v-if="qrDataUrl"
                  class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                ></div>
              </div>

              <div class="flex flex-col w-full gap-3">
                <button
                  @click="downloadQR"
                  :disabled="!qrDataUrl"
                  class="btn-primary w-full py-3 rounded-2xl group"
                >
                  <Download class="h-5 w-5 group-hover:bounce-y" />
                  {{ $t("qrcode.saveQr") }}
                </button>
                <p class="text-[10px] text-muted-foreground text-center">
                  {{ $t("qrcode.transparentWarning") }}
                </p>
              </div>
            </div>

            <div
              class="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4"
            >
              <p
                class="text-[11px] text-amber-600/80 leading-relaxed text-center"
              >
                {{ $t("qrcode.wifiWarning") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Scan Tab -->
      <div
        v-if="activeTab === 'scan'"
        class="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        <div
          class="relative border-2 border-dashed border-muted/80 rounded-[40px] p-8 md:p-12 text-center transition-all bg-card/10 hover:bg-card/20 hover:border-blue-500/30 group"
          :class="{ 'border-blue-500/50 bg-blue-500/5': isScanning }"
          @dragover.prevent
          @drop.prevent="handleFileUpload"
        >
          <input
            type="file"
            ref="scannerInput"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          />

          <div class="flex flex-col items-center gap-4 py-8">
            <div class="relative w-24 h-24 flex items-center justify-center">
              <div
                class="absolute inset-0 bg-blue-500/10 rounded-full animate-ping opacity-20"
                v-if="isScanning"
              ></div>
              <div
                class="absolute inset-0 bg-blue-500/5 rounded-full scale-125"
              ></div>
              <Scan
                v-if="!scanPreviewUrl"
                class="h-12 w-12 text-blue-500 relative z-10"
              />
              <img
                v-else
                :src="scanPreviewUrl"
                class="w-full h-full object-cover rounded-3xl relative z-10 border-2 border-white"
              />
            </div>

            <div class="space-y-2">
              <h3 class="text-lg text-important">
                {{ $t("qrcode.scanOrUpload") }}
              </h3>
              <p class="text-sm">
                {{ $t("qrcode.dragOrClick") }}
              </p>
            </div>

            <div class="flex gap-3 mt-4">
              <button
                @click="scannerInput?.click()"
                class="btn-secondary px-6 py-2.5 rounded-2xl"
              >
                <ImageIcon class="h-4 w-4" />
                {{ $t("qrcode.selectImage") }}
              </button>
              <button
                v-if="scanPreviewUrl"
                @click="clearScan"
                class="btn-destructive px-6 py-2.5 rounded-2xl"
              >
                <Trash2 class="h-4 w-4" />
                {{ $t("common.clear") }}
              </button>
            </div>
          </div>
        </div>

        <!-- Scan Result Area -->
        <Transition name="fade">
          <div v-if="scanResult" class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <label class="label-uppercase">{{
                $t("qrcode.scanResult")
              }}</label>
              <button
                @click="copyResult"
                class="btn-ghost p-1 bg-transparent text-xs text-blue-600 font-medium hover:underline"
              >
                <Copy class="h-3 w-3" />
                {{ $t("qrcode.copyContent") }}
              </button>
            </div>
            <div
              class="bg-card border border-blue-500/20 rounded-3xl p-6 overflow-hidden"
            >
              <pre
                class="text-[14px] leading-relaxed whitespace-pre-wrap break-all font-mono text-foreground"
                >{{ scanResult }}</pre
              >
            </div>
            <div
              v-if="scanResult.startsWith('http')"
              class="flex justify-center pt-2"
            >
              <a
                :href="scanResult"
                target="_blank"
                class="btn-primary px-8 py-3 rounded-2xl"
              >
                <Link class="h-4 w-4" />
                {{ $t("qrcode.visitLink") }}
              </a>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
.image-render-pixel {
  image-rendering: pixelated;
}

@keyframes bounce-y {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.group:hover .bounce-y {
  animation: bounce-y 1s infinite ease-in-out;
}

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

/* Custom switch effect */
input:checked + div div {
  left: 1.5rem;
}

select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
}
</style>
