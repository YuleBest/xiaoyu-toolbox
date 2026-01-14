<template>
  <ToolContainer id="qrcode">
    <v-card class="h-100 d-flex flex-column" variant="flat">
      <v-tabs v-model="tab" color="primary" grow>
        <v-tab value="generate">生成二维码</v-tab>
        <v-tab value="scan">识别二维码</v-tab>
      </v-tabs>

      <v-card-text class="flex-grow-1 overflow-auto pa-4">
        <v-window v-model="tab" class="h-100">
          <!-- Generate Tab -->
          <v-window-item value="generate" class="h-100">
            <div class="d-flex flex-column h-100 align-center">
              <v-textarea
                v-model="textToGenerate"
                label="输入文本或链接"
                placeholder="https://example.com"
                variant="outlined"
                rows="3"
                class="w-100 mb-6"
                hide-details
              ></v-textarea>

              <div
                class="d-flex flex-column align-center flex-grow-1 justify-center"
              >
                <v-card
                  v-if="generatedQr"
                  class="d-flex align-center justify-center pa-2 bg-white"
                  border
                  width="280"
                  height="280"
                >
                  <img
                    :src="generatedQr"
                    alt="QR Code"
                    style="width: 100%; height: 100%"
                  />
                </v-card>

                <div
                  v-else
                  class="d-flex align-center justify-center border border-dashed rounded text-medium-emphasis mb-4"
                  style="width: 250px; height: 250px"
                >
                  输入内容生成预览
                </div>

                <v-btn
                  v-if="generatedQr"
                  color="primary"
                  prepend-icon="mdi-download"
                  class="mt-6"
                  @click="downloadQr"
                >
                  下载图片
                </v-btn>
              </div>
            </div>
          </v-window-item>

          <!-- Scan Tab -->
          <v-window-item value="scan" class="h-100">
            <div class="d-flex flex-column align-center justify-center h-100">
              <div
                class="d-flex flex-column align-center justify-center border-dashed rounded-lg pa-10 cursor-pointer bg-surface-variant w-100 hover-bg"
                style="
                  border-color: rgba(
                    var(--v-border-color),
                    var(--v-border-opacity)
                  );
                  border-width: 2px;
                  min-height: 250px;
                "
                @click="triggerFileSelect"
                @drop.prevent="handleDrop"
                @dragover.prevent
              >
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="d-none"
                  @change="handleFileSelect"
                />

                <v-icon size="64" color="primary" class="mb-4"
                  >mdi-cloud-upload</v-icon
                >
                <div class="text-h6 font-weight-bold mb-1">
                  点击或拖拽上传图片
                </div>
                <div class="text-caption text-medium-emphasis">
                  支持 JPG, PNG, WebP
                </div>
              </div>

              <v-expand-transition>
                <v-card
                  v-if="scanResult"
                  class="mt-6 w-100 bg-green-lighten-5"
                  border
                  color="success"
                  variant="tonal"
                >
                  <v-card-text>
                    <div
                      class="text-subtitle-2 text-success font-weight-bold mb-1"
                    >
                      识别结果：
                    </div>
                    <div class="text-body-1 text-break select-all">
                      {{ scanResult }}
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      variant="text"
                      color="success"
                      prepend-icon="mdi-content-copy"
                      @click="copyScanResult"
                      >复制</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-expand-transition>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="top"
      timeout="2000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </ToolContainer>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import ToolContainer from "@/components/ToolContainer.vue";
import QRCode from "qrcode";
import jsQR from "jsqr";

const tab = ref("generate");

// --- Generate Logic ---
const textToGenerate = ref("");
const generatedQr = ref("");

watch(textToGenerate, async (newVal) => {
  if (!newVal) {
    generatedQr.value = "";
    return;
  }
  try {
    generatedQr.value = await QRCode.toDataURL(newVal, {
      width: 400,
      margin: 2,
    });
  } catch (err) {
    console.error(err);
  }
});

const downloadQr = () => {
  const link = document.createElement("a");
  link.download = `qrcode-${Date.now()}.png`;
  link.href = generatedQr.value;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Scan Logic ---
const fileInput = ref<HTMLInputElement | null>(null);
const scanResult = ref("");
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("");

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
};

const handleDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0];
  if (file) processFile(file);
};

const processFile = (file: File) => {
  if (!file.type.startsWith("image/")) {
    showSnackbar("请上传图片文件", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        scanResult.value = code.data;
        showSnackbar("识别成功", "success");
      } else {
        scanResult.value = "";
        showSnackbar("未发现二维码", "warning");
      }
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const copyScanResult = () => {
  navigator.clipboard.writeText(scanResult.value);
  showSnackbar("已复制到剪贴板", "success");
};

const showSnackbar = (text: string, color: string = "info") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};
</script>

<style scoped>
.select-all {
  user-select: all;
}
.hover-bg {
  transition: background-color 0.2s;
}
.hover-bg:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>
