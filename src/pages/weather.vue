<script setup lang="ts">
import { ref, inject } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRainWind,
  CloudLightning,
  Snowflake,
  Loader2,
} from "lucide-vue-next";
import ToolContainer from "@/components/tool/ToolContainer.vue";
import { allTools } from "@/config/tools";
import {
  searchCity,
  fetchWeather,
  getWeatherDescription,
  type CityResult,
  type CurrentWeather,
  type HourlyData,
  type DailyData,
} from "@/api/weather";

const showToast = inject("showToast") as (
  msg: string,
  type?: "warning" | "error",
) => void;

const tool = allTools.find((t) => t.id === "weather")!;

const searchQuery = ref("");
const searchResults = ref<CityResult[]>([]);
const selectedLocation = ref<CityResult | null>(null);
const searching = ref(false);
const loading = ref(false);
const currentWeather = ref<CurrentWeather | null>(null);
const hourlyForecast = ref<HourlyData[]>([]);
const dailyForecast = ref<DailyData[]>([]);
const error = ref("");

const iconComponents: Record<string, any> = {
  sun: Sun,
  cloud: Cloud,
  "cloud-sun": CloudSun,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  snowflake: Snowflake,
  "cloud-rain-wind": CloudRainWind,
  "cloud-lightning": CloudLightning,
};

const getWeatherIconName = (code: number): string => {
  if (code === 0) return "sun";
  if (code >= 1 && code <= 3) return "cloud-sun";
  if (code >= 45 && code <= 48) return "cloud-fog";
  if (code >= 51 && code <= 55) return "cloud-drizzle";
  if (code >= 61 && code <= 65) return "cloud-rain";
  if (code >= 71 && code <= 77) return "snowflake";
  if (code >= 80 && code <= 82) return "cloud-rain-wind";
  if (code >= 95 && code <= 99) return "cloud-lightning";
  return "cloud";
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;
  searching.value = true;
  searchResults.value = [];
  selectedLocation.value = null;
  error.value = "";

  try {
    const results = await searchCity(searchQuery.value.trim());
    if (results.length > 0) {
      searchResults.value = results;
    } else {
      showToast(t("weather.noResults"), "warning");
    }
  } catch {
    showToast(t("weather.searchFailed"), "error");
  } finally {
    searching.value = false;
  }
};

const selectCity = async (city: CityResult) => {
  selectedLocation.value = city;
  loading.value = true;
  error.value = "";

  try {
    const data = await fetchWeather(city.latitude, city.longitude);
    currentWeather.value = data.current;
    hourlyForecast.value = data.hourly;
    dailyForecast.value = data.daily;
  } catch {
    error.value = t("weather.searchFailed");
    showToast(t("weather.searchFailed"), "error");
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value === "zh-CN" ? "zh-CN" : "en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatHour = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value === "zh-CN" ? "zh-CN" : "en-US", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};
</script>

<template>
  <ToolContainer :tool="tool">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Search Section -->
      <div class="bg-card/30 border border-muted/80 rounded-3xl p-5 md:p-6">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('weather.searchPlaceholder')"
              class="w-full pl-11 pr-4 py-3 bg-background border border-muted rounded-2xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              @keyup.enter="handleSearch"
            />
          </div>
          <button
            @click="handleSearch"
            :disabled="!searchQuery.trim() || searching"
            class="btn-primary px-6 py-3"
          >
            <Loader2 v-if="searching" class="h-4 w-4 animate-spin" />
            <Search v-else class="h-4 w-4" />
            {{ $t("common.search") }}
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <Transition name="slide">
        <div
          v-if="searchResults.length > 0 && !selectedLocation"
          class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
        >
          <div class="px-5 py-4 border-b border-muted/30">
            <h3>
              {{ $t("weather.noResults") }}
              <span class="text-muted-foreground font-normal ml-1"
                >{{ searchResults.length }} 个</span
              >
            </h3>
          </div>
          <div class="divide-y divide-muted/20 max-h-[400px] overflow-y-auto">
            <button
              v-for="result in searchResults"
              :key="result.id"
              @click="selectCity(result)"
              class="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-muted/10 transition-colors group"
            >
              <div
                class="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0"
              >
                <span
                  v-if="result.country_code"
                  class="text-xs font-bold text-blue-500"
                  >{{ result.country_code }}</span
                >
                <MapPin v-else class="h-4 w-4 text-blue-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-important truncate">
                  {{ result.name }}
                </p>
                <p class="text-xs text-muted-foreground truncate mt-0.5">
                  <span v-if="result.admin1">{{ result.admin1 }}, </span>
                  {{ result.country }}
                  <span class="ml-1"
                    >({{ result.latitude.toFixed(2) }},
                    {{ result.longitude.toFixed(2) }})</span
                  >
                </p>
              </div>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <Loader2 class="h-10 w-10 text-blue-500 animate-spin" />
      </div>

      <!-- Weather Display -->
      <Transition name="slide">
        <div
          v-if="currentWeather && selectedLocation && !loading"
          class="space-y-6"
        >
          <!-- Main Weather Card -->
          <div
            class="rounded-3xl p-6 md:p-8 text-white overflow-hidden relative"
            style="
              background: linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%);
            "
          >
            <div
              class="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4"
            >
              <div>
                <h2>
                  {{ selectedLocation.name }}
                </h2>
                <p class="text-white/70 mb-4">{{ formatDate(new Date()) }}</p>
                <div class="flex items-center justify-center sm:justify-start">
                  <span class="text-5xl md:text-6xl font-bold"
                    >{{ Math.round(currentWeather.temperature) }}°</span
                  >
                  <div class="ml-4 text-left">
                    <p class="text-lg font-medium">
                      {{ getWeatherDescription(currentWeather.weatherCode) }}
                    </p>
                    <p class="text-sm text-white/70">
                      H:{{ Math.round(dailyForecast[0]?.maxTemp ?? 0) }}° L:{{
                        Math.round(dailyForecast[0]?.minTemp ?? 0)
                      }}°
                    </p>
                  </div>
                </div>
              </div>
              <component
                :is="
                  iconComponents[getWeatherIconName(currentWeather.weatherCode)]
                "
                class="h-20 w-20 text-white/90"
                style="filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))"
              />
            </div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div class="bg-card/30 border border-muted/80 rounded-2xl p-4">
              <div
                class="flex items-center gap-1 text-xs text-muted-foreground mb-2"
              >
                <Droplets class="h-3.5 w-3.5 text-blue-500" />
                {{ $t("weather.humidity") }}
              </div>
              <p class="text-xl md:text-2xl font-bold">
                {{ currentWeather.humidity }}%
              </p>
            </div>
            <div class="bg-card/30 border border-muted/80 rounded-2xl p-4">
              <div
                class="flex items-center gap-1 text-xs text-muted-foreground mb-2"
              >
                <Wind class="h-3.5 w-3.5 text-slate-500" />
                {{ $t("weather.windSpeed") }}
              </div>
              <p class="text-xl md:text-2xl font-bold">
                {{ currentWeather.windSpeed.toFixed(1) }}
                <span class="text-xs font-normal">km/h</span>
              </p>
            </div>
            <div class="bg-card/30 border border-muted/80 rounded-2xl p-4">
              <div
                class="flex items-center gap-1 text-xs text-muted-foreground mb-2"
              >
                <Thermometer class="h-3.5 w-3.5 text-red-500" />
                {{ $t("weather.feelsLike") }}
              </div>
              <p class="text-xl md:text-2xl font-bold">
                {{ Math.round(currentWeather.feelsLike) }}°
              </p>
            </div>
            <div class="bg-card/30 border border-muted/80 rounded-2xl p-4">
              <div
                class="flex items-center gap-1 text-xs text-muted-foreground mb-2"
              >
                <CloudRain class="h-3.5 w-3.5 text-cyan-500" />
                {{ $t("weather.precipitation") }}
              </div>
              <p class="text-xl md:text-2xl font-bold">
                {{ hourlyForecast[0]?.precipitationProbability || 0 }}%
              </p>
            </div>
          </div>

          <!-- Hourly Forecast -->
          <div>
            <h3 class="mb-4 px-1">
              {{ $t("weather.hourlyForecast") }}
            </h3>
            <div
              class="bg-card/30 border border-muted/80 rounded-3xl overflow-hidden"
            >
              <div
                class="flex overflow-x-auto p-4 gap-4"
                style="-webkit-overflow-scrolling: touch"
              >
                <div
                  v-for="(hour, i) in hourlyForecast.slice(0, 24)"
                  :key="i"
                  class="text-center shrink-0"
                  style="min-width: 60px"
                >
                  <p class="text-xs text-muted-foreground mb-2">
                    {{ formatHour(hour.time) }}
                  </p>
                  <component
                    :is="iconComponents[getWeatherIconName(hour.weatherCode)]"
                    class="h-5 w-5 mx-auto mb-2"
                    :class="i === 0 ? 'text-blue-500' : 'text-muted-foreground'"
                  />
                  <p class="text-sm font-bold">{{ Math.round(hour.temp) }}°</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Empty State -->
      <div
        v-if="
          !currentWeather &&
          !loading &&
          !searching &&
          searchResults.length === 0
        "
        class="flex flex-col items-center gap-4 py-16 opacity-30"
      >
        <MapPin class="h-16 w-16" />
        <p class="text-lg font-medium">{{ $t("weather.searchPlaceholder") }}</p>
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
</style>
