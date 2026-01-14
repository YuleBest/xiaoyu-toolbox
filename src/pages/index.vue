<template>
  <v-container class="fill-height py-16" fluid>
    <div class="max-width-1200 mx-auto w-100">
      <!-- Hero Section -->
      <div class="text-center mb-16">
        <v-chip
          variant="tonal"
          color="primary"
          size="small"
          class="mb-6 font-weight-bold"
          rounded="pill"
        >
          ✨ Xiaoyu Toolbox v1.0
        </v-chip>
        <h1
          class="responsive-h1 font-weight-bold mb-6 tracking-tight text-high-emphasis"
        >
          小于<span class="text-primary">在线工具箱</span>
        </h1>
        <p
          class="text-h6 text-medium-emphasis mb-10 font-weight-regular mx-auto"
          style="max-width: 600px; line-height: 1.6"
        >
          一个纯净、无广告的工具集
        </p>

        <div class="d-flex flex-column flex-sm-row justify-center gap-4">
          <v-btn
            color="primary"
            size="x-large"
            to="/tools"
            elevation="0"
            rounded="xl"
            class="px-8 font-weight-bold btn-hover"
            height="56"
          >
            开始使用
            <v-icon icon="mdi-arrow-right" end class="ml-2"></v-icon>
          </v-btn>
          <v-btn
            variant="tonal"
            size="x-large"
            href="https://github.com/YuleBest/xiaoyu-toolbox"
            target="_blank"
            rounded="xl"
            class="px-8 font-weight-bold"
            height="56"
          >
            <v-icon icon="mdi-github" start class="mr-2"></v-icon>
            GitHub
          </v-btn>
        </div>
      </div>

      <!-- Bento Grid Features -->
      <v-row>
        <!-- Featured Tool: Video Parser -->
        <v-col cols="12" md="6">
          <v-card
            to="/dydown"
            class="h-100 bento-card d-flex flex-column"
            elevation="0"
            border
            rounded="xl"
          >
            <div class="pa-8 z-10">
              <v-icon
                icon="mdi-video-outline"
                size="40"
                color="pink"
                class="mb-4"
              ></v-icon>
              <h3 class="text-h5 font-weight-bold mb-2">抖音视频解析</h3>
              <p class="text-medium-emphasis">
                一键提取无水印高清视频，支持直链下载与在线预览。
              </p>
            </div>
            <div
              class="flex-grow-1 d-flex align-end justify-center overflow-hidden pt-4 px-4"
            >
              <!-- Mockup/Visual -->
              <div
                class="fake-ui-window w-100 bg-surface rounded-t-lg border-t border-x elevation-2"
              >
                <div class="pa-2 border-b d-flex align-center gap-2">
                  <div class="dot bg-red"></div>
                  <div class="dot bg-yellow"></div>
                  <div class="dot bg-green"></div>
                </div>
                <div
                  class="pa-4 d-flex align-center justify-center"
                  style="height: 120px"
                >
                  <v-icon
                    icon="mdi-play-circle"
                    size="48"
                    color="primary"
                    class="opacity-50"
                  ></v-icon>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-row class="h-100">
            <!-- QR Code -->
            <v-col cols="12" sm="6">
              <v-card
                to="/qrcode"
                class="h-100 bento-card"
                elevation="0"
                border
                rounded="xl"
              >
                <div class="pa-6">
                  <v-icon
                    icon="mdi-qrcode"
                    size="32"
                    color="primary"
                    class="mb-4"
                  ></v-icon>
                  <h3 class="text-h6 font-weight-bold mb-2">二维码工具</h3>
                  <p class="text-body-2 text-medium-emphasis">
                    生成与识别二维码，极速转换。
                  </p>
                </div>
              </v-card>
            </v-col>

            <!-- Base64 -->
            <v-col cols="12" sm="6">
              <v-card
                to="/base64"
                class="h-100 bento-card"
                elevation="0"
                border
                rounded="xl"
              >
                <div class="pa-6">
                  <v-icon
                    icon="mdi-code-tags"
                    size="32"
                    color="secondary"
                    class="mb-4"
                  ></v-icon>
                  <h3 class="text-h6 font-weight-bold mb-2">Base64 转换</h3>
                  <p class="text-body-2 text-medium-emphasis">
                    可处理中文的 Base64 编码解码。
                  </p>
                </div>
              </v-card>
            </v-col>

            <!-- More Coming Soon -->
            <v-col cols="12">
              <v-card
                class="h-100 bento-card d-flex align-center px-6 py-4"
                elevation="0"
                border
                rounded="xl"
                variant="tonal"
                color="surface-variant"
              >
                <v-icon
                  icon="mdi-plus-circle-outline"
                  class="mr-4 text-medium-emphasis"
                ></v-icon>
                <div
                  class="text-body-1 font-weight-medium text-medium-emphasis"
                >
                  更多工具持续开发中...
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Footer features -->
      <div class="mt-16 border-t pt-8">
        <v-row class="text-center">
          <v-col cols="4">
            <div class="text-h5 font-weight-bold mb-1">FREE</div>
            <div class="text-caption text-medium-emphasis">完全免费</div>
          </v-col>
          <v-col cols="4">
            <div class="text-h5 font-weight-bold mb-1">FAST</div>
            <div class="text-caption text-medium-emphasis">极速响应</div>
          </v-col>
          <v-col cols="4">
            <div class="text-h5 font-weight-bold mb-1">SAFE</div>
            <div class="text-caption text-medium-emphasis">隐私保护</div>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<style scoped>
.max-width-1200 {
  max-width: 1200px;
}

.tracking-tight {
  letter-spacing: -0.03em !important;
}

.gap-4 {
  gap: 16px;
}
.gap-2 {
  gap: 8px;
}

/* Bento Card Styles */
.bento-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  position: relative;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
}

.bento-card:hover {
  transform: translateY(-4px);
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 12px 32px -8px rgba(var(--v-theme-primary), 0.15);
}

.fake-ui-window {
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.bento-card:hover .fake-ui-window {
  transform: translateY(0);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.5;
}

.z-10 {
  z-index: 10;
  position: relative;
}

.btn-hover {
  transition: transform 0.2s;
}
.btn-hover:hover {
  transform: scale(1.02);
}

/* Responsive Typography */
.responsive-h1 {
  font-size: 2rem; /* Mobile first (smaller) */
  line-height: 1.2;
}

@media (min-width: 600px) {
  .responsive-h1 {
    font-size: 3rem; /* ~text-h2 size */
  }
}
</style>
