<script setup lang="ts">
import { ref, onMounted, watch, inject, computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  Calendar,
  ArrowRightLeft,
  ChevronDown,
  Search,
  History,
  TrendingUp,
  Loader2,
  AlertCircle,
  Clock,
  RefreshCcw,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  getLatestRates,
  getHistoricalRates,
  getTimeSeries,
  getCurrencies,
  type FrankfurterResponse,
} from "@/api/frankfurter";
import {
  VisXYContainer,
  VisGroupedBar,
  VisAxis,
  VisCrosshair,
  VisTooltip,
} from "@unovis/vue";
import {
  ChartContainer,
  ChartTooltipContent,
  componentToString,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const { t } = useI18n();
const tool = allTools.find((t) => t.id === "exchange")!;

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

// Data
const currencies = ref<Record<string, string>>({});
const baseCurrency = ref("CNY");
const targetCurrency = ref("USD");
const amount = ref(1);
const date = ref(new Date().toISOString().split("T")[0]);
const isHistory = ref(false);
const loading = ref(false);
const ratesData = ref<FrankfurterResponse | null>(null);
const trendData = ref<ChartData[]>([]);
const loadingTrend = ref(false);
const lastUpdated = ref<number | null>(null);
const searchQuery = ref("");

// Computed
interface ChartData {
  date: string | Date;
  rate: number;
}
const chartConfig: ChartConfig = {
  rate: {
    label: "汇率",
    color: "var(--chart-1)",
  },
};

const yDomain = computed<[number, number]>(() => {
  if (trendData.value.length === 0) return [0, 1];
  const rates = trendData.value.map((d) => d.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  return [min * 0.9, max * 1.1];
});

const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  }).format(new Date(lastUpdated.value));
});

const filteredCurrencies = computed(() => {
  if (!searchQuery.value) return currencies.value;
  const query = searchQuery.value.toLowerCase();
  return Object.fromEntries(
    Object.entries(currencies.value).filter(
      ([code, name]) =>
        code.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query),
    ),
  );
});

const convertedValue = computed(() => {
  const rate = ratesData.value?.rates?.[targetCurrency.value];
  if (rate === undefined) return "0.00";
  return (amount.value * rate).toFixed(2);
});

const getFlagEmoji = (code: string) => {
  const flags: Record<string, string> = {
    AUD: "🇦🇺",
    BGN: "🇧🇬",
    BRL: "🇧🇷",
    CAD: "🇨🇦",
    CHF: "🇨🇭",
    CNY: "🇨🇳",
    CZK: "🇨🇿",
    DKK: "🇩🇰",
    EUR: "🇪🇺",
    GBP: "🇬🇧",
    HKD: "🇭🇰",
    HUF: "🇭🇺",
    IDR: "🇮🇩",
    ILS: "🇮🇱",
    INR: "🇮🇳",
    ISK: "🇮🇸",
    JPY: "🇯🇵",
    KRW: "🇰🇷",
    MXN: "🇲🇽",
    MYR: "🇲🇾",
    NOK: "🇳🇴",
    NZD: "🇳🇿",
    PHP: "🇵🇭",
    PLN: "🇵🇱",
    RON: "🇷🇴",
    SEK: "🇸🇪",
    SGD: "🇸🇬",
    THB: "🇹🇭",
    TRY: "🇹🇷",
    USD: "🇺🇸",
    ZAR: "🇿🇦",
  };
  return flags[code] || "";
};

// Methods
const fetchCurrencyList = async () => {
  try {
    const rawCurrencies = await getCurrencies();
    currencies.value = Object.fromEntries(
      Object.entries(rawCurrencies).map(([code, englishName]) => {
        const translatedName = t(`exchange.currencies.${code}`);
        // If i18n returns the key itself, it means translation is missing
        return [
          code,
          translatedName.includes("exchange.currencies")
            ? englishName
            : translatedName,
        ];
      }),
    );
  } catch (err) {
    console.error(err);
    showToast(t("exchange.fetchFailed"), "error");
  }
};

// 6 hours cache (in milliseconds)
const CACHE_DURATION = 6 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = "exchange_rates_";

const fetchData = async (force: boolean = false) => {
  loading.value = true;
  const cacheKey = `${CACHE_KEY_PREFIX}${baseCurrency.value}_${isHistory.value ? date.value : "latest"}`;

  try {
    let result = null;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          result = data;
          lastUpdated.value = timestamp;
        }
      }
    }

    if (!result) {
      if (isHistory.value && date.value) {
        result = await getHistoricalRates(date.value, baseCurrency.value);
      } else {
        result = await getLatestRates(baseCurrency.value);
      }
      lastUpdated.value = Date.now();
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data: result, timestamp: lastUpdated.value }),
      );
    }

    ratesData.value = result;

    // Fetch trend data
    if (!isHistory.value) {
      loadingTrend.value = true;
      trendData.value = [];
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 90);
      const startStr = start.toISOString().split("T")[0] || "";
      const endStr = end.toISOString().split("T")[0] || "";

      try {
        const target = targetCurrency.value;
        const trend = await getTimeSeries(
          startStr,
          endStr,
          baseCurrency.value,
          target,
        );
        trendData.value = Object.entries(trend.rates)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([d, r]) => ({
            date: new Date(d),
            rate: (r as Record<string, number>)[target] || 0,
          }));

        // Fill missing dates (weekends/holidays) with nearest previous rate
        if (trendData.value.length > 0) {
          const filled: ChartData[] = [];
          const startDate = new Date(startStr);
          const endDate = new Date(endStr);
          let lastRate = trendData.value[0]!.rate;
          const rateMap = new Map(
            trendData.value.map((d) => [
              (d.date as Date).toISOString().split("T")[0],
              d.rate,
            ]),
          );

          for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
          ) {
            const key = d.toISOString().split("T")[0];
            if (rateMap.has(key)) {
              lastRate = rateMap.get(key)!;
            }
            filled.push({ date: new Date(d), rate: lastRate });
          }
          trendData.value = filled;
        }
      } catch (e) {
        console.error("Failed to fetch trend", e);
      } finally {
        loadingTrend.value = false;
      }
    }
  } catch (err) {
    console.error(err);
    showToast(t("exchange.fetchFailed"), "error");
  } finally {
    loading.value = false;
  }
};

const onRefresh = () => fetchData(true);

const swapCurrencies = () => {
  const temp = baseCurrency.value;
  baseCurrency.value = targetCurrency.value;
  targetCurrency.value = temp;
};

const resetDate = () => {
  isHistory.value = false;
  date.value = new Date().toISOString().split("T")[0];
};

// Lifecycle & Watchers
onMounted(() => {
  fetchCurrencyList();
  fetchData(false); // Initial load uses cache
});

watch([baseCurrency, targetCurrency, isHistory, date], () => {
  fetchData();
});

// Ensure targetCurrency exists in rates when switching base
watch(baseCurrency, (newBase) => {
  if (targetCurrency.value === newBase) {
    // Pick another default if they match
    targetCurrency.value = newBase === "USD" ? "EUR" : "USD";
  }
});
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <!-- Main Converter Card -->
      <div
        class="bg-card/30 border border-muted/80 rounded-[32px] p-6 md:p-10 relative overflow-hidden"
      >
        <!-- Background accents -->
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32 rounded-full"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -ml-32 -mb-32 rounded-full"
        ></div>

        <div
          class="relative grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 md:gap-10 items-end"
        >
          <!-- From -->
          <div class="space-y-3">
            <label
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1"
            >
              {{ t("exchange.baseCurrency") }}
            </label>
            <div class="group relative">
              <select
                v-model="baseCurrency"
                class="w-full appearance-none bg-background border border-muted/80 rounded-2xl px-5 py-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all cursor-pointer"
              >
                <option
                  v-for="(name, code) in currencies"
                  :key="code"
                  :value="code"
                >
                  {{ getFlagEmoji(code) }} {{ code }} - {{ name }}
                </option>
              </select>
              <ChevronDown
                class="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors"
              />
            </div>
            <div class="relative">
              <input
                v-model.number="amount"
                type="number"
                min="0"
                step="0.01"
                class="w-full bg-background border border-muted/80 rounded-2xl px-5 py-4 text-2xl font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-mono"
              />
              <div
                class="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold"
              >
                {{ baseCurrency }}
              </div>
            </div>
          </div>

          <!-- Swap Button -->
          <div class="flex justify-center pb-2 md:pb-4">
            <button
              @click="swapCurrencies"
              class="h-12 w-12 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
              title="Swap"
            >
              <ArrowRightLeft
                class="h-6 w-6 group-hover:rotate-180 transition-transform duration-500"
              />
            </button>
          </div>

          <!-- To -->
          <div class="space-y-3">
            <label
              class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1"
            >
              {{ t("exchange.targetCurrency") }}
            </label>
            <div class="group relative">
              <select
                v-model="targetCurrency"
                class="w-full appearance-none bg-background border border-muted/80 rounded-2xl px-5 py-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all cursor-pointer"
              >
                <option
                  v-for="(name, code) in currencies"
                  :key="code"
                  :value="code"
                  :disabled="code === baseCurrency"
                >
                  {{ getFlagEmoji(code) }} {{ code }} - {{ name }}
                </option>
              </select>
              <ChevronDown
                class="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors"
              />
            </div>
            <div class="relative">
              <div
                class="w-full bg-muted/20 border border-muted/40 rounded-2xl px-5 py-4 text-2xl font-black text-important flex items-center min-h-[64px] font-mono"
              >
                <Loader2
                  v-if="loading"
                  class="h-6 w-6 animate-spin text-blue-500"
                />
                <span v-else>{{ convertedValue }}</span>
                <div class="ml-auto text-muted-foreground font-bold text-base">
                  {{ targetCurrency }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Date & Mode Selector -->
        <div
          class="mt-10 flex flex-wrap items-center gap-4 pt-8 border-t border-muted/30"
        >
          <div class="flex bg-muted/30 p-1 rounded-xl">
            <button
              @click="resetDate"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              :class="
                !isHistory
                  ? 'bg-background shadow-sm text-blue-500'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              <TrendingUp class="w-4 h-4 inline-block mr-1.5" />
              {{ t("exchange.latestRates") }}
            </button>
            <button
              @click="isHistory = true"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              :class="
                isHistory
                  ? 'bg-background shadow-sm text-blue-500'
                  : 'text-muted-foreground hover:text-foreground'
              "
            >
              <History class="w-4 h-4 inline-block mr-1.5" />
              {{ t("exchange.historicalDate") }}
            </button>
          </div>

          <div
            v-if="isHistory"
            class="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
          >
            <div class="relative">
              <Calendar
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <input
                v-model="date"
                type="date"
                min="2001-01-01"
                :max="new Date().toISOString().split('T')[0]"
                class="bg-background border border-muted rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div
            class="ml-auto flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Clock class="w-3.5 h-3.5" />
            <span :title="'API Ref: ' + ratesData?.date">{{
              formattedLastUpdated
            }}</span>
            <button
              @click="onRefresh"
              class="p-1.5 hover:bg-muted/50 rounded-lg transition-colors ml-1"
              :class="{ 'animate-spin': loading }"
              :disabled="loading"
            >
              <RefreshCcw class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Trend Chart Section -->
      <div
        v-if="!isHistory"
        class="bg-card/30 border border-muted/80 rounded-[32px] p-6 md:p-8"
      >
        <div class="flex items-center justify-between mb-8 px-2">
          <div class="space-y-1">
            <h3 class="flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-blue-500" />
              {{ getFlagEmoji(baseCurrency) }} {{ baseCurrency }} /
              {{ getFlagEmoji(targetCurrency) }} {{ targetCurrency }}
            </h3>
            <p class="text-xs text-muted-foreground">
              {{ t("exchange.last30DaysTrend") }}
            </p>
          </div>
        </div>

        <div
          v-if="loadingTrend"
          class="h-[260px] flex items-center justify-center"
        >
          <Loader2 class="h-8 w-8 animate-spin text-blue-500/50" />
        </div>
        <div
          v-else-if="trendData.length === 0"
          class="h-[260px] flex items-center justify-center text-muted-foreground text-sm"
        >
          暂无汇率趋势数据
        </div>
        <ChartContainer v-else :config="chartConfig" class="h-[260px] w-full">
          <VisXYContainer :data="trendData" :y-domain="yDomain">
            <VisGroupedBar
              :x="(d: ChartData) => d.date"
              :y="[(d: ChartData) => d.rate]"
              :color="[chartConfig.rate?.color ?? '']"
              :bar-padding="0.2"
              :rounded-corners="4"
            />
            <VisAxis
              type="x"
              :x="(d: ChartData) => d.date"
              :tick-line="false"
              :domain-line="false"
              :grid-line="false"
              :tick-format="
                (d: number) => {
                  const date = new Date(d);
                  return date.toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  });
                }
              "
              :num-ticks="6"
            />
            <VisAxis
              type="y"
              :tick-line="false"
              :domain-line="false"
              :grid-line="true"
              :tick-format="(d: number) => d.toFixed(4)"
              :num-ticks="5"
            />
            <VisTooltip />
            <VisCrosshair
              :template="
                componentToString(chartConfig, ChartTooltipContent, {
                  labelFormatter(d: number | Date) {
                    return new Date(d).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                  },
                })
              "
              :color="[chartConfig.rate?.color ?? '']"
            />
          </VisXYContainer>
        </ChartContainer>
      </div>

      <!-- Result Grid -->
      <div v-if="ratesData" class="space-y-5">
        <div class="flex items-center justify-between px-2">
          <h3 class="flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-blue-500" />
            {{ t("exchange.allRates") }}
            <span
              class="text-xs font-normal text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full ml-1"
            >
              1 {{ baseCurrency }} =
            </span>
          </h3>

          <div class="relative w-48 md:w-64">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('exchange.searchCurrency')"
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-muted/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="(rate, code) in ratesData.rates"
            v-show="filteredCurrencies[code]"
            :key="code"
            class="bg-card/20 border border-muted/50 rounded-2xl p-4 hover:border-blue-500/30 hover:bg-muted/10 transition-all cursor-pointer group"
            @click="targetCurrency = code"
          >
            <div class="flex items-center justify-between mb-3 text-xs">
              <span class="font-black text-blue-500">
                {{ getFlagEmoji(code) }} {{ code }}
              </span>
              <span
                class="text-[10px] text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                >Select</span
              >
            </div>
            <div
              class="text-xl font-mono font-bold text-important leading-none mb-1"
            >
              {{ rate.toFixed(4) }}
            </div>
            <div
              class="text-[10px] text-muted-foreground truncate"
              :title="currencies[code]"
            >
              {{ currencies[code] }}
            </div>
          </div>
        </div>

        <div
          v-if="Object.keys(filteredCurrencies).length === 0"
          class="py-20 flex flex-col items-center gap-3 opacity-30"
        >
          <Search class="h-12 w-12" />
          <p>{{ t("search.emptyTitle") }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="!loading && !ratesData"
        class="py-20 flex flex-col items-center gap-4 text-center"
      >
        <div
          class="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center"
        >
          <AlertCircle class="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h3 class="text-lg font-bold">{{ t("exchange.fetchFailed") }}</h3>
          <p class="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
            Could not retrieve exchange rate data. Please check your network
            connection and try again.
          </p>
        </div>
        <button @click="onRefresh" class="btn-primary py-2.5 px-6">
          <RefreshCcw class="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    </div>
  </ToolContainer>
</template>

<style scoped>
/* Standard number input spin buttons removal */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.animate-in {
  animation-duration: 0.3s;
}
</style>
