<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Search, Info, Smartphone, Cpu, QrCode, Tag } from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  getBrandStats,
  searchModels,
  type BrandStats,
  type MobileModel,
} from "@/api/jichacha";

const { t } = useI18n();

const tool = allTools.find((t) => t.id === "jichacha")!;

// --- State ---
const searchKeyword = ref("");
const searching = ref(false);
const searchResults = ref<MobileModel[]>([]);
const showSearchResults = ref(false);
const error = ref("");
const brands = ref<BrandStats[]>([]);
const selectedModel = ref<MobileModel | null>(null);

// --- Methods ---
const fetchBrands = async () => {
  try {
    brands.value = await getBrandStats();
  } catch (e) {
    console.error("Failed to fetch brands", e);
  }
};

const handleSearch = async () => {
  const kw = searchKeyword.value.trim();
  if (!kw) return;

  error.value = "";
  searchResults.value = [];
  selectedModel.value = null;
  showSearchResults.value = true;
  searching.value = true;

  try {
    searchResults.value = await searchModels({ q: kw });
    if (searchResults.value.length === 0) {
      error.value = t("jichacha.noResults");
    }
  } catch {
    error.value = t("common.error");
  } finally {
    searching.value = false;
  }
};

const selectModel = (model: MobileModel) => {
  selectedModel.value = model;
  showSearchResults.value = false;
};

const backToResults = () => {
  showSearchResults.value = true;
  selectedModel.value = null;
};

const shortBrand = (brand: string) => {
  return brand.length > 10 ? brand.substring(0, 10) + "..." : brand;
};

onMounted(() => {
  fetchBrands();
});
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Search Bar -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="$t('jichacha.searchPlaceholder')"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
              @keyup.enter="handleSearch"
            />
          </div>
          <button
            @click="handleSearch"
            :disabled="!searchKeyword.trim() || searching"
            class="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-medium hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
          >
            <div
              v-if="searching"
              class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            <Search v-else class="h-4 w-4" />
            {{ $t("common.search") }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="px-5 py-4 bg-destructive/5 border border-destructive/10 rounded-2xl flex items-start gap-3"
      >
        <Info class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <p class="text-sm text-destructive font-medium">{{ error }}</p>
      </div>

      <!-- Overview: Brands Cloud -->
      <div
        v-if="!showSearchResults && !selectedModel && brands.length > 0"
        class="bg-card/30 border border-muted/80 rounded-3xl p-6"
      >
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <Tag class="h-5 w-5 text-emerald-500" />
          {{ $t("jichacha.brands") }}
        </h3>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="b in brands"
            :key="b.brand"
            @click="
              searchKeyword = b.brand;
              handleSearch();
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
      </div>

      <!-- Search Results -->
      <Transition name="slide">
        <div
          v-if="showSearchResults && searchResults.length > 0"
          class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
        >
          <div class="px-5 py-4 border-b border-muted/30">
            <h3 class="text-sm font-semibold text-foreground">
              {{ $t("jichacha.totalModels") }}
              <span class="text-muted-foreground font-normal ml-1">{{
                searchResults.length
              }}</span>
            </h3>
          </div>
          <div class="divide-y divide-muted/20 max-h-[500px] overflow-y-auto">
            <button
              v-for="model in searchResults"
              :key="model.id"
              @click="selectModel(model)"
              class="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-muted/10 transition-colors group"
            >
              <div
                class="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0"
              >
                <Smartphone class="h-5 w-5 text-emerald-500" />
              </div>
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
                  <span class="flex items-center gap-1">
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
          </div>
        </div>
      </Transition>

      <!-- Detail View -->
      <Transition name="slide">
        <div v-if="selectedModel" class="space-y-6">
          <div
            class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
          >
            <!-- Header -->
            <div class="bg-emerald-500/5 px-6 py-6 border-b border-muted/30">
              <button
                @click="backToResults"
                class="mb-4 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 transition-all"
              >
                ← {{ $t("common.back") }}
              </button>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h2 class="text-2xl font-bold text-foreground mb-2">
                    {{
                      selectedModel.model_name ||
                      selectedModel.market_name ||
                      selectedModel.model
                    }}
                  </h2>
                  <div class="flex flex-wrap gap-2">
                    <span
                      class="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold uppercase tracking-wide"
                    >
                      {{ selectedModel.brand }}
                    </span>
                    <span
                      v-if="selectedModel.device_type"
                      class="px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-medium capitalize"
                    >
                      {{ selectedModel.device_type }}
                    </span>
                  </div>
                </div>
                <Smartphone class="h-16 w-16 text-emerald-500/20" />
              </div>
            </div>

            <!-- Details Grid -->
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Info -->
              <div class="space-y-4">
                <h3
                  class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3"
                >
                  基本信息
                </h3>
                <div class="grid grid-cols-[100px_1fr] gap-2 text-sm">
                  <span class="text-muted-foreground">型号 (Model)</span>
                  <span class="font-medium font-mono select-all">{{
                    selectedModel.model
                  }}</span>

                  <span class="text-muted-foreground">代号 (Code)</span>
                  <span class="font-medium font-mono select-all">{{
                    selectedModel.code
                  }}</span>

                  <span
                    v-if="selectedModel.code_alias"
                    class="text-muted-foreground"
                    >别名 (Alias)</span
                  >
                  <span
                    v-if="selectedModel.code_alias"
                    class="font-medium font-mono select-all"
                    >{{ selectedModel.code_alias }}</span
                  >
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
                      <span class="text-muted-foreground capitalize">{{
                        String(key).replace(/_/g, " ")
                      }}</span>
                      <span class="font-medium break-all">{{ val }}</span>
                    </template>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
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
</style>
