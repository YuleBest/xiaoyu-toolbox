import { fetchWeatherApi } from "openmeteo";

export interface CityResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  isDay: boolean;
}

export interface HourlyData {
  time: Date;
  temp: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface DailyData {
  maxTemp: number;
  minTemp: number;
}

/**
 * 搜索城市
 */
export async function searchCity(name: string): Promise<CityResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=zh&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

/**
 * 获取天气数据
 */
export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<{
  current: CurrentWeather;
  hourly: HourlyData[];
  daily: DailyData[];
}> {
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

  const responses = await fetchWeatherApi(
    "https://api.open-meteo.com/v1/forecast",
    params,
  );
  const response = responses[0];
  if (!response) throw new Error("No response data");

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const current = response.current()!;
  const hourly = response.hourly()!;
  const daily = response.daily()!;

  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process hourly
  const hourlyTime = range(
    Number(hourly.time()),
    Number(hourly.timeEnd()),
    hourly.interval(),
  ).map((t) => new Date((t + utcOffsetSeconds) * 1000));

  const hourlyTemp = hourly.variables(0)!.valuesArray()!;
  const hourlyCode = hourly.variables(1)!.valuesArray()!;
  const hourlyPrecipProb = hourly.variables(2)!.valuesArray()!;

  // Process daily
  const dailyMax = daily.variables(1)!.valuesArray()!;
  const dailyMin = daily.variables(2)!.valuesArray()!;

  return {
    current: {
      temperature: current.variables(0)!.value(),
      humidity: current.variables(1)!.value(),
      feelsLike: current.variables(2)!.value(),
      isDay: !!current.variables(3)!.value(),
      weatherCode: current.variables(5)!.value(),
      windSpeed: current.variables(6)!.value(),
    },
    hourly: hourlyTime.map((t, i) => ({
      time: t,
      temp: hourlyTemp[i] ?? 0,
      weatherCode: hourlyCode[i] ?? 0,
      precipitationProbability: hourlyPrecipProb[i] ?? 0,
    })),
    daily: Array.from({ length: dailyMax.length }, (_, i) => ({
      maxTemp: dailyMax[i] ?? 0,
      minTemp: dailyMin[i] ?? 0,
    })),
  };
}

/**
 * 天气图标映射 (WMO codes)
 */
export function getWeatherIcon(code: number): string {
  if (code === 0) return "sun";
  if (code >= 1 && code <= 3) return "cloud-sun";
  if (code >= 45 && code <= 48) return "cloud-fog";
  if (code >= 51 && code <= 55) return "cloud-drizzle";
  if (code >= 61 && code <= 65) return "cloud-rain";
  if (code >= 71 && code <= 77) return "snowflake";
  if (code >= 80 && code <= 82) return "cloud-rain-wind";
  if (code >= 95 && code <= 99) return "cloud-lightning";
  return "cloud";
}

/**
 * 天气描述映射
 */
export function getWeatherDescription(code: number): string {
  if (code === 0) return "晴朗";
  if (code >= 1 && code <= 3) return "多云";
  if (code >= 45 && code <= 48) return "雾";
  if (code >= 51 && code <= 55) return "毛毛雨";
  if (code >= 61 && code <= 65) return "降雨";
  if (code >= 71 && code <= 77) return "降雪";
  if (code >= 80 && code <= 82) return "阵雨";
  if (code >= 95 && code <= 99) return "雷雨";
  return "未知";
}
