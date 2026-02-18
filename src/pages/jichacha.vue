<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  Search,
  Info,
  Smartphone,
  Cpu,
  QrCode,
  Tag,
  ChevronDown,
  Loader2,
  Filter,
  X,
  Copy,
  RotateCcw,
  Clock,
  Trash2,
} from "lucide-vue-next";
import { useStorage } from "@vueuse/core";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  getBrandStats,
  searchModels,
  getUpdateTime,
  type BrandStats,
  type MobileModel,
} from "@/api/jichacha";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const showToast = inject("showToast") as (
  msg: string,
  type?: "success" | "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "jichacha")!;

// --- State ---
// Search
const searchKeyword = ref("");
const searching = ref(false);
const searchResults = ref<MobileModel[]>([]);
const searchTotal = ref(0);
const searchPage = ref(1);
const searchLimit = 100;
const showSearchResults = ref(false);
const error = ref("");

// Filter
const dtypes = ref<{ dtype: string; count: number }[]>([]);
const selectedDtype = ref("");

// Brands
const brands = ref<BrandStats[]>([]);
const brandsTotal = ref(0);
const brandsPage = ref(1);
const brandsLimit = 100;
const loadingBrands = ref(false);

const selectedModel = ref<MobileModel | null>(null);

// History
const searchHistory = useStorage<MobileModel[]>("jichacha_history", []);

// Update Time
const updateTime = ref("");
const relativeTime = ref("");

const fetchDBUpdateTime = async () => {
  try {
    const time = await getUpdateTime();
    updateTime.value = time.trim();
    calcRelativeTime();
    // Refresh relative time every minuteStart
    timer = setInterval(calcRelativeTime, 60000);
  } catch (e) {
    console.error("Failed to fetch update time", e);
  }
};

let timer: NodeJS.Timeout | null = null;
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const calcRelativeTime = () => {
  if (!updateTime.value) return;
  const now = new Date();
  // Replace - with / for better compatibility if needed, though modern browsers support -
  const update = new Date(updateTime.value.replace(/-/g, "/"));
  const diff = now.getTime() - update.getTime();

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    relativeTime.value = "刚刚";
  } else if (minutes < 60) {
    relativeTime.value = `${minutes} 分钟前`;
  } else if (minutes < 1440) {
    relativeTime.value = `${Math.floor(minutes / 60)} 小时前`;
  } else {
    relativeTime.value = `${Math.floor(minutes / 1440)} 天前`;
  }
};

// --- Methods ---

const saveToHistory = (model: MobileModel) => {
  // Remove if exists
  const idx = searchHistory.value.findIndex((m) => m.id === model.id);
  if (idx > -1) {
    searchHistory.value.splice(idx, 1);
  }
  // Add to top
  searchHistory.value.unshift(model);
  // Limit to 15
  if (searchHistory.value.length > 15) {
    searchHistory.value.length = 15; // Directly truncate
  }
};

const clearHistory = () => {
  searchHistory.value = [];
  showToast(t("common.cleared") || "已清除", "success");
};

const fetchBrands = async (append = false) => {
  if (loadingBrands.value) return;
  loadingBrands.value = true;

  if (!append) {
    brandsPage.value = 1;
  } else {
    brandsPage.value++;
  }

  try {
    const res = await getBrandStats(brandsPage.value, brandsLimit);
    if (append) {
      brands.value.push(...res.results);
    } else {
      brands.value = res.results;
    }
    brandsTotal.value = res.total;
  } catch (e) {
    console.error("Failed to fetch brands", e);
    if (append) brandsPage.value--; // Revert page on error
  } finally {
    loadingBrands.value = false;
  }
};

const handleSearch = async (append = false) => {
  const kw = searchKeyword.value.trim();

  // Update URL query params
  router.replace({
    query: {
      ...route.query,
      keyword: kw || undefined,
      dtype: selectedDtype.value || undefined,
    },
  });

  if (!kw && !selectedDtype.value) {
    // If clearing search, reset state
    if (!append) {
      searchResults.value = [];
      searchTotal.value = 0;
      showSearchResults.value = false;
      error.value = "";
    }
    return;
  }

  if (!append) {
    // New search
    error.value = "";
    searchResults.value = [];
    searchTotal.value = 0;
    searchPage.value = 1;
    selectedModel.value = null;
    showSearchResults.value = true;
  } else {
    // Load more
    searchPage.value++;
  }

  searching.value = true;

  try {
    const res = await searchModels({
      q: kw,
      dtype: selectedDtype.value || undefined,
      page: searchPage.value,
      limit: searchLimit,
    });

    if (append) {
      searchResults.value.push(...res.results);
    } else {
      searchResults.value = res.results;
    }

    searchTotal.value = res.total;

    if (res.dtypes) {
      dtypes.value = res.dtypes;
    }

    if (searchResults.value.length === 0 && !append) {
      error.value = t("tools.jichacha.noResults");
    } else if (res.fallbackType) {
      // Show fallback message
      if (res.fallbackType === "translated_brand") {
        error.value = `未找到"${kw}"，已为您显示"${res.usedQuery}"的结果`;
      } else if (res.fallbackType === "brand_fallback") {
        error.value = `未找到"${kw}"的具体型号，已为您显示"${res.usedQuery}"品牌的所有机型`;
      }
    }
  } catch (e) {
    console.error("Frontend Search Error:", e);
    error.value = t("common.error");
    if (append) searchPage.value--;
  } finally {
    searching.value = false;
  }
};

const clearSearch = () => {
  searchKeyword.value = "";
  selectedDtype.value = "";
  searchResults.value = [];
  searchTotal.value = 0;
  showSearchResults.value = false;
  dtypes.value = []; // Clear filters
  error.value = "";
  // Clear URL params
  router.replace({ query: {} });
  // Restore initial state (brands)
  fetchBrands();
};

const toggleDtype = (dtype: string) => {
  if (selectedDtype.value === dtype) {
    selectedDtype.value = "";
  } else {
    selectedDtype.value = dtype;
  }
  // If we have a keyword or if we decide to allow search by just filter
  if (searchKeyword.value.trim() || selectedDtype.value) {
    handleSearch(false);
  }
};

const selectModel = (model: MobileModel) => {
  selectedModel.value = model;
  saveToHistory(model);
};

const shortBrand = (brand: string) => {
  return brand.length > 10 ? brand.substring(0, 10) + "..." : brand;
};

const copyToClipboard = (text: any) => {
  if (!text) return;
  navigator.clipboard
    .writeText(String(text))
    .then(() => {
      showToast(t("common.copySuccess") || "复制成功", "success");
    })
    .catch(() => {
      showToast(t("common.copyFailed") || "复制失败", "error");
    });
};

const highlightMatches = (text: string | null | undefined) => {
  if (!text) return "";
  if (!searchKeyword.value.trim()) return text;

  // Escape special regex characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const keywords = searchKeyword.value
    .trim()
    .split(/\s+/)
    .filter((k) => k.length > 0)
    .map(escapeRegExp);

  if (keywords.length === 0) return text;

  const pattern = new RegExp(`(${keywords.join("|")})`, "gi");
  return String(text).replace(
    pattern,
    '<span class="text-blue-500 font-bold">$1</span>',
  );
};

// Drawer state
const isExpanded = ref(false);
const startY = ref(0);
const sheetHeight = ref(85);

// Scroll Locking
watch(selectedModel, (val) => {
  if (val) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    isExpanded.value = false;
    sheetHeight.value = 85;
  }
});

// Touch handling for expandable sheet
const onTouchStart = (e: TouchEvent) => {
  if (e.touches && e.touches[0]) {
    startY.value = e.touches[0].clientY;
  }
};

const onTouchMove = (e: TouchEvent) => {
  if (!e.touches || !e.touches[0]) return;
  const deltaY = startY.value - e.touches[0].clientY;
  if (deltaY > 50 && !isExpanded.value) {
    isExpanded.value = true;
    sheetHeight.value = 100;
  } else if (deltaY < -100 && isExpanded.value) {
    isExpanded.value = false;
    sheetHeight.value = 85;
  }
};

onMounted(() => {
  // Handle URL params
  const q = route.query.keyword || route.query.q;
  const t = route.query.dtype;

  if (q) searchKeyword.value = String(q);
  if (t) selectedDtype.value = String(t);

  if (q || t) {
    handleSearch();
  } else {
    fetchBrands();
  }

  fetchDBUpdateTime();
});
</script>

<template>
  <ToolContainer :tool="tool">
    <template #actions>
      <div class="flex items-center gap-2">
        <button
          @click="clearSearch"
          class="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-all active:scale-95"
          :title="$t('common.reset')"
        >
          <RotateCcw class="h-4 w-4" />
          <span class="hidden sm:inline">{{
            $t("common.reset") || "重置"
          }}</span>
        </button>
      </div>
    </template>
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Search Bar & Filter -->
      <div class="space-y-4">
        <div
          class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6 shadow-sm"
        >
          <div class="flex gap-3">
            <div class="relative flex-1">
              <Search
                class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              />
              <input
                v-model="searchKeyword"
                type="text"
                :placeholder="$t('tools.jichacha.searchPlaceholder')"
                class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
                @keyup.enter="handleSearch(false)"
              />
            </div>
            <button
              @click="handleSearch(false)"
              :disabled="(!searchKeyword.trim() && !selectedDtype) || searching"
              class="px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2 shadow-sm"
            >
              <div
                v-if="searching && searchPage === 1"
                class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></div>
              <Search v-else class="h-4 w-4" />
              {{ $t("common.search") }}
            </button>
          </div>

          <!-- Dtype Filter -->
          <div
            v-if="dtypes.length > 0"
            class="mt-4 flex flex-wrap gap-2 items-center"
          >
            <div
              class="flex items-center gap-2 text-xs text-muted-foreground mr-2 font-medium"
            >
              <Filter class="h-3 w-3" />
              {{ $t("tools.jichacha.filterType") }}:
            </div>
            <button
              @click="toggleDtype('')"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              :class="
                !selectedDtype
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60'
              "
            >
              {{ $t("common.all") }}
            </button>
            <button
              v-for="d in dtypes"
              :key="d.dtype"
              @click="toggleDtype(d.dtype)"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5"
              :class="
                selectedDtype === d.dtype
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60'
              "
            >
              {{ $t(`tools.jichacha.dtypes.${d.dtype}`) || d.dtype }}
              <span
                class="text-[10px] opacity-70"
                :class="{ 'text-white': selectedDtype === d.dtype }"
                >{{ d.count }}</span
              >
            </button>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm"
        :class="
          error.includes('未找到') && !error.includes('相关机型')
            ? 'bg-amber-500/10 border border-amber-500/20'
            : 'bg-destructive/5 border border-destructive/10'
        "
      >
        <Info
          class="h-5 w-5 shrink-0 mt-0.5"
          :class="
            error.includes('未找到') && !error.includes('相关机型')
              ? 'text-amber-500'
              : 'text-destructive'
          "
        />
        <p
          class="text-sm font-medium"
          :class="
            error.includes('未找到') && !error.includes('相关机型')
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-destructive'
          "
        >
          {{ error }}
        </p>
      </div>

      <!-- Recent History -->
      <div
        v-if="!showSearchResults && searchHistory.length > 0 && !searchKeyword"
        class="space-y-4"
      >
        <div class="flex items-center justify-between">
          <h3
            class="text-lg font-semibold flex items-center gap-2 text-foreground/80"
          >
            <Clock class="h-5 w-5 text-blue-500" />
            <span>最近查看</span>
          </h3>
          <button
            @click="clearHistory"
            class="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 hover:bg-muted/50 px-2 py-1 rounded-md transition-colors"
          >
            <Trash2 class="h-3 w-3" />
            清除记录
          </button>
        </div>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <button
            v-for="model in searchHistory"
            :key="model.id"
            @click="selectModel(model)"
            class="text-left px-4 py-3 bg-card border border-muted/60 hover:border-blue-500/30 hover:bg-muted/30 rounded-xl transition-all group"
          >
            <div
              class="font-medium text-sm truncate group-hover:text-blue-600 transition-colors"
            >
              {{ model.model_name || model.market_name || model.model }}
            </div>
            <div class="flex items-center gap-2 mt-1.5">
              <span
                class="px-1.5 py-0.5 rounded-[4px] text-[10px] bg-muted text-muted-foreground font-bold uppercase tracking-wide"
              >
                {{ shortBrand(model.brand) }}
              </span>
              <span class="text-xs text-muted-foreground font-mono truncate">
                {{ model.code }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Search Results (Native Style) -->
      <div
        v-if="showSearchResults && searchResults.length > 0"
        class="space-y-2"
      >
        <div
          class="px-2 pb-2 flex items-center justify-between text-sm text-muted-foreground"
        >
          <span>找到 {{ searchTotal }} 个相关结果</span>

          <div v-if="selectedDtype" class="flex items-center gap-2">
            <span
              class="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium border border-blue-500/20"
            >
              已筛选: {{ $t(`tools.jichacha.dtypes.${selectedDtype}`) }}
            </span>
            <button
              @click="toggleDtype('')"
              class="hover:text-foreground transition-colors"
            >
              <X class="h-3 w-3" />
            </button>
          </div>
        </div>

        <div class="divide-y divide-muted/30 border-y border-muted/30">
          <button
            v-for="model in searchResults"
            :key="model.id"
            @click="selectModel(model)"
            class="w-full py-4 px-2 flex items-start gap-4 text-left hover:bg-muted/10 transition-colors group -mx-2 rounded-xl"
          >
            <div class="flex-1 min-w-0">
              <h4
                class="text-base font-medium text-foreground truncate mb-1.5"
                v-html="
                  highlightMatches(
                    model.model_name || model.market_name || model.model,
                  )
                "
              ></h4>

              <div
                class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
              >
                <!-- Brand Tag -->
                <span
                  class="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-muted/60 text-foreground/70 uppercase tracking-wide border border-muted"
                >
                  {{ shortBrand(model.brand) }}
                </span>

                <!-- Code info -->
                <span
                  v-if="model.code_alias"
                  class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium"
                >
                  <Cpu class="h-3.5 w-3.5" />
                  <span v-html="highlightMatches(model.code_alias)"></span>
                </span>
                <span v-else class="flex items-center gap-1.5">
                  <Cpu class="h-3.5 w-3.5" />
                  <span v-html="highlightMatches(model.code)"></span>
                </span>

                <!-- Model info -->
                <span
                  v-if="model.model !== model.model_name"
                  class="flex items-center gap-1.5"
                >
                  <QrCode class="h-3.5 w-3.5" />
                  <span v-html="highlightMatches(model.model)"></span>
                </span>
              </div>
            </div>
          </button>
        </div>

        <!-- Load More Results Button -->
        <div
          v-if="searchResults.length < searchTotal"
          class="pt-4 flex justify-center"
        >
          <button
            @click="handleSearch(true)"
            :disabled="searching"
            class="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-all"
          >
            <Loader2 v-if="searching" class="h-4 w-4 animate-spin" />
            <span v-else>查看更多结果</span>
          </button>
        </div>
      </div>

      <!-- Overview: Brands Cloud (Always visible at bottom) -->
      <div v-if="brands.length > 0" class="mt-8 pt-6 border-t border-muted/30">
        <h3
          class="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground/80"
        >
          <Tag class="h-5 w-5 text-blue-500" />
          {{ $t("tools.jichacha.brands") }}
        </h3>
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="b in brands"
            :key="b.brand"
            @click="
              searchKeyword = b.brand;
              handleSearch(false);
            "
            class="px-3 py-1.5 bg-background border border-muted rounded-xl text-sm hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center gap-2 group"
          >
            <span
              class="font-medium group-hover:text-blue-500 transition-colors"
              v-html="highlightMatches(b.brand_title || b.brand)"
            ></span>
            <span
              class="text-xs text-muted-foreground bg-muted p-0.5 min-w-[1.2rem] text-center rounded-md"
              >{{ b.count }}</span
            >
          </button>
        </div>

        <!-- Load More Brands -->
        <div
          v-if="brands.length < brandsTotal"
          class="mt-6 flex justify-center"
        >
          <button
            @click="fetchBrands(true)"
            :disabled="loadingBrands"
            class="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-xl transition-all"
          >
            <Loader2 v-if="loadingBrands" class="h-4 w-4 animate-spin" />
            <ChevronDown v-else class="h-4 w-4" />
            {{ $t("common.viewMore") }}
          </button>
        </div>
      </div>

      <!-- Update Time Footer -->
      <div
        v-if="updateTime"
        class="mt-8 pt-6 border-t border-muted/30 text-center"
      >
        <p
          class="text-xs text-muted-foreground flex items-center justify-center gap-2"
        >
          <Clock class="h-3 w-3" />
          <span
            >数据库更新于 {{ updateTime.split(" ")[1] }},
            {{ relativeTime }}</span
          >
        </p>
      </div>

      <!-- Drawer Detail View -->
      <div
        class="fixed inset-0 z-100 flex items-end justify-center sheet-backdrop"
        :class="selectedModel ? 'sheet-open' : 'sheet-closed'"
        @click.self="selectedModel = null"
      >
        <div
          class="bg-card/90 backdrop-blur-md w-full max-w-3xl rounded-t-3xl flex flex-col shadow-2xl sheet-panel transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          :style="{ height: `${sheetHeight}vh` }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
        >
          <!-- Handle -->
          <div
            class="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0"
            @click="
              isExpanded = !isExpanded;
              sheetHeight = isExpanded ? 100 : 85;
            "
          >
            <div class="w-10 h-1 rounded-full bg-muted-foreground/20" />
          </div>

          <!-- Header -->
          <div class="flex items-center gap-4 px-6 py-4 border-b shrink-0">
            <div
              class="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"
            >
              <Smartphone class="h-7 w-7" />
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="text-lg font-bold truncate text-important"
                v-html="
                  highlightMatches(
                    selectedModel?.model_name ||
                      selectedModel?.market_name ||
                      selectedModel?.model,
                  )
                "
              ></h3>
              <div class="flex gap-2 mt-1">
                <span
                  class="px-2 py-0.5 rounded-md bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wide"
                >
                  {{ selectedModel?.brand }}
                </span>
                <span
                  v-if="selectedModel?.device_type"
                  class="px-2 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-medium capitalize"
                >
                  {{ selectedModel?.device_type }}
                </span>
              </div>
            </div>
            <button @click="selectedModel = null" class="btn-icon">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6 touch-pan-y">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Info -->
              <div class="space-y-4">
                <h3
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3"
                >
                  基本信息
                </h3>
                <div class="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span class="text-muted-foreground self-center"
                    >型号 (Model)</span
                  >
                  <div class="flex items-center gap-2 group min-w-0">
                    <span
                      class="font-medium font-mono select-all truncate"
                      v-html="highlightMatches(selectedModel?.model)"
                    ></span>
                    <button
                      @click="copyToClipboard(selectedModel?.model)"
                      class="transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                      title="复制"
                    >
                      <Copy class="h-3 w-3" />
                    </button>
                  </div>

                  <span class="text-muted-foreground self-center"
                    >代号 (Code)</span
                  >
                  <div class="flex items-center gap-2 group min-w-0">
                    <span
                      class="font-medium font-mono select-all truncate"
                      v-html="highlightMatches(selectedModel?.code)"
                    ></span>
                    <button
                      @click="copyToClipboard(selectedModel?.code)"
                      class="transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                      title="复制"
                    >
                      <Copy class="h-3 w-3" />
                    </button>
                  </div>

                  <span
                    v-if="selectedModel?.code_alias"
                    class="text-muted-foreground self-center"
                    >别名 (Alias)</span
                  >
                  <div
                    v-if="selectedModel?.code_alias"
                    class="flex items-center gap-2 group min-w-0"
                  >
                    <span
                      class="font-medium font-mono select-all truncate"
                      v-html="highlightMatches(selectedModel?.code_alias)"
                    ></span>
                    <button
                      @click="copyToClipboard(selectedModel?.code_alias)"
                      class="transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                      title="复制"
                    >
                      <Copy class="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Other Info -->
              <div class="space-y-4">
                <h3
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3"
                >
                  其他参数
                </h3>
                <div class="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <template v-for="(val, key) in selectedModel" :key="key">
                    <template
                      v-if="
                        ![
                          'id',
                          'brand',
                          'model',
                          'model_name',
                          'code',
                          'code_alias',
                          'market_name',
                          'device_type',
                        ].includes(String(key))
                      "
                    >
                      <span
                        class="text-muted-foreground capitalize self-center"
                        >{{ String(key).replace(/_/g, " ") }}</span
                      >
                      <div class="flex items-center gap-2 group min-w-0">
                        <template v-if="val && String(val).trim()">
                          <span
                            class="font-medium break-all"
                            v-html="highlightMatches(String(val))"
                          ></span>
                          <button
                            @click="copyToClipboard(val)"
                            class="transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                            title="复制"
                          >
                            <Copy class="h-3 w-3" />
                          </button>
                        </template>
                        <span
                          v-else
                          class="text-muted-foreground/40 italic text-xs"
                        >
                          此项数据为空
                        </span>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.sheet-backdrop {
  background-color: transparent;
  backdrop-filter: blur(0px);
  transition:
    background-color 500ms cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 500ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s;
  will-change: background-color, backdrop-filter;
}

.sheet-backdrop.sheet-open {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  pointer-events: auto;
  visibility: visible;
}

.sheet-backdrop.sheet-closed {
  pointer-events: none;
  visibility: hidden;
  transition:
    background-color 500ms cubic-bezier(0.4, 0, 0.2, 1),
    backdrop-filter 500ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s 500ms;
}

.sheet-panel {
  transform: translateY(100%);
  transition:
    transform 500ms cubic-bezier(0.32, 0.72, 0, 1),
    height 500ms cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform, height;
}

.sheet-open .sheet-panel {
  transform: translateY(0);
}

.sheet-closed .sheet-panel {
  transform: translateY(100%);
}
</style>
