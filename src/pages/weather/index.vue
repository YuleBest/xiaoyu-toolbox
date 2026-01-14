<template>
  <ToolContainer id="weather">
    <div class="weather-container w-100 h-100 d-flex flex-column pa-md-4">
      <!-- Search Section -->
      <div class="search-section sticky-top mb-6">
        <v-card class="rounded-xl" elevation="0" border>
          <div class="d-flex align-center pa-2">
            <v-text-field
              v-model="searchQuery"
              placeholder="搜索城市（例如“北京”、“New York”）"
              variant="solo"
              flat
              hide-details
              prepend-inner-icon="mdi-magnify"
              rounded="xl"
              @keydown.enter="searchCity"
            >
              <template v-slot:append-inner>
                <v-fade-transition>
                  <v-progress-circular
                    v-if="searching"
                    indeterminate
                    color="primary"
                    size="24"
                    width="2"
                  ></v-progress-circular>
                </v-fade-transition>
              </template>
            </v-text-field>
            <v-btn
              color="primary"
              class="ml-2 rounded-xl"
              height="48"
              elevation="0"
              @click="searchCity"
              :disabled="!searchQuery"
            >
              搜索
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- Results List -->
      <v-fade-transition>
        <v-card
          v-if="searchResults.length > 0 && !selectedLocation"
          class="mb-6 rounded-xl overflow-y-auto"
          style="max-height: 400px"
          border
          elevation="0"
        >
          <v-list lines="two" class="py-2">
            <v-list-subheader>搜索结果</v-list-subheader>
            <template v-for="(result, index) in searchResults" :key="result.id">
              <v-list-item @click="selectCity(result)" link class="mb-1">
                <template v-slot:prepend>
                  <v-avatar color="surface-variant" variant="flat">
                    <span
                      v-if="result.country_code"
                      class="text-caption font-weight-bold"
                      >{{ result.country_code }}</span
                    >
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{
                  result.name
                }}</v-list-item-title>
                <v-list-item-subtitle>
                  <span v-if="result.admin1">{{ result.admin1 }}, </span>
                  <span>{{ result.country }}</span>
                  <span class="ml-2 text-caption"
                    >({{ result.latitude.toFixed(2) }},
                    {{ result.longitude.toFixed(2) }})</span
                  >
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider
                v-if="index < searchResults.length - 1"
                inset
              ></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-fade-transition>

      <!-- Weather Display -->
      <v-fade-transition mode="out-in">
        <div
          v-if="currentWeather && selectedLocation"
          class="flex-grow-1 overflow-auto"
        >
          <!-- Main Card -->
          <div class="d-flex justify-center mb-6">
            <v-card
              class="bg-gradient-primary rounded-xl text-white w-100"
              style="max-width: 600px"
              elevation="4"
            >
              <v-card-text class="pa-6">
                <div
                  class="d-flex flex-column flex-sm-row justify-space-between align-center text-center text-sm-left"
                >
                  <div>
                    <div class="text-h5 font-weight-bold mb-1">
                      {{ selectedLocation.name }}
                    </div>
                    <div class="text-subtitle-1 opacity-80 mb-4">
                      {{ formatDate(new Date()) }}
                    </div>
                    <div
                      class="d-flex align-center justify-center justify-sm-start"
                    >
                      <span class="text-h2 font-weight-bold"
                        >{{ Math.round(currentWeather.temperature) }}°</span
                      >
                      <div class="ml-4 text-left">
                        <div class="text-h6 font-weight-medium">
                          {{
                            getWeatherDescription(currentWeather.weatherCode)
                          }}
                        </div>
                        <div class="text-body-2 opacity-80">
                          H:{{ Math.round(dailyForecast[0]?.maxTemp) }}° L:{{
                            Math.round(dailyForecast[0]?.minTemp)
                          }}°
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="text-center mt-4 mt-sm-0">
                    <v-icon
                      :icon="getWeatherIcon(currentWeather.weatherCode)"
                      size="80"
                      class="weather-icon-shadow"
                    ></v-icon>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Details Grid -->
          <v-row>
            <v-col cols="6" md="3">
              <v-card class="h-100 rounded-xl pa-4" border variant="flat">
                <div
                  class="text-caption text-medium-emphasis mb-2 d-flex align-center"
                >
                  <v-icon
                    icon="mdi-water-percent"
                    color="blue"
                    size="small"
                    class="mr-1"
                  ></v-icon>
                  湿度
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ currentWeather.humidity }}%
                </div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card class="h-100 rounded-xl pa-4" border variant="flat">
                <div
                  class="text-caption text-medium-emphasis mb-2 d-flex align-center"
                >
                  <v-icon
                    icon="mdi-weather-windy"
                    color="grey"
                    size="small"
                    class="mr-1"
                  ></v-icon>
                  风速
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ currentWeather.windSpeed.toFixed(1) }}
                  <span class="text-caption">km/h</span>
                </div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card class="h-100 rounded-xl pa-4" border variant="flat">
                <div
                  class="text-caption text-medium-emphasis mb-2 d-flex align-center"
                >
                  <v-icon
                    icon="mdi-thermometer"
                    color="red"
                    size="small"
                    class="mr-1"
                  ></v-icon>
                  体感
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ Math.round(currentWeather.feelsLike) }}°
                </div>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card class="h-100 rounded-xl pa-4" border variant="flat">
                <div
                  class="text-caption text-medium-emphasis mb-2 d-flex align-center"
                >
                  <v-icon
                    icon="mdi-weather-rainy"
                    color="info"
                    size="small"
                    class="mr-1"
                  ></v-icon>
                  降水概率
                </div>
                <div class="text-h5 font-weight-bold">
                  {{ hourlyForecast[0]?.precipitationProbability || 0 }}%
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Hourly Forecast -->
          <div class="mt-6">
            <h3 class="text-h6 font-weight-bold mb-4 px-2">未来 24 小时</h3>
            <v-sheet class="rounded-xl overflow-hidden" border>
              <div class="d-flex overflow-x-auto pa-4 gap-4 scroll-container">
                <div
                  v-for="(hour, i) in hourlyForecast.slice(0, 24)"
                  :key="i"
                  class="text-center flex-shrink-0"
                  style="min-width: 60px"
                >
                  <div class="text-caption text-medium-emphasis mb-2">
                    {{ formatHour(hour.time) }}
                  </div>
                  <v-icon
                    :icon="getWeatherIcon(hour.weatherCode)"
                    class="mb-2"
                    :color="i === 0 ? 'primary' : ''"
                  ></v-icon>
                  <div class="font-weight-bold">
                    {{ Math.round(hour.temp) }}°
                  </div>
                </div>
              </div>
            </v-sheet>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-else-if="loading"
          class="d-flex justify-center align-center flex-grow-1 h-50"
        >
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="d-flex flex-column align-center justify-center flex-grow-1 h-50 opacity-50"
        >
          <v-icon
            icon="mdi-map-search-outline"
            size="100"
            class="mb-4"
          ></v-icon>
          <div class="text-h6">搜索并选择城市以查看天气</div>
        </div>
      </v-fade-transition>

      <v-snackbar v-model="snackbar" color="error" location="top">
        {{ errorMsg }}
      </v-snackbar>

      <!-- Bottom Spacer -->
      <div class="pb-12 w-100"></div>
    </div>
  </ToolContainer>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import ToolContainer from "@/components/ToolContainer.vue";
import { fetchWeatherApi } from "openmeteo";

interface CityResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  isDay: boolean;
}

const searchQuery = ref("");
const searchResults = ref<CityResult[]>([]);
const selectedLocation = ref<CityResult | null>(null);
const searching = ref(false);
const loading = ref(false);
const currentWeather = ref<WeatherData | null>(null);
const hourlyForecast = ref<any[]>([]);
const dailyForecast = ref<any[]>([]);
const snackbar = ref(false);
const errorMsg = ref("");

const searchCity = async () => {
  if (!searchQuery.value) return;
  searching.value = true;
  searchResults.value = [];
  selectedLocation.value = null; // Reset selection to show list

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      searchQuery.value
    )}&count=5&language=zh&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.results) {
      searchResults.value = data.results;
    } else {
      errorMsg.value = "未找到相关城市";
      snackbar.value = true;
    }
  } catch (e) {
    console.error(e);
    errorMsg.value = "搜索失败，请检查网络";
    snackbar.value = true;
  } finally {
    searching.value = false;
  }
};

const selectCity = async (city: CityResult) => {
  selectedLocation.value = city;
  // Clear search results to hide list, but keep selection
  // Not clearing searchResults immediately allows back navigation if we implemented it,
  // but here we just toggle view. We can clear searchResults or just hide them with v-if logic.
  // The template uses v-if="searchResults.length > 0 && !selectedLocation", so setting selectedLocation hides the list.

  loading.value = true;
  await fetchWeather(city.latitude, city.longitude);
  loading.value = false;
};

const fetchWeather = async (lat: number, lon: number) => {
  try {
    const params = {
      latitude: lat,
      longitude: lon,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
      ],
      hourly: ["temperature_2m", "weather_code", "precipitation_probability"],
      daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"],
      timezone: "auto",
    };
    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);

    // Process first location
    const response = responses[0];
    if (!response) throw new Error("No response data");
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const current = response.current()!;
    const hourly = response.hourly()!;
    const daily = response.daily()!;

    currentWeather.value = {
      temperature: current.variables(0)!.value(),
      humidity: current.variables(1)!.value(),
      feelsLike: current.variables(2)!.value(),
      isDay: !!current.variables(3)!.value(),
      weatherCode: current.variables(5)!.value(),
      windSpeed: current.variables(6)!.value(),
    };

    // Process Hourly
    const hourlyTime = range(
      Number(hourly.time()),
      Number(hourly.timeEnd()),
      hourly.interval()
    ).map((t) => new Date((t + utcOffsetSeconds) * 1000));
    const hourlyTemp = hourly.variables(0)!.valuesArray()!;
    const hourlyCode = hourly.variables(1)!.valuesArray()!;
    const hourlyPrecipProb = hourly.variables(2)!.valuesArray()!; // Get precip prob

    hourlyForecast.value = hourlyTime.map((t, i) => ({
      time: t,
      temp: hourlyTemp[i],
      weatherCode: hourlyCode[i],
      precipitationProbability: hourlyPrecipProb[i],
    }));

    // Process Daily (for High/Low)
    const dailyMax = daily.variables(1)!.valuesArray()!;
    const dailyMin = daily.variables(2)!.valuesArray()!;
    dailyForecast.value = Array.from({ length: dailyMax.length }, (_, i) => ({
      maxTemp: dailyMax[i],
      minTemp: dailyMin[i],
    }));
  } catch (e) {
    console.error(e);
    errorMsg.value = "天气数据获取失败";
    snackbar.value = true;
  }
};

const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

const getWeatherIcon = (code: number) => {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return "mdi-weather-sunny";
  if (code >= 1 && code <= 3) return "mdi-weather-partly-cloudy";
  if (code >= 45 && code <= 48) return "mdi-weather-fog";
  if (code >= 51 && code <= 55) return "mdi-weather-pouring"; // Drizzle
  if (code >= 61 && code <= 65) return "mdi-weather-rainy"; // Rain
  if (code >= 71 && code <= 77) return "mdi-weather-snowy"; // Snow
  if (code >= 80 && code <= 82) return "mdi-weather-partly-rainy"; // Showers
  if (code >= 95 && code <= 99) return "mdi-weather-lightning"; // Thunderstorm
  return "mdi-weather-cloudy";
};

const getWeatherDescription = (code: number) => {
  if (code === 0) return "晴朗";
  if (code >= 1 && code <= 3) return "多云";
  if (code >= 45 && code <= 48) return "雾";
  if (code >= 51 && code <= 55) return "毛毛雨";
  if (code >= 61 && code <= 65) return "降雨";
  if (code >= 71 && code <= 77) return "降雪";
  if (code >= 80 && code <= 82) return "阵雨";
  if (code >= 95 && code <= 99) return "雷雨";
  return "未知";
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("zh-CN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatHour = (date: Date) => {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #64b5f6 100%);
}
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: rgb(var(--v-theme-background));
  padding-top: 4px; /* Tiny adjustment to prevent visual overlap with top padding */
}
.weather-icon-shadow {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}
.opacity-80 {
  opacity: 0.8;
}
.scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.gap-4 {
  gap: 16px;
}
</style>
