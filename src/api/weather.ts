export interface CityResult {
  id: string
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  admin1?: string
}

export interface CurrentWeather {
  temperature: number
  weatherCode: string
  weatherText: string
  humidity: number
  windSpeed: number
  feelsLike: number
  isDay: boolean
}

export interface HourlyData {
  time: Date
  temp: number
  weatherCode: string
  precipitationProbability: number
}

export interface DailyData {
  maxTemp: number
  minTemp: number
}

/**
 * 搜索城市
 */
export async function searchCity(name: string): Promise<CityResult[]> {
  const url = `/api/weather/geo/v2/city/lookup?location=${encodeURIComponent(name)}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.code !== '200' || !data.location) {
    return []
  }

  return data.location.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    country: item.country,
    admin1: item.adm1,
  }))
}

/**
 * 获取天气数据
 */
export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<{
  current: CurrentWeather
  hourly: HourlyData[]
  daily: DailyData[]
}> {
  const location = `${lon.toFixed(2)},${lat.toFixed(2)}`

  const [nowRes, hourlyRes, dailyRes] = await Promise.all([
    fetch(`/api/weather/v7/weather/now?location=${location}`),
    fetch(`/api/weather/v7/weather/24h?location=${location}`),
    fetch(`/api/weather/v7/weather/3d?location=${location}`),
  ])

  const [nowData, hourlyData, dailyData] = await Promise.all([
    nowRes.json(),
    hourlyRes.json(),
    dailyRes.json(),
  ])

  if (nowData.code !== '200' || hourlyData.code !== '200' || dailyData.code !== '200') {
    throw new Error('Failed to fetch weather data')
  }

  const isNightIcon = (icon: string) => {
    const code = parseInt(icon)
    return code >= 150 && code <= 154
  }

  return {
    current: {
      temperature: parseFloat(nowData.now.temp),
      humidity: parseFloat(nowData.now.humidity),
      feelsLike: parseFloat(nowData.now.feelsLike),
      isDay: !isNightIcon(nowData.now.icon),
      weatherCode: nowData.now.icon,
      weatherText: nowData.now.text,
      windSpeed: parseFloat(nowData.now.windSpeed),
    },
    hourly: (hourlyData.hourly || []).map((item: any) => ({
      time: new Date(item.fxTime),
      temp: parseFloat(item.temp),
      weatherCode: item.icon,
      precipitationProbability: parseFloat(item.pop || '0'),
    })),
    daily: (dailyData.daily || []).map((item: any) => ({
      maxTemp: parseFloat(item.tempMax),
      minTemp: parseFloat(item.tempMin),
    })),
  }
}
