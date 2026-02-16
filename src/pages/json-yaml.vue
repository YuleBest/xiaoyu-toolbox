<script setup lang="ts">
import { ref, inject, computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import {
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  FileJson,
  Upload,
  Download,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import yaml from "js-yaml";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/themes/prism-tomorrow.css";

const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "json-yaml")!;

const jsonText = ref("");
const yamlText = ref("");
const jsonError = ref("");
const yamlError = ref("");

const jsonScrollRef = ref<HTMLTextAreaElement | null>(null);
const jsonPreRef = ref<HTMLPreElement | null>(null);
const yamlScrollRef = ref<HTMLTextAreaElement | null>(null);
const yamlPreRef = ref<HTMLPreElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const copiedJson = ref(false);
const copiedYaml = ref(false);
const isUpdating = ref(false);

const highlightedJson = computed(() => {
  if (!jsonText.value || !Prism.languages.json) return jsonText.value;
  return Prism.highlight(jsonText.value, Prism.languages.json, "json");
});

const highlightedYaml = computed(() => {
  if (!yamlText.value || !Prism.languages.yaml) return yamlText.value;
  return Prism.highlight(yamlText.value, Prism.languages.yaml, "yaml");
});

const syncScroll = (type: "json" | "yaml") => {
  if (type === "json" && jsonScrollRef.value && jsonPreRef.value) {
    jsonPreRef.value.scrollTop = jsonScrollRef.value.scrollTop;
    jsonPreRef.value.scrollLeft = jsonScrollRef.value.scrollLeft;
  } else if (type === "yaml" && yamlScrollRef.value && yamlPreRef.value) {
    yamlPreRef.value.scrollTop = yamlScrollRef.value.scrollTop;
    yamlPreRef.value.scrollLeft = yamlScrollRef.value.scrollLeft;
  }
};

// JSON -> YAML
const convertJsonToYaml = (json: string) => {
  jsonError.value = "";
  if (!json.trim()) {
    yamlText.value = "";
    yamlError.value = "";
    return;
  }
  try {
    const obj = JSON.parse(json);
    yamlText.value = yaml.dump(obj, { indent: 2 });
    yamlError.value = "";
  } catch (e: any) {
    jsonError.value = e.message;
  }
};

// YAML -> JSON
const convertYamlToJson = (yml: string) => {
  yamlError.value = "";
  if (!yml.trim()) {
    jsonText.value = "";
    jsonError.value = "";
    return;
  }
  try {
    const obj = yaml.load(yml);
    jsonText.value = JSON.stringify(obj, null, 2);
    jsonError.value = "";
  } catch (e: any) {
    yamlError.value = e.message;
  }
};

const handleJsonInput = (e: Event) => {
  if (isUpdating.value) return;
  const val = (e.target as HTMLTextAreaElement).value;
  jsonText.value = val;
  isUpdating.value = true;
  convertJsonToYaml(val);
  isUpdating.value = false;
  syncScroll("json");
};

const handleYamlInput = (e: Event) => {
  if (isUpdating.value) return;
  const val = (e.target as HTMLTextAreaElement).value;
  yamlText.value = val;
  isUpdating.value = true;
  convertYamlToJson(val);
  isUpdating.value = false;
  syncScroll("yaml");
};

const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast(t("jsonYaml.fileSizeLimit"), "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "json") {
      jsonText.value = content;
      convertJsonToYaml(content);
    } else if (extension === "yaml" || extension === "yml") {
      yamlText.value = content;
      convertYamlToJson(content);
    } else {
      // 尝试自动判断
      try {
        JSON.parse(content);
        jsonText.value = content;
        convertJsonToYaml(content);
      } catch {
        yamlText.value = content;
        convertYamlToJson(content);
      }
    }
    showToast(t("jsonYaml.importSuccess"));
  };
  reader.readAsText(file);
  if (fileInput.value) fileInput.value.value = "";
};

const downloadFile = (type: "json" | "yaml") => {
  const content = type === "json" ? jsonText.value : yamlText.value;
  if (!content.trim()) return;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const timestamp = new Date().getTime();
  a.href = url;
  a.download = `tool_${type}_${timestamp}.${type === "json" ? "json" : "yaml"}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t("jsonYaml.exporting"));
};

const copyToClipboard = async (text: string, type: "json" | "yaml") => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast(t("common.copySuccess"));
    if (type === "json") {
      copiedJson.value = true;
      setTimeout(() => (copiedJson.value = false), 2000);
    } else {
      copiedYaml.value = true;
      setTimeout(() => (copiedYaml.value = false), 2000);
    }
  } catch (err) {
    showToast(t("common.copyFailed"), "error");
  }
};

const clearAll = () => {
  jsonText.value = "";
  yamlText.value = "";
  jsonError.value = "";
  yamlError.value = "";
};

const formatJson = () => {
  if (!jsonText.value.trim()) return;
  try {
    const obj = JSON.parse(jsonText.value);
    jsonText.value = JSON.stringify(obj, null, 2);
    jsonError.value = "";
    showToast(t("jsonYaml.formatSuccess"));
  } catch (e: any) {
    jsonError.value = e.message;
    showToast(t("jsonYaml.formatError"), "error");
  }
};
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <input
          type="file"
          ref="fileInput"
          accept=".json,.yaml,.yml"
          class="hidden"
          @change="handleFileUpload"
        />
        <button
          @click="fileInput?.click()"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-all active:scale-95"
        >
          <Upload class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t("jsonYaml.importFile") }}</span>
        </button>

        <button
          @click="formatJson"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all active:scale-95 disabled:opacity-50"
          :disabled="!jsonText.trim()"
        >
          <FileJson class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t("jsonYaml.formatJson") }}</span>
        </button>

        <button
          @click="clearAll"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-95"
        >
          <Trash2 class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t("common.clear") }}</span>
        </button>
      </div>
    </template>

    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <!-- JSON Input -->
        <div class="flex flex-col space-y-3 h-full">
          <div class="flex items-center justify-between px-2 shrink-0">
            <div class="flex items-center gap-2">
              <span
                class="text-[11px] md:text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                >JSON</span
              >
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="downloadFile('json')"
                class="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all active:scale-90"
                :title="$t('jsonYaml.exportJson')"
                :disabled="!jsonText"
              >
                <Download class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
              <button
                @click="copyToClipboard(jsonText, 'json')"
                class="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all active:scale-90"
                :title="$t('jsonYaml.copyJson')"
                :disabled="!jsonText"
              >
                <Check v-if="copiedJson" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>
          <div
            class="flex flex-col flex-1 bg-card/30 border border-muted/80 rounded-3xl overflow-hidden transition-all focus-within:border-blue-500/50 focus-within:bg-card/50"
            :class="{
              'border-destructive/50 focus-within:border-destructive':
                jsonError,
            }"
          >
            <div class="relative flex-1 min-h-[300px] h-[45vh] md:h-[600px]">
              <pre
                ref="jsonPreRef"
                class="absolute inset-0 p-5 md:p-6 text-[13px] md:text-[14px] font-mono pointer-events-none overflow-hidden whitespace-pre-wrap break-all m-0! bg-transparent! border-none!"
                v-html="highlightedJson"
              ></pre>
              <textarea
                ref="jsonScrollRef"
                :value="jsonText"
                @input="handleJsonInput"
                @scroll="syncScroll('json')"
                :placeholder="$t('jsonYaml.jsonPlaceholder')"
                class="w-full h-full bg-transparent p-5 md:p-6 text-[13px] md:text-[14px] font-mono resize-none outline-none text-transparent caret-foreground selection:bg-blue-500/20 shadow-none z-10 block border-none"
              ></textarea>
            </div>
            <div
              v-if="jsonError"
              class="px-5 py-2.5 bg-destructive/5 border-t border-destructive/10 shrink-0"
            >
              <p
                class="text-[11px] text-destructive font-medium leading-relaxed break-all"
              >
                {{ jsonError }}
              </p>
            </div>
          </div>
        </div>

        <!-- Intersection Icon -->
        <div
          class="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-2 h-10 w-10 bg-background border rounded-full items-center justify-center z-10 text-muted-foreground"
        >
          <ArrowRightLeft class="h-5 w-5" />
        </div>

        <!-- YAML Output/Input -->
        <div class="flex flex-col space-y-3 h-full">
          <div class="flex items-center justify-between px-2 shrink-0">
            <div class="flex items-center gap-2">
              <span
                class="text-[11px] md:text-sm font-semibold text-muted-foreground uppercase tracking-wider"
                >YAML</span
              >
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="downloadFile('yaml')"
                class="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all active:scale-90"
                :title="$t('jsonYaml.exportYaml')"
                :disabled="!yamlText"
              >
                <Download class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
              <button
                @click="copyToClipboard(yamlText, 'yaml')"
                class="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all active:scale-90"
                :title="$t('jsonYaml.copyYaml')"
                :disabled="!yamlText"
              >
                <Check v-if="copiedYaml" class="h-4 w-4 text-green-500" />
                <Copy v-else class="h-4 w-4 opacity-50 hover:opacity-100" />
              </button>
            </div>
          </div>
          <div
            class="flex flex-col flex-1 bg-card/30 border border-muted/80 rounded-3xl overflow-hidden transition-all focus-within:border-blue-500/50 focus-within:bg-card/50"
            :class="{
              'border-destructive/50 focus-within:border-destructive':
                yamlError,
            }"
          >
            <div class="relative flex-1 min-h-[300px] h-[45vh] md:h-[600px]">
              <pre
                ref="yamlPreRef"
                class="absolute inset-0 p-5 md:p-6 text-[13px] md:text-[14px] font-mono pointer-events-none overflow-hidden whitespace-pre-wrap break-all m-0! bg-transparent! border-none!"
                v-html="highlightedYaml"
              ></pre>
              <textarea
                ref="yamlScrollRef"
                :value="yamlText"
                @input="handleYamlInput"
                @scroll="syncScroll('yaml')"
                :placeholder="$t('jsonYaml.yamlPlaceholder')"
                class="w-full h-full bg-transparent p-5 md:p-6 text-[13px] md:text-[14px] font-mono resize-none outline-none text-transparent caret-foreground selection:bg-blue-500/20 shadow-none z-10 block border-none"
              ></textarea>
            </div>
            <div
              v-if="yamlError"
              class="px-5 py-2.5 bg-destructive/5 border-t border-destructive/10 shrink-0"
            >
              <p
                class="text-[11px] text-destructive font-medium leading-relaxed break-all"
              >
                {{ yamlError }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips -->
      <div
        class="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 md:p-5"
      >
        <p
          class="text-[12px] md:text-[13px] text-blue-600/80 leading-relaxed font-medium"
        >
          {{ $t("jsonYaml.tip") }}
        </p>
      </div>
    </div>
  </ToolContainer>
</template>

<style>
/* Override Prism tomorrow theme backgrounds */
.group pre span {
  font-family: inherit !important;
}

code[class*="language-"],
pre[class*="language-"] {
  text-shadow: none !important;
}

/* Ensure no conflict with standard styles */
textarea::selection {
  background: rgba(59, 130, 246, 0.2);
}
</style>
