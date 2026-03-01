<script setup lang="ts">
import { ref, onMounted } from "vue"; // 1. 引入 onMounted
import { Wifi, Check, RefreshCw, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServerOption {
  id: string;
  host: string;
  labelKey: string;
}

const MEASURE_COUNT = 3;
const DISCARD_COUNT = 1;

const servers: ServerOption[] = [
  { id: "cn", host: "tool.yule.ink", labelKey: "connection.cn" },
  { id: "intl", host: "cf-tool.yule.ink", labelKey: "connection.intl" },
];

const latencies = ref<Record<string, number | null>>({
  cn: null,
  intl: null,
});
const measuring = ref(false);

/** 只有在浏览器端才使用的 currentId */
const currentId = ref("cn"); // 默认给个 'cn'，防止打包时模版变量未定义

function measureOnce(host: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // 增加环境判断，防止在 SSG 阶段意外触发
    if (typeof window === "undefined") return resolve(0);

    const img = new Image();
    const url = `https://${host}/favicon.svg?_=${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const start = performance.now();
    img.onload = () => resolve(performance.now() - start);
    img.onerror = () => reject(new Error("load failed"));
    img.src = url;
  });
}

async function measureServer(host: string): Promise<number> {
  const results: number[] = [];
  for (let i = 0; i < MEASURE_COUNT; i++) {
    results.push(await measureOnce(host));
  }
  const kept = results.slice(DISCARD_COUNT);
  return Math.round(kept.reduce((a, b) => a + b, 0) / kept.length);
}

async function refreshLatencies() {
  if (typeof window === "undefined") return; // SSG 安全守卫
  measuring.value = true;
  latencies.value = { cn: null, intl: null };
  const results: Record<string, number | null> = {};
  await Promise.all(
    servers.map(async (s) => {
      try {
        results[s.id] = await measureServer(s.host);
      } catch {
        results[s.id] = -1;
      }
    }),
  );
  latencies.value = results;
  measuring.value = false;
}

function onDropdownOpen(open: boolean) {
  if (open) refreshLatencies();
}

/** 核心修复：把获取逻辑包在判断里 */
function getCurrentServerId(): string {
  if (typeof window === "undefined") return "cn";
  const host = window.location.hostname;
  const found = servers.find((s) => s.host === host);
  return found ? found.id : "cn";
}

function switchServer(server: ServerOption) {
  if (typeof window === "undefined") return;
  if (server.host === window.location.hostname) return;
  const url = new URL(window.location.href);
  url.hostname = server.host;
  window.location.href = url.toString();
}

function formatLatency(val: number | null): string {
  if (val === null) return "...";
  if (val === -1) return "超时";
  return `${val}ms`;
}

function latencyColorClass(val: number | null): string {
  if (val === null || val === -1) return "text-muted-foreground/50";
  if (val < 100) return "text-emerald-500";
  if (val < 300) return "text-amber-500";
  return "text-red-500";
}

// 2. 使用 onMounted 来更新当前的 Server ID
onMounted(() => {
  currentId.value = getCurrentServerId();
});
</script>

<template>
  <DropdownMenu @update:open="onDropdownOpen">
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="h-9 w-9 rounded-xl hover:bg-secondary/80 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all active:scale-95 border-none"
      >
        <Wifi
          class="h-[1.2rem] w-[1.2rem] scale-100 transition-all text-blue-500"
        />
        <span class="sr-only">{{ $t("connection.label") }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="w-52 p-1.5 rounded-xl shadow-xl border-muted/50 backdrop-blur-lg"
    >
      <div class="flex items-center justify-between px-3 py-1.5 mb-1">
        <span class="text-xs font-medium text-muted-foreground">{{
          $t("connection.label")
        }}</span>
        <button
          class="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
          :class="{ 'animate-spin': measuring }"
          :disabled="measuring"
          @click.stop="refreshLatencies"
        >
          <RefreshCw v-if="!measuring" class="h-3 w-3" />
          <Loader2 v-else class="h-3 w-3" />
        </button>
      </div>
      <DropdownMenuItem
        v-for="server in servers"
        :key="server.id"
        class="rounded-lg cursor-pointer flex items-center justify-between py-2.5 px-3 transition-colors"
        :class="
          currentId === server.id
            ? 'bg-blue-500/10 text-blue-500'
            : 'focus:bg-muted focus:text-foreground'
        "
        @click="switchServer(server)"
      >
        <div class="flex items-center gap-2">
          <Check v-if="currentId === server.id" class="h-3.5 w-3.5 shrink-0" />
          <div v-else class="h-3.5 w-3.5 shrink-0" />
          <span class="font-medium text-sm">{{ $t(server.labelKey) }}</span>
        </div>
        <span
          class="text-xs font-mono tabular-nums"
          :class="latencyColorClass(latencies[server.id] ?? null)"
        >
          {{ formatLatency(latencies[server.id] ?? null) }}
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
