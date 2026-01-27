<template>
  <ToolContainer id="playground">
    <v-menu offset="8">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          color="medium-emphasis"
          size="small"
          append-icon="mdi-chevron-down"
          class="text-none font-weight-bold"
        >
          {{ template === "vanilla-ts" ? "TypeScript" : "JavaScript" }}
        </v-btn>
      </template>
      <v-list density="compact" rounded="lg">
        <v-list-item
          v-for="lang in languages"
          :key="lang.value"
          :value="lang.value"
          :active="template === lang.value"
          @click="template = lang.value"
        >
          <v-list-item-title class="text-caption font-weight-bold">{{
            lang.title
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <div class="playground-wrapper">
      <SandpackProvider
        :key="sandpackKey"
        :template="template"
        :files="sandpackFiles"
        :theme="isDark ? 'dark' : 'light'"
        :options="{
          autorun: autoRunEnabled,
          recompileMode: 'immediate',
          recompileDelay: 500,
        }"
      >
        <div class="playground-layout">
          <!-- Main Content Area -->
          <div class="workspace">
            <div class="single-pane">
              <!-- Universal Header -->
              <div class="pane-header px-2 px-md-4">
                <v-btn-toggle
                  v-model="currentView"
                  mandatory
                  density="compact"
                  color="primary"
                  variant="tonal"
                  class="view-toggle"
                  rounded="lg"
                >
                  <v-btn value="editor" size="x-small" class="px-3">
                    <v-icon icon="mdi-code-braces" start size="14"></v-icon>
                    代码
                  </v-btn>
                  <v-btn value="logs" size="x-small" class="px-3">
                    <v-icon icon="mdi-console" start size="14"></v-icon>
                    日志
                  </v-btn>
                </v-btn-toggle>

                <v-divider vertical class="mx-3 my-3 opacity-10"></v-divider>

                <v-spacer></v-spacer>

                <div class="header-actions">
                  <v-btn
                    variant="text"
                    color="medium-emphasis"
                    size="small"
                    title="复制代码"
                    @click="copyCode"
                  >
                    <v-icon icon="mdi-content-copy" size="16"></v-icon>
                  </v-btn>

                  <v-btn
                    variant="text"
                    color="medium-emphasis"
                    size="small"
                    title="导出文件"
                    @click="downloadCode"
                  >
                    <v-icon icon="mdi-download-outline" size="20"></v-icon>
                  </v-btn>

                  <v-btn
                    variant="text"
                    color="medium-emphasis"
                    size="small"
                    title="重置代码"
                    @click="resetCode"
                  >
                    <v-icon icon="mdi-refresh" size="20"></v-icon>
                  </v-btn>

                  <v-btn
                    color="primary"
                    size="small"
                    elevation="0"
                    :loading="isRunning"
                    @click="refreshPreview"
                  >
                    <v-icon icon="mdi-play" size="20"></v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Toggleable Content -->
              <div class="content-view">
                <v-window v-model="currentView" class="h-100">
                  <v-window-item value="editor" class="h-100">
                    <div class="editor-container h-100">
                      <MonacoEditor
                        v-model:value="code"
                        :language="language"
                        :theme="isDark ? 'vs-dark' : 'vs-light'"
                        :options="editorOptions"
                        @change="handleCodeChange"
                      />
                    </div>
                  </v-window-item>

                  <v-window-item value="logs" class="h-100">
                    <div class="console-container h-100">
                      <SandpackLayout
                        style="
                          height: 100%;
                          border: none;
                          background: transparent;
                        "
                      >
                        <SandpackPreview style="display: none" />
                        <SandpackConsole
                          style="height: 100%"
                          :show-header="false"
                        />
                      </SandpackLayout>
                    </div>
                  </v-window-item>
                </v-window>
              </div>
            </div>
          </div>
        </div>
      </SandpackProvider>
    </div>

    <!-- Feedback Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="2000"
      rounded="lg"
      elevation="24"
    >
      <div class="d-flex align-center">
        <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </ToolContainer>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackConsole,
  SandpackPreview,
  type SandpackPredefinedTemplate,
} from "sandpack-vue3";
import { Editor as MonacoEditor } from "@guolao/vue-monaco-editor";
import { useTheme } from "vuetify";
import ToolContainer from "@/components/ToolContainer.vue";

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

const template = ref<SandpackPredefinedTemplate>("vanilla-ts");
const code = ref<string>("");
const currentView = ref<"editor" | "logs">("editor");
const sandpackKey = ref(0);
const autoRunEnabled = ref(false);
const isRunning = ref(false);

const snackbar = ref({
  show: false,
  text: "",
  color: "success",
  icon: "mdi-check-circle",
});

const showMessage = (text: string, type: "success" | "error" = "success") => {
  snackbar.value.text = text;
  snackbar.value.color = type === "success" ? "success" : "error";
  snackbar.value.icon =
    type === "success" ? "mdi-check-circle" : "mdi-alert-circle";
  snackbar.value.show = true;
};

const language = computed(() => {
  return template.value === "vanilla-ts" ? "typescript" : "javascript";
});

const languages: { title: string; value: SandpackPredefinedTemplate }[] = [
  { title: "TypeScript", value: "vanilla-ts" },
  { title: "JavaScript", value: "vanilla" },
];

const currentFile = computed(() => {
  return template.value === "vanilla" ? "/index.js" : "/index.ts";
});

const defaultCodes: Record<string, string> = {
  vanilla:
    "// JavaScript Playground\n\n" + 'console.log("Hello JavaScript!");\n',
  "vanilla-ts":
    "// TypeScript Playground\n\n" +
    'const greeting: string = "Hello TypeScript!";\n' +
    "console.log(greeting);\n",
};

onMounted(() => {
  code.value = defaultCodes[template.value as string] || "";
});

watch(template, (newTemplate) => {
  code.value = defaultCodes[newTemplate as string] || "";
  // Disable auto-run on template switch to keep user stay in editor
  autoRunEnabled.value = false;
});

const sandpackFiles = computed(() => {
  return {
    [currentFile.value]: code.value,
  };
});

const editorOptions = {
  automaticLayout: true,
  fontSize: 16,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: "on",
  roundedSelection: true,
  tabSize: 2,
  padding: { top: 20 },
  fontFamily:
    '"Fira Code", "JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", "Inter", "PingFang SC", "Noto Sans SC", monospace',
  fontLigatures: true,
  cursorSmoothCaretAnimation: "on" as const,
  smoothScrolling: true,
  renderLineHighlight: "all" as const,
  scrollbar: {
    vertical: "hidden" as const,
    horizontal: "hidden" as const,
  },
  wordWrap: "on" as const,
};

const handleCodeChange = (newVal: string | undefined) => {
  if (newVal !== undefined) {
    code.value = newVal;
  }
};

const resetCode = () => {
  code.value = defaultCodes[template.value as string] || "";
  refreshPreview();
};

const refreshPreview = () => {
  isRunning.value = true;
  autoRunEnabled.value = true;
  currentView.value = "logs";
  sandpackKey.value++;

  // Reset loading state after a short delay since sandpack runs in iframe
  setTimeout(() => {
    isRunning.value = false;
  }, 2000);
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value);
    showMessage("代码已复制到剪贴板");
  } catch (err) {
    showMessage("复制失败", "error");
  }
};

const downloadCode = () => {
  try {
    const blob = new Blob([code.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ext = template.value === "vanilla-ts" ? "ts" : "js";
    a.href = url;
    a.download = `playground_export.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("文件已准备好下载");
  } catch (err) {
    showMessage("导出失败", "error");
  }
};
</script>

<style lang="scss" scoped>
.playground-wrapper {
  // padding: 1.5rem;
  height: calc(100vh - 80px);
  min-height: 700px;
  touch-action: pan-y;
  overscroll-behavior-x: none;
}

.playground-layout {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  min-height: 700px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.15);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

/* Workspace Layout */
.workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.single-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pane-header {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.05);
  backdrop-filter: blur(8px);
}

.content-view {
  flex: 1;
  min-height: 0;
  position: relative;
}

.editor-container,
.console-container {
  overflow: hidden;
  position: relative;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* UI Elements */
.run-icon-btn {
  background: linear-gradient(135deg, #6366f1, #a855f7) !important;
  color: white !important;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
}

.view-toggle :deep(.v-btn) {
  text-transform: none;
  font-weight: 700;
  letter-spacing: 0;
}

/* Sandpack Customization */
:deep(.sp-console) {
  background: transparent !important;
  padding: 16px !important;
  height: 100% !important;

  &,
  & * {
    font-family:
      "Fira Code", "JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas,
      "Courier New", "Inter", "PingFang SC", "Noto Sans SC", monospace !important;
    font-size: 16px !important;
  }

  .sp-console-list {
    gap: 8px !important;
    line-height: 1.6 !important;
  }

  /* Target specific console entry elements if classes exist */
  .sp-console-entry,
  .sp-console-entry-content {
    font-size: 16px !important;
  }
}

:deep(.sp-layout) {
  height: 100% !important;
}

/* Responsive */
@media (max-width: 960px) {
  .playground-wrapper {
    // padding: 0.5rem;
    // height: auto;
  }

  .playground-layout {
    // height: calc(100vh - 100px);
    // min-height: 500px;
    // border-radius: 12px;
  }

  .pane-header {
    height: 64px;
    padding: 0 4px !important;
  }

  .header-actions {
    gap: 0;

    :deep(.v-btn) {
      min-width: 36px;
      padding: 0 4px;
    }
  }
}
</style>
