<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
import {
  Play,
  Copy,
  Check,
  Download,
  Trash2,
  Terminal,
  Code2,
  RotateCcw,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "playground")!;

const code = ref(
  `// 在这里编写 JavaScript 代码\nconsole.log("Hello, World! 🚀");\n\n// 支持所有 ES2020+ 语法\nconst greet = (name) => {\n  console.log(\`你好，\${name}！\`);\n};\n\ngreet("小于工具箱");\n`,
);

const logs = ref<{ type: string; content: string }[]>([]);
const currentView = ref<"editor" | "logs">("editor");
const isRunning = ref(false);
const copiedCode = ref(false);
const iframeRef = ref<HTMLIFrameElement | null>(null);

// 行号
const lineCount = computed(() => (code.value.match(/\n/g) || []).length + 1);

const runCode = () => {
  isRunning.value = true;
  logs.value = [];
  currentView.value = "logs";

  // 构建沙箱 HTML
  const sandboxHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body>
    <script>
      // 覆盖 console 方法
      const _log = [];
      const methods = ['log', 'warn', 'error', 'info'];
      methods.forEach(m => {
        console[m] = (...args) => {
          const content = args.map(a => {
            if (a === undefined) return 'undefined';
            if (a === null) return 'null';
            if (typeof a === 'object') {
              try { return JSON.stringify(a, null, 2); }
              catch { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({ type: 'console', method: m, content }, '*');
        };
      });

      // 捕获错误
      window.onerror = (msg, src, line, col, err) => {
        window.parent.postMessage({
          type: 'console',
          method: 'error',
          content: err ? err.stack || String(err) : msg
        }, '*');
      };

      window.addEventListener('unhandledrejection', (e) => {
        window.parent.postMessage({
          type: 'console',
          method: 'error',
          content: 'Unhandled Promise Rejection: ' + (e.reason?.stack || String(e.reason))
        }, '*');
      });

      try {
        ${code.value}
      } catch (e) {
        console.error(e.stack || e.message || String(e));
      }

      window.parent.postMessage({ type: 'done' }, '*');
    <${""}script>
    </body>
    </html>
  `;

  // 移除旧 iframe
  if (iframeRef.value) {
    iframeRef.value.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.sandbox = "allow-scripts";
  document.body.appendChild(iframe);
  iframeRef.value = iframe;

  iframe.srcdoc = sandboxHtml;

  // 超时保护
  setTimeout(() => {
    if (isRunning.value) {
      isRunning.value = false;
      logs.value.push({
        type: "error",
        content: "⏰ 执行超时（5秒限制）",
      });
      iframe.remove();
    }
  }, 5000);
};

const handleMessage = (e: MessageEvent) => {
  if (e.data?.type === "console") {
    logs.value.push({
      type: e.data.method,
      content: e.data.content,
    });
  }
  if (e.data?.type === "done") {
    isRunning.value = false;
    if (logs.value.length === 0) {
      logs.value.push({ type: "info", content: "（无输出）" });
    }
  }
};

onMounted(() => {
  window.addEventListener("message", handleMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
  if (iframeRef.value) iframeRef.value.remove();
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value);
    copiedCode.value = true;
    showToast(t("common.copySuccess"));
    setTimeout(() => (copiedCode.value = false), 2000);
  } catch {
    showToast(t("common.copyFailed"), "error");
  }
};

const downloadCode = () => {
  const blob = new Blob([code.value], {
    type: "text/javascript;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "code.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t("common.downloadSuccess"));
};

const clearCode = () => {
  code.value = "";
  logs.value = [];
};

const clearLogs = () => {
  logs.value = [];
};

const handleTab = (e: KeyboardEvent) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    code.value =
      code.value.substring(0, start) + "  " + code.value.substring(end);
    // 恢复光标位置
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    });
  }
};

const logTypeClass = (type: string) => {
  switch (type) {
    case "error":
      return "text-red-500 bg-red-500/5 border-red-500/10";
    case "warn":
      return "text-amber-500 bg-amber-500/5 border-amber-500/10";
    case "info":
      return "text-blue-500 bg-blue-500/5 border-blue-500/10";
    default:
      return "text-foreground bg-transparent border-transparent";
  }
};
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <button
          @click="runCode"
          :disabled="isRunning || !code.trim()"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div
            v-if="isRunning"
            class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
          <Play v-else class="h-4 w-4" />
          <span class="hidden sm:inline">{{ $t("playground.run") }}</span>
        </button>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Toolbar -->
      <div class="flex items-center justify-between">
        <!-- View Tabs -->
        <div class="flex items-center bg-muted/30 rounded-xl p-1 gap-0.5">
          <button
            @click="currentView = 'editor'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="
              currentView === 'editor'
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
          >
            <Code2 class="h-3.5 w-3.5" />
            {{ $t("playground.console") }}
          </button>
          <button
            @click="currentView = 'logs'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="
              currentView === 'logs'
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
          >
            <Terminal class="h-3.5 w-3.5" />
            {{ $t("playground.console") }}
            <span
              v-if="logs.length > 0"
              class="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
            >
              {{ logs.length }}
            </span>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button
            @click="copyCode"
            class="p-2 rounded-lg hover:bg-muted transition-colors"
            :title="$t('common.copy')"
          >
            <Check v-if="copiedCode" class="h-4 w-4 text-green-500" />
            <Copy v-else class="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            @click="downloadCode"
            class="p-2 rounded-lg hover:bg-muted transition-colors"
            :title="$t('common.download')"
          >
            <Download class="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            @click="clearCode"
            class="p-2 rounded-lg hover:bg-muted transition-colors"
            :title="$t('common.clear')"
          >
            <Trash2 class="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <!-- Editor -->
      <div
        v-show="currentView === 'editor'"
        class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
      >
        <div class="flex">
          <!-- Line Numbers -->
          <div
            class="bg-muted/30 py-4 px-2 text-right select-none border-r border-muted/30"
            style="min-width: 48px"
          >
            <div
              v-for="i in lineCount"
              :key="i"
              class="text-[12px] leading-[22px] text-muted-foreground/40 font-mono"
            >
              {{ i }}
            </div>
          </div>
          <!-- Code Area -->
          <div class="flex-1 relative">
            <textarea
              ref="textareaRef"
              v-model="code"
              spellcheck="false"
              class="w-full min-h-[300px] md:min-h-[400px] p-4 bg-transparent text-foreground font-mono text-[13px] leading-[22px] resize-y border-none focus:outline-none focus:ring-0"
              placeholder="// 在这里编写 JavaScript 代码..."
              @keydown="handleTab"
            />
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div
        v-show="currentView === 'logs'"
        class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-5 py-3 border-b border-muted/30"
        >
          <span class="text-xs font-medium text-muted-foreground">
            {{ $t("playground.console") }}
          </span>
          <button
            v-if="logs.length > 0"
            @click="clearLogs"
            class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw class="h-3 w-3" />
            {{ $t("common.clear") }}
          </button>
        </div>
        <div
          class="min-h-[300px] md:min-h-[400px] max-h-[500px] overflow-y-auto p-4 space-y-1"
        >
          <div
            v-for="(log, i) in logs"
            :key="i"
            class="font-mono text-[13px] leading-relaxed px-3 py-1.5 rounded-lg border"
            :class="logTypeClass(log.type)"
          >
            <pre class="whitespace-pre-wrap wrap-break-word m-0">{{
              log.content
            }}</pre>
          </div>
          <div
            v-if="logs.length === 0 && !isRunning"
            class="flex flex-col items-center justify-center py-16 opacity-30"
          >
            <Terminal class="h-12 w-12 mb-3" />
            <p class="text-sm">{{ $t("playground.run") }}</p>
          </div>
          <div
            v-if="isRunning"
            class="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div
              class="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            />
            {{ $t("common.loading") }}
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>
