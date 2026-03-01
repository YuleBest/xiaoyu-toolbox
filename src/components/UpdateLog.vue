<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Clock, ChevronDown, ChevronUp } from "lucide-vue-next";

// 定义接口以匹配 JSON 结构
interface CommitRecord {
  hash: string;
  date: string;
  message: string;
  author_name: string;
}

interface FileCommitLog {
  filePath: string;
  commits: CommitRecord[];
}

// 从 Vue Router 获取当前页面的路径名并提取文件名
const route = useRoute();
const { t } = useI18n();

const commitData = ref<FileCommitLog[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch("/_commit.log.min.json");
    if (response.ok) {
      commitData.value = await response.json();
    }
  } catch (error) {
    console.error("Failed to load commit logs:", error);
  } finally {
    isLoading.value = false;
  }
});

const currentFileName = computed(() => {
  // 假设路由路径大体对应文件名，例如 /qrcode 对应 qrcode.vue
  let path = route.path;
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path.endsWith(".html")) {
    path = path.slice(0, -5);
  }
  if (path === "" || path === "/") return "index.vue";
  // 例如 path: "/translator-ai" -> "translator-ai.vue"
  const baseName = path.split("/").pop();
  return baseName ? `${baseName}.vue` : "index.vue";
});

// 计算当前页面匹配的更新日志
const currentLogs = computed(() => {
  const match = commitData.value.find(
    (item) => item.filePath === currentFileName.value,
  );
  return match ? match.commits : [];
});

const isExpanded = ref(false);

const visibleLogs = computed(() => {
  if (isExpanded.value) return currentLogs.value;
  return currentLogs.value.slice(0, 1);
});

// 格式化日期为易读格式: YYYY-MM-DD
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <div v-if="currentLogs.length > 0" class="mt-16 mb-8">
    <div class="flex items-center gap-2 mb-4 text-muted-foreground/80">
      <Clock class="w-4 h-4" />
      <h3 class="text-sm font-medium">{{ t("common.updateLog.title") }}</h3>
    </div>
    <div class="space-y-4 relative">
      <div
        v-for="(log, index) in visibleLogs"
        :key="log.hash"
        class="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 group relative"
      >
        <div
          class="absolute left-[-16px] top-2 h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary transition-colors hidden sm:block"
        ></div>
        <div
          v-if="index !== visibleLogs.length - 1"
          class="absolute left-[-13px] top-4 bottom-[-16px] w-px bg-border hidden sm:block last-of-type:hidden"
        ></div>
        <time
          class="text-xs font-mono text-muted-foreground/60 w-24 shrink-0"
          :datetime="log.date"
        >
          {{ formatDate(log.date) }}
        </time>
        <div class="flex-1">
          <p class="text-sm text-foreground/80 leading-relaxed font-medium">
            {{ log.message }}
          </p>
          <div class="flex items-center gap-2 mt-1">
            <span
              class="text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground"
            >
              {{ log.hash }}
            </span>
            <span class="text-xs text-muted-foreground/60"
              >· {{ log.author_name }}</span
            >
          </div>
        </div>
      </div>

      <!-- 渐变遮罩 (如果未展开) -->
      <div
        v-if="!isExpanded && currentLogs.length > 1"
        class="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-background to-transparent pointer-events-none"
      ></div>
    </div>

    <button
      v-if="currentLogs.length > 1"
      class="mt-4 flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-primary transition-colors pl-4 sm:pl-0"
      @click="isExpanded = !isExpanded"
    >
      <span>{{
        isExpanded
          ? t("common.updateLog.collapse")
          : t("common.updateLog.expand", { count: currentLogs.length - 1 })
      }}</span>
      <ChevronUp v-if="isExpanded" class="w-3 h-3" />
      <ChevronDown v-else class="w-3 h-3" />
    </button>
  </div>
</template>

<style scoped>
/* 可选：为日志列表增加一点左侧边距以容纳时间轴线点 */
.space-y-4 {
  padding-left: 16px;
}
</style>
