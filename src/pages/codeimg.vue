<script setup lang="ts">
import { ref, inject, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useStorage } from "@vueuse/core";
import { Copy, Download, Upload } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import { toBlob, toPng } from "html-to-image";

// Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";

// Include default theme for immediate render
import "prismjs/themes/prism-tomorrow.css";

const { t } = useI18n();
const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "codeimg")!;

// --- State ---
const codeText = ref(`function hello(name) {
  console.log(\`Hello, \${name}!\`);
}

hello('World');`);

const selectedLanguage = useStorage("codeimg-language", "javascript");
const selectedTheme = useStorage("codeimg-theme", "tomorrow");
const showWindowControls = useStorage("codeimg-window-controls", true);
const showLineNumbers = useStorage("codeimg-line-numbers", false);
const showShadow = useStorage("codeimg-shadow", true);
const showFileName = useStorage("codeimg-show-filename", true);
const customFileName = useStorage("codeimg-custom-filename", "untitled");
const minWidth = useStorage("codeimg-min-width", [550]);

const backgroundType = useStorage<"solid" | "gradient" | "transparent">(
  "codeimg-bg-type",
  "transparent",
);
const solidColor = useStorage("codeimg-solid-color", "#4FA5ED");
const gradientStart = useStorage("codeimg-gradient-start", "#84ffc9");
const gradientEnd = useStorage("codeimg-gradient-end", "#aab2ff");
const gradientAngle = useStorage("codeimg-gradient-angle", [135]);

const previewNode = ref<HTMLElement | null>(null);
const previewContainerRef = ref<HTMLElement | null>(null);
const codeScrollRef = ref<HTMLTextAreaElement | null>(null);
const codePreRef = ref<HTMLPreElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const previewRect = ref({ width: 0, height: 0 });
const previewContainerRect = ref({ width: 0 });

const isGenerating = ref(false);

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash/Shell" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const themes = [
  { value: "tomorrow", label: t("codeimg.themes.tomorrow") },
  { value: "okaidia", label: t("codeimg.themes.okaidia") },
  { value: "coy", label: t("codeimg.themes.coy") },
  { value: "solarizedLight", label: t("codeimg.themes.solarizedLight") },
  { value: "twilight", label: t("codeimg.themes.twilight") },
  { value: "dark", label: t("codeimg.themes.dark") },
];

const isLightTheme = computed(() =>
  ["coy", "solarizedLight"].includes(selectedTheme.value),
);

const themeBackgroundClass = computed(() => {
  switch (selectedTheme.value) {
    case "coy":
      return "bg-[#fdfdfd]";
    case "solarizedLight":
      return "bg-[#fdf6e3]";
    case "tomorrow":
      return "bg-[#1d1f21]";
    case "okaidia":
      return "bg-[#272822]";
    case "twilight":
      return "bg-[#141414]";
    case "dark":
      return "bg-[#1e1e1e]";
    default:
      return "bg-[#1e1e1e]";
  }
});

// --- Computed ---
const currentBackground = computed(() => {
  if (backgroundType.value === "transparent") {
    return "transparent";
  } else if (backgroundType.value === "solid") {
    return solidColor.value;
  } else {
    return `linear-gradient(${gradientAngle.value[0]}deg, ${gradientStart.value}, ${gradientEnd.value})`;
  }
});

const highlightedCode = computed(() => {
  if (!codeText.value) return "";
  const langObj =
    Prism.languages[selectedLanguage.value] || Prism.languages.javascript;

  if (!langObj) return codeText.value;

  let result = Prism.highlight(codeText.value, langObj, selectedLanguage.value);
  if (showLineNumbers.value) {
    const lines = result.split("\n");
    const numPadding = String(lines.length).length;
    result = lines
      .map((line, index) => {
        const lineNum = String(index + 1).padStart(numPadding, " ");
        return `<span class="inline-block box-border select-none text-muted-foreground/50 border-r border-border/50 text-right pr-4" style="width: calc(${numPadding + 1}ch + 16px); margin-left: calc(-${numPadding + 1}ch - 32px); margin-right: 16px;">${lineNum}</span>${line}`;
      })
      .join("\n");
  }
  return result;
});

// --- Methods ---
const handleInput = (e: Event) => {
  codeText.value = (e.target as HTMLTextAreaElement).value;
  syncScroll();
};

const syncScroll = () => {
  if (codeScrollRef.value && codePreRef.value) {
    codePreRef.value.scrollTop = codeScrollRef.value.scrollTop;
    codePreRef.value.scrollLeft = codeScrollRef.value.scrollLeft;
  }
};

const previewScale = computed(() => {
  const containerWidth = previewContainerRect.value.width;
  const paddingOffset = 120;
  const requiredWidth = (minWidth.value[0] || 550) + paddingOffset;

  if (containerWidth < requiredWidth && containerWidth > 0) {
    return containerWidth / requiredWidth;
  }
  return 1;
});

const lineOffset = computed(() => {
  if (!showLineNumbers.value) return "0px";
  const numPadding = String(codeText.value.split("\n").length).length;
  return `calc(${numPadding + 1}ch + 32px)`;
});

const wrapperHeight = computed(() => {
  if (!previewRect.value.height) return "auto";
  return previewRect.value.height * previewScale.value + "px";
});

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === previewNode.value && previewNode.value) {
        previewRect.value.width = previewNode.value.offsetWidth;
        previewRect.value.height = previewNode.value.offsetHeight;
      }
      if (
        entry.target === previewContainerRef.value &&
        previewContainerRef.value
      ) {
        previewContainerRect.value.width =
          previewContainerRef.value.clientWidth;
      }
    }
  });

  if (previewNode.value) {
    resizeObserver.observe(previewNode.value);
    previewRect.value.width = previewNode.value.offsetWidth;
    previewRect.value.height = previewNode.value.offsetHeight;
  }
  if (previewContainerRef.value) {
    resizeObserver.observe(previewContainerRef.value);
    previewContainerRect.value.width = previewContainerRef.value.clientWidth;
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const target = event.target as FileReader | null;
    if (target && target.result) {
      codeText.value = target.result as string;
    }
  };
  reader.readAsText(file);
  if (fileInput.value) fileInput.value.value = "";
};

// Lazy load Prism CSS
const loadThemeCss = async (theme: any) => {
  if (!theme) return;
  const themeStr = theme.toString();
  const id = "prism-theme-link";
  let link = document.getElementById(id) as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  // Simple CDN for dynamic loading
  const themeName =
    themeStr === "tomorrow"
      ? "prism-tomorrow"
      : "prism-" + themeStr.toLowerCase();
  link.href = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/${themeName}.min.css`;
};

const copyImage = async () => {
  if (!previewNode.value) return;
  try {
    isGenerating.value = true;
    const node = previewNode.value;
    const scale = 2; // High DPI

    await document.fonts.ready;

    const blob = await toBlob(node, {
      pixelRatio: scale,
    });

    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      showToast(t("codeimg.copySuccess"));
    } else {
      showToast(t("codeimg.copyFailed"), "error");
    }
  } catch (e) {
    showToast(t("codeimg.copyFailed"), "error");
    console.error(e);
  } finally {
    isGenerating.value = false;
  }
};

const downloadImage = async () => {
  if (!previewNode.value) return;
  try {
    isGenerating.value = true;
    showToast(t("codeimg.exporting"));

    const node = previewNode.value;
    const scale = 3; // Ultra High DPI for download

    await document.fonts.ready;

    const dataUrl = await toPng(node, {
      pixelRatio: scale,
    });

    const link = document.createElement("a");
    link.download = `code-image-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (e) {
    showToast(t("common.error"), "error");
    console.error(e);
  } finally {
    isGenerating.value = false;
  }
};

const resetDefaults = () => {
  selectedLanguage.value = "javascript";
  selectedTheme.value = "tomorrow";
  showWindowControls.value = true;
  showLineNumbers.value = false;
  showShadow.value = true;
  showFileName.value = true;
  customFileName.value = "untitled";
  minWidth.value = [550];
  backgroundType.value = "transparent";
  solidColor.value = "#4FA5ED";
  gradientStart.value = "#84ffc9";
  gradientEnd.value = "#aab2ff";
  gradientAngle.value = [135];
  showToast(t("codeimg.resetDefaults"), "success");
};
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="resetDefaults">
          {{ $t("codeimg.resetDefaults") }}
        </Button>
        <input
          type="file"
          ref="fileInput"
          accept=".txt,.js,.ts,.vue,.html,.css,.json,.yml,.yaml,.py,.sh,.java,.c,.cpp,.cs,.go,.rs"
          class="hidden"
          @change="handleFileUpload"
        />
        <Button variant="secondary" @click="fileInput?.click()">
          <Upload class="w-4 h-4 mr-2" />
          <span class="hidden sm:inline">{{ $t("codeimg.importCode") }}</span>
        </Button>
      </div>
    </template>

    <div class="flex flex-col gap-8">
      <!-- Settings Panel -->
      <div class="space-y-6 theme-blue w-full">
        <div
          class="space-y-4 bg-card rounded-xl p-4 border border-border flex flex-col"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <Label>{{ $t("codeimg.language") }}</Label>
                <Select v-model="selectedLanguage">
                  <SelectTrigger>
                    <SelectValue :placeholder="$t('codeimg.language')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="lang in languages"
                      :key="lang.value"
                      :value="lang.value"
                    >
                      {{ lang.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>{{ $t("codeimg.theme") }}</Label>
                <Select
                  v-model="selectedTheme"
                  @update:modelValue="loadThemeCss"
                >
                  <SelectTrigger>
                    <SelectValue :placeholder="$t('codeimg.theme')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="theme in themes"
                      :key="theme.value"
                      :value="theme.value"
                    >
                      {{ theme.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="space-y-3">
              <Label>{{ $t("codeimg.background") }}</Label>
              <div class="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="flex-1 transition-colors"
                  :class="{
                    'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400':
                      backgroundType === 'solid',
                  }"
                  @click="backgroundType = 'solid'"
                >
                  {{ $t("codeimg.solidColor") }}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="flex-1 transition-colors"
                  :class="{
                    'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400':
                      backgroundType === 'gradient',
                  }"
                  @click="backgroundType = 'gradient'"
                >
                  {{ $t("codeimg.gradientColor") }}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="flex-1 transition-colors"
                  :class="{
                    'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400':
                      backgroundType === 'transparent',
                  }"
                  @click="backgroundType = 'transparent'"
                >
                  {{ $t("codeimg.transparent") }}
                </Button>
              </div>

              <div
                v-if="backgroundType === 'solid'"
                class="flex gap-2 items-center"
              >
                <input
                  type="color"
                  v-model="solidColor"
                  class="w-8 h-8 rounded shrink-0 border-none cursor-pointer p-0"
                />
                <span class="text-sm font-mono flex-1">{{ solidColor }}</span>
              </div>
              <div v-else class="space-y-3">
                <div class="flex gap-2 items-center">
                  <input
                    type="color"
                    v-model="gradientStart"
                    class="w-8 h-8 rounded shrink-0 border-none cursor-pointer p-0"
                  />
                  <span class="text-sm font-mono flex-1">{{
                    gradientStart
                  }}</span>
                </div>
                <div class="flex gap-2 items-center">
                  <input
                    type="color"
                    v-model="gradientEnd"
                    class="w-8 h-8 rounded shrink-0 border-none cursor-pointer p-0"
                  />
                  <span class="text-sm font-mono flex-1">{{
                    gradientEnd
                  }}</span>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <Label class="text-xs text-muted-foreground">Angle</Label>
                    <span class="text-xs tabular-nums"
                      >{{ gradientAngle[0] }}°</span
                    >
                  </div>
                  <Slider v-model="gradientAngle" :max="360" :step="1" />
                </div>
              </div>
            </div>

            <div class="space-y-2 pt-2">
              <div class="flex justify-between">
                <Label>{{ $t("codeimg.minWidth") }}</Label>
                <span class="text-xs text-muted-foreground"
                  >{{ minWidth[0] }}px</span
                >
              </div>
              <Slider v-model="minWidth" :max="1200" :min="300" :step="10" />
            </div>
          </div>

          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 border-t border-border/50"
          >
            <div class="space-y-4">
              <label
                class="flex items-center justify-between cursor-pointer group"
              >
                <span class="text-sm font-medium leading-none">{{
                  $t("codeimg.windowControls")
                }}</span>
                <input
                  type="checkbox"
                  v-model="showWindowControls"
                  class="sr-only"
                />
                <div
                  class="w-10 h-5 bg-muted rounded-full relative transition-colors group-has-checked:bg-blue-500"
                >
                  <div
                    class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all group-has-checked:left-6"
                  ></div>
                </div>
              </label>

              <div v-if="showWindowControls" class="space-y-2">
                <label
                  class="flex items-center justify-between cursor-pointer group"
                >
                  <span
                    class="text-sm font-medium leading-none text-muted-foreground ml-2"
                    >{{ $t("codeimg.showFileName") }}</span
                  >
                  <input
                    type="checkbox"
                    v-model="showFileName"
                    class="sr-only"
                  />
                  <div
                    class="w-8 h-4 bg-muted rounded-full relative transition-colors group-has-checked:bg-blue-500"
                  >
                    <div
                      class="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all group-has-checked:left-4.5"
                    ></div>
                  </div>
                </label>
              </div>
            </div>

            <div class="space-y-4">
              <label
                class="flex items-center justify-between cursor-pointer group"
              >
                <span class="text-sm font-medium leading-none">{{
                  $t("codeimg.lineNumbers")
                }}</span>
                <input
                  type="checkbox"
                  v-model="showLineNumbers"
                  class="sr-only"
                />
                <div
                  class="w-10 h-5 bg-muted rounded-full relative transition-colors group-has-checked:bg-blue-500"
                >
                  <div
                    class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all group-has-checked:left-6"
                  ></div>
                </div>
              </label>
            </div>

            <div class="space-y-4">
              <label
                class="flex items-center justify-between cursor-pointer group"
              >
                <span class="text-sm font-medium leading-none">{{
                  $t("codeimg.shadow")
                }}</span>
                <input type="checkbox" v-model="showShadow" class="sr-only" />
                <div
                  class="w-10 h-5 bg-muted rounded-full relative transition-colors group-has-checked:bg-blue-500"
                >
                  <div
                    class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all group-has-checked:left-6"
                  ></div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Main/Editor Area -->
      <div
        class="w-full flex flex-col items-center relative min-h-0"
        ref="previewContainerRef"
      >
        <!-- Wrapper for responsive centering without transform clipping issues -->
        <div
          class="w-full relative flex justify-center items-start overflow-hidden min-h-0"
          :style="{ height: wrapperHeight }"
        >
          <!-- Scaling Wrapper -->
          <div
            class="absolute origin-top transition-transform"
            :style="{ transform: `scale(${previewScale})` }"
          >
            <!-- Preview Container -->
            <div
              ref="previewNode"
              class="p-8 md:p-12 flex justify-center shrink-0"
              :style="{
                background: currentBackground,
                width: (minWidth[0] || 550) + 120 + 'px',
              }"
            >
              <!-- Code Window -->
              <div
                class="rounded-xl overflow-hidden flex flex-col transition-shadow shrink-0"
                :class="[
                  { 'shadow-2xl shadow-black/40': showShadow },
                  themeBackgroundClass,
                ]"
                :style="{
                  'box-shadow': showShadow
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    : 'none',
                  width: minWidth[0] + 'px',
                }"
              >
                <!-- Window Controls -->
                <div
                  v-if="showWindowControls"
                  class="flex items-center px-4 h-12 gap-2 bg-transparent select-none shrink-0 border-b relative"
                  :class="isLightTheme ? 'border-black/5' : 'border-white/5'"
                >
                  <div
                    class="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#ff5f56]/50 z-10"
                  ></div>
                  <div
                    class="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#ffbd2e]/50 z-10"
                  ></div>
                  <div
                    class="w-3 h-3 rounded-full bg-[#27c93f] border border-[#27c93f]/50 z-10"
                  ></div>
                  <div
                    class="absolute inset-x-0 h-full flex justify-center items-center pointer-events-none"
                  >
                    <template v-if="showFileName">
                      <div class="relative flex items-center max-w-[200px]">
                        <span
                          class="text-xs font-medium invisible whitespace-pre px-0.5 overflow-hidden"
                          >{{
                            customFileName || $t("codeimg.fileNamePlaceholder")
                          }}</span
                        >
                        <input
                          v-model="customFileName"
                          type="text"
                          :placeholder="$t('codeimg.fileNamePlaceholder')"
                          class="absolute inset-0 w-full h-full bg-transparent border-none text-xs font-medium text-center focus:outline-none transition-colors pointer-events-auto p-0 m-0"
                          :class="
                            isLightTheme
                              ? 'text-black/40 focus:text-black/80'
                              : 'text-white/40 focus:text-white/80'
                          "
                        />
                      </div>
                      <span
                        class="text-xs font-medium block shrink-0"
                        :class="
                          isLightTheme ? 'text-black/40' : 'text-white/40'
                        "
                        >.{{
                          selectedLanguage === "javascript"
                            ? "js"
                            : selectedLanguage
                        }}</span
                      >
                    </template>
                  </div>
                </div>

                <!-- Code Content -->
                <div
                  class="relative w-full text-left flex-1"
                  :class="isLightTheme ? 'text-black' : 'text-slate-50'"
                  :style="{ '--line-offset': lineOffset }"
                >
                  <pre
                    ref="codePreRef"
                    class="code-editor-font pointer-events-none overflow-hidden whitespace-pre-wrap break-all bg-transparent! w-full"
                    :class="'language-' + selectedLanguage"
                    v-html="highlightedCode"
                  ></pre>
                  <textarea
                    ref="codeScrollRef"
                    v-model="codeText"
                    @input="handleInput"
                    @scroll="syncScroll"
                    placeholder="Type or paste your code here..."
                    class="code-editor-font absolute inset-0 w-full h-full bg-transparent resize-none outline-none text-transparent shadow-none z-10 rounded-none hide-scrollbar whitespace-pre-wrap break-all"
                    :class="isLightTheme ? 'caret-black' : 'caret-white'"
                    spellcheck="false"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div
          class="mt-8 flex items-center justify-center gap-3 sm:gap-4 relative z-10 w-full shrink-0 px-4"
        >
          <Button
            size="lg"
            variant="outline"
            @click="copyImage"
            :disabled="isGenerating"
            class="flex-1 sm:flex-none sm:w-40 bg-background/80 backdrop-blur-md"
          >
            <Copy class="w-4 h-4 mr-2 shrink-0" />
            <span class="truncate">{{ $t("codeimg.copyImage") }}</span>
          </Button>
          <Button
            size="lg"
            @click="downloadImage"
            :disabled="isGenerating"
            class="flex-1 sm:flex-none sm:w-40"
          >
            <Download class="w-4 h-4 mr-2 shrink-0" />
            <span class="truncate">{{ $t("codeimg.downloadImage") }}</span>
          </Button>
        </div>

        <!-- Editor hint overlay -->
        <div
          v-if="!codeText"
          class="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none flex auto justify-center items-center h-full z-0"
        >
          <span
            class="text-muted-foreground font-medium bg-background/80 px-4 py-2 rounded-full border backdrop-blur"
            >Click to type code</span
          >
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style>
/* Base Prism Overrides to fit nicely */
pre[class*="language-"] {
  border-radius: 0 !important;
}

pre[class*="language-"].code-editor-font,
textarea.code-editor-font {
  margin: 0 !important;
  border: 0 !important;
  box-sizing: border-box !important;
  font-family:
    "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
  tab-size: 2 !important;
  -moz-tab-size: 2 !important;
  letter-spacing: normal !important;
  word-spacing: normal !important;
  -webkit-font-smoothing: antialiased !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  padding: 1.25rem !important; /* p-5 */
  padding-left: calc(1.25rem + var(--line-offset, 0px)) !important;
  text-shadow: none !important;
}

@media (min-width: 768px) {
  pre[class*="language-"].code-editor-font,
  textarea.code-editor-font {
    font-size: 14px !important;
    padding: 1.5rem !important; /* md:p-6 */
    padding-left: calc(1.5rem + var(--line-offset, 0px)) !important;
  }
}

/* Hide scrollbar for textarea */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

textarea::selection {
  background: rgba(255, 255, 255, 0.2);
}

/* Force blue theme overrides for Shadcn components within codeimg */
.theme-blue {
  /* Select and Input rings */
  --ring: 221.2 83.2% 53.3%;
  --primary: 221.2 83.2% 53.3%;
}

.theme-blue [data-slot="slider-range"] {
  background-color: #3b82f6 !important;
}
.theme-blue [data-slot="slider-thumb"] {
  border-color: #3b82f6 !important;
}

.theme-blue [data-slot="select-trigger"]:focus-visible,
.theme-blue [data-slot="select-content"] [data-state="checked"] {
  --ring: 221.2 83.2% 53.3%;
  border-color: #3b82f6 !important;
}
</style>
