import axios from 'axios'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()

// Axios 인스턴스에 공통 API 주소와 타임아웃을 설정한다.
const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
})

const requestCache = new Map()
const forecastRequestCache = new Map()

function requireApiKey() {
  if (apiKey) return

  const error = new Error('OpenWeather API 키가 설정되지 않았습니다.')
  error.code = 'MISSING_API_KEY'
  throw error
}

function normalizeWeather(city, data) {
  return {
    ...city,
    temp: Math.round(data.main.temp * 10) / 10,
    feelsLike: Math.round(data.main.feels_like * 10) / 10,
    tempMin: Math.round(data.main.temp_min * 10) / 10,
    tempMax: Math.round(data.main.temp_max * 10) / 10,
    status: data.weather?.[0]?.description ?? city.status,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    visibility: data.visibility,
    cloudiness: data.clouds?.all ?? 0,
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    windGust: data.wind.gust ?? null,
    weatherCode: data.weather?.[0]?.id ?? null,
    icon: data.weather?.[0]?.icon ?? null,
    observedAt: data.dt * 1000,
    sunrise: data.sys.sunrise * 1000,
    sunset: data.sys.sunset * 1000,
    timezoneOffset: data.timezone,
  }
}

function normalizeForecastItem(data) {
  return {
    timestamp: data.dt * 1000,
    temp: Math.round(data.main.temp * 10) / 10,
    feelsLike: Math.round(data.main.feels_like * 10) / 10,
    tempMin: Math.round(data.main.temp_min * 10) / 10,
    tempMax: Math.round(data.main.temp_max * 10) / 10,
    humidity: data.main.humidity,
    status: data.weather?.[0]?.description ?? '날씨 정보 없음',
    weatherCode: data.weather?.[0]?.id ?? null,
    icon: data.weather?.[0]?.icon ?? null,
    precipitationProbability: Math.round((data.pop ?? 0) * 100),
    rainAmount: data.rain?.['3h'] ?? 0,
    snowAmount: data.snow?.['3h'] ?? 0,
    windSpeed: data.wind.speed,
  }
}

export function fetchCurrentWeather(city) {
  requireApiKey()

  if (requestCache.has(city.id)) return requestCache.get(city.id)

  // 좌표를 Query Parameter로 전달하고 응답을 화면용 날씨 객체로 변환한다.
  const request = weatherClient
    .get('/weather', {
      params: {
        lat: city.lat,
        lon: city.lon,
        units: 'metric',
        lang: 'kr',
        appid: apiKey,
      },
    })
    .then(({ data }) => normalizeWeather(city, data))
    .catch((error) => {
      requestCache.delete(city.id)
      throw error
    })

  requestCache.set(city.id, request)
  return request
}

export function fetchCurrentWeatherList(cities) {
  return Promise.all(cities.map((city) => fetchCurrentWeather(city)))
}

export function fetchWeatherForecast(city) {
  requireApiKey()

  if (forecastRequestCache.has(city.id)) return forecastRequestCache.get(city.id)

  // OpenWeather 5 day / 3 hour Forecast 응답을 시간대별 카드 데이터로 변환한다.
  const request = weatherClient
    .get('/forecast', {
      params: {
        lat: city.lat,
        lon: city.lon,
        units: 'metric',
        lang: 'kr',
        appid: apiKey,
      },
    })
    .then(({ data }) => ({
      cityId: city.id,
      timezoneOffset: data.city?.timezone ?? 0,
      items: (data.list ?? []).map(normalizeForecastItem),
    }))
    .catch((error) => {
      forecastRequestCache.delete(city.id)
      throw error
    })

  forecastRequestCache.set(city.id, request)
  return request
}

export function getWeatherErrorMessage(error) {
  // Axios 오류 유형을 사용자가 이해할 수 있는 메시지로 변환한다.
  if (error?.code === 'MISSING_API_KEY') {
    return 'API 키가 없습니다. .env.local 파일을 확인해 주세요.'
  }

  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return 'API 키 인증에 실패했습니다. OpenWeather API 키를 확인해 주세요.'
  }

  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return '날씨 서버의 응답 시간이 초과되었습니다.'
  }

  return '실시간 날씨를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
