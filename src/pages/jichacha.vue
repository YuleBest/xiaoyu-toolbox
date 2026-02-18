<script setup lang="ts">
import { ref, onMounted, watch, inject } from "vue";
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
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  getBrandStats,
  searchModels,
  type BrandStats,
  type MobileModel,
} from "@/api/jichacha";

const { t } = useI18n();
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

// --- Methods ---

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
  // The API supports empty Q if other params are present.

  if (!kw && !selectedDtype.value) return;

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
      // Note: We use 'error' ref to show the message, but it might not be styled as an error.
      // Ideally we should use a separate 'info' or 'warning' ref, but for now reuse error with specific styling?
      // Actually let's assume the error box style is generic enough or add a new state.
    }
  } catch (e) {
    console.error("Frontend Search Error:", e);
    error.value = t("common.error");
    if (append) searchPage.value--;
  } finally {
    searching.value = false;
  }
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
  // showSearchResults.value = false; // Drawer sits on top, so we keep results visible
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
  fetchBrands();
});
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Search Bar & Filter -->
      <div class="space-y-4">
        <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
          <div class="flex gap-3">
            <div class="relative flex-1">
              <Search
                class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              />
              <input
                v-model="searchKeyword"
                type="text"
                :placeholder="$t('tools.jichacha.searchPlaceholder')"
                class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                @keyup.enter="handleSearch(false)"
              />
            </div>
            <button
              @click="handleSearch(false)"
              :disabled="(!searchKeyword.trim() && !selectedDtype) || searching"
              class="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-medium hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
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
            v-if="
              dtypes.length > 0 &&
              (searchKeyword.trim() || searchResults.length > 0)
            "
            class="mt-4 flex flex-wrap gap-2 items-center"
          >
            <div
              class="flex items-center gap-2 text-xs text-muted-foreground mr-2"
            >
              <Filter class="h-3 w-3" />
              {{ $t("tools.jichacha.filterType") }}:
            </div>
            <button
              @click="toggleDtype('')"
              class="px-3 py-1 rounded-full text-xs font-medium transition-all border"
              :class="
                !selectedDtype
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
              "
            >
              {{ $t("common.all") }}
            </button>
            <button
              v-for="d in dtypes"
              :key="d.dtype"
              @click="toggleDtype(d.dtype)"
              class="px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5"
              :class="
                selectedDtype === d.dtype
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
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
        class="px-5 py-4 rounded-2xl flex items-start gap-3"
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

      <!-- Overview: Brands Cloud -->
      <div
        v-if="!showSearchResults && !selectedModel && brands.length > 0"
        class="bg-card/30 border border-muted/80 rounded-3xl p-6"
      >
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag class="h-5 w-5 text-emerald-500" />
          {{ $t("tools.jichacha.brands") }}
        </h3>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="b in brands"
            :key="b.brand"
            @click="
              searchKeyword = b.brand;
              handleSearch(false);
            "
            class="px-3 py-1.5 bg-background border border-muted rounded-xl text-sm hover:border-emerald-500 hover:text-emerald-500 transition-colors flex items-center gap-2"
          >
            <span class="font-medium">{{ b.brand_title || b.brand }}</span>
            <span
              class="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md"
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

      <!-- Search Results -->
      <Transition name="slide">
        <div
          v-if="showSearchResults && searchResults.length > 0"
          class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
        >
          <div
            class="px-5 py-4 border-b border-muted/30 flex items-center justify-between"
          >
            <h3 class="text-sm font-semibold text-foreground">
              <span class="text-muted-foreground font-normal mr-1">{{
                searchTotal
              }}</span>
              {{ $t("tools.jichacha.totalModels") }}
            </h3>
            <div v-if="selectedDtype" class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground"
                >{{ $t("tools.jichacha.filterType") }}:</span
              >
              <span
                class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-medium"
                >{{ $t(`tools.jichacha.dtypes.${selectedDtype}`) }}</span
              >
              <button
                @click="toggleDtype('')"
                class="text-muted-foreground hover:text-foreground"
              >
                <X class="h-3 w-3" />
              </button>
            </div>
          </div>
          <div class="divide-y divide-muted/20 max-h-[600px] overflow-y-auto">
            <button
              v-for="model in searchResults"
              :key="model.id"
              @click="selectModel(model)"
              class="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-muted/10 transition-colors group"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider"
                  >
                    {{ shortBrand(model.brand) }}
                  </span>
                  <h4 class="text-sm font-semibold text-foreground truncate">
                    {{ model.model_name || model.market_name || model.model }}
                  </h4>
                </div>
                <div
                  class="flex items-center gap-3 text-xs text-muted-foreground"
                >
                  <span
                    v-if="model.code_alias"
                    class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"
                  >
                    <Cpu class="h-3 w-3" />
                    {{ model.code_alias }}
                  </span>
                  <span v-else class="flex items-center gap-1">
                    <Cpu class="h-3 w-3" />
                    {{ model.code }}
                  </span>

                  <span
                    v-if="model.model !== model.model_name"
                    class="flex items-center gap-1"
                  >
                    <QrCode class="h-3 w-3" />
                    {{ model.model }}
                  </span>
                </div>
              </div>
            </button>

            <!-- Load More Results -->
            <div
              v-if="searchResults.length < searchTotal"
              class="p-4 flex justify-center"
            >
              <button
                @click="handleSearch(true)"
                :disabled="searching"
                class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-all"
              >
                <Loader2 v-if="searching" class="h-4 w-4 animate-spin" />
                <span v-else>{{ $t("common.viewMore") }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

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
              class="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"
            >
              <Smartphone class="h-7 w-7" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold truncate text-important">
                {{
                  selectedModel?.model_name ||
                  selectedModel?.market_name ||
                  selectedModel?.model
                }}
              </h3>
              <div class="flex gap-2 mt-1">
                <span
                  class="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide"
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
                    <span class="font-medium font-mono select-all truncate">{{
                      selectedModel?.model
                    }}</span>
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
                    <span class="font-medium font-mono select-all truncate">{{
                      selectedModel?.code
                    }}</span>
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
                    <span class="font-medium font-mono select-all truncate">{{
                      selectedModel?.code_alias
                    }}</span>
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
                        ].includes(String(key)) && val
                      "
                    >
                      <span
                        class="text-muted-foreground capitalize self-center"
                        >{{ String(key).replace(/_/g, " ") }}</span
                      >
                      <div class="flex items-center gap-2 group min-w-0">
                        <span class="font-medium break-all">{{ val }}</span>
                        <button
                          @click="copyToClipboard(val)"
                          class="transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                          title="复制"
                        >
                          <Copy class="h-3 w-3" />
                        </button>
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
