<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UnitToggler from '../components/Exercise3Childs/UnitToggler.vue'
import { findGlobalWeatherById } from '../data/weather.js'
import { fetchCurrentWeather, getWeatherErrorMessage } from '../services/weatherApi.js'
import { useConfigStore } from '../stores/configStore.js'

const props = defineProps({
  cityId: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)
const city = ref(findGlobalWeatherById(props.cityId) ?? null)
const isLoading = ref(false)
const apiError = ref('')

function convertTemperature(celsius) {
  if (celsius == null) return '-'
  if (unit.value === 'celsius') return celsius
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10
}

const temperatures = computed(() => ({
  current: convertTemperature(city.value?.temp),
  feelsLike: convertTemperature(city.value?.feelsLike),
  min: convertTemperature(city.value?.tempMin),
  max: convertTemperature(city.value?.tempMax),
}))

const visibility = computed(() => {
  if (city.value?.visibility == null) return '-'
  return Math.round((city.value.visibility / 1000) * 10) / 10
})

const windDirection = computed(() => {
  if (city.value?.windDirection == null) return '-'

  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  const index = Math.round(city.value.windDirection / 45) % directions.length
  return `${directions[index]}풍 (${city.value.windDirection}°)`
})

function formatLocalTime(timestamp, includeDate = false) {
  if (!timestamp || city.value?.timezoneOffset == null) return '-'

  const localTimestamp = timestamp + city.value.timezoneOffset * 1000
  return new Intl.DateTimeFormat('ko-KR', {
    ...(includeDate ? { dateStyle: 'medium' } : {}),
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(localTimestamp)
}

async function loadWeather() {
  const selectedCity = findGlobalWeatherById(props.cityId)
  if (!selectedCity) return

  isLoading.value = true
  apiError.value = ''

  try {
    city.value = await fetchCurrentWeather(selectedCity)
  } catch (error) {
    apiError.value = getWeatherErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadWeather)
</script>

<template>
  <main class="final-detail">
    <header class="detail-header">
      <div>
        <span>OpenWeather 실시간 관측</span>
        <h1>📊 최종과제: 상세 날씨</h1>
      </div>
      <UnitToggler />
    </header>

    <p v-if="isLoading" class="notice">⏳ 최신 관측 정보를 불러오는 중입니다.</p>
    <p v-else-if="apiError" class="notice error">
      ⚠️ {{ apiError }}
      <button type="button" @click="loadWeather">다시 시도</button>
    </p>

    <template v-if="city">
      <section class="weather-hero">
        <div>
          <p class="country">{{ city.flag }} {{ city.country }} · {{ city.countryCode }}</p>
          <h2>{{ city.name }}</h2>
          <p class="location">📍 {{ city.location }}</p>
          <strong>{{ temperatures.current }}{{ unitSymbol }}</strong>
          <p class="condition">{{ city.status }}</p>
        </div>

        <img
          v-if="city.icon"
          :src="`https://openweathermap.org/img/wn/${city.icon}@2x.png`"
          :alt="city.status"
        />
      </section>

      <section class="metrics" aria-label="온도 정보">
        <article>
          <span>체감온도</span>
          <strong>{{ temperatures.feelsLike }}{{ unitSymbol }}</strong>
        </article>
        <article>
          <span>현재 최저</span>
          <strong>{{ temperatures.min }}{{ unitSymbol }}</strong>
        </article>
        <article>
          <span>현재 최고</span>
          <strong>{{ temperatures.max }}{{ unitSymbol }}</strong>
        </article>
      </section>

      <section class="detail-grid" aria-label="상세 관측 정보">
        <article>
          <span>💧 습도</span>
          <strong>{{ city.humidity }}%</strong>
        </article>
        <article>
          <span>🔵 기압</span>
          <strong>{{ city.pressure ?? '-' }} hPa</strong>
        </article>
        <article>
          <span>👁️ 가시거리</span>
          <strong>{{ visibility }} km</strong>
        </article>
        <article>
          <span>☁️ 운량</span>
          <strong>{{ city.cloudiness ?? '-' }}%</strong>
        </article>
        <article>
          <span>💨 풍속</span>
          <strong>{{ city.windSpeed }} m/s</strong>
        </article>
        <article>
          <span>🧭 풍향</span>
          <strong>{{ windDirection }}</strong>
        </article>
        <article>
          <span>🌬️ 돌풍</span>
          <strong>{{ city.windGust == null ? '-' : `${city.windGust} m/s` }}</strong>
        </article>
        <article>
          <span>🌐 좌표</span>
          <strong>{{ city.lat.toFixed(4) }}, {{ city.lon.toFixed(4) }}</strong>
        </article>
      </section>

      <section class="sun-times">
        <div>
          <span>🌅 현지 일출</span>
          <strong>{{ formatLocalTime(city.sunrise) }}</strong>
        </div>
        <div>
          <span>🌇 현지 일몰</span>
          <strong>{{ formatLocalTime(city.sunset) }}</strong>
        </div>
      </section>

      <p class="observed-at">
        현지 관측 시각: {{ formatLocalTime(city.observedAt, true) }}
      </p>
    </template>

    <section v-else class="error-card">요청한 도시 코드를 찾을 수 없습니다.</section>

    <button class="back-button" type="button" @click="router.push('/')">
      ← 세계 날씨 대시보드로 돌아가기
    </button>
  </main>
</template>

<style scoped>
.final-detail {
  padding: 20px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 22px rgb(24 59 91 / 10%);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #dce5eb;
}

.detail-header span {
  color: #078fce;
  font-size: 11px;
  font-weight: 700;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  color: #183b5b;
  font-size: 22px;
  font-weight: 800;
}

.notice {
  margin-bottom: 12px;
  padding: 8px 11px;
  border-radius: 6px;
  background: #edf7fc;
  color: #26749b;
  font-size: 12px;
}

.notice.error,
.error-card {
  background: #fff0f0;
  color: #ae4141;
}

.notice button {
  margin-left: 7px;
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.weather-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e8f6fd, #f5fbfe);
}

.country,
.location,
.condition {
  color: #577181;
  font-size: 12px;
}

.weather-hero h2 {
  margin: 2px 0;
  color: #193e59;
  font-size: 24px;
  font-weight: 800;
}

.weather-hero > div > strong {
  display: block;
  margin-top: 10px;
  color: #087fb4;
  font-size: 35px;
  line-height: 1;
}

.weather-hero img {
  width: 96px;
  height: 96px;
}

.metrics,
.detail-grid {
  display: grid;
  gap: 9px;
  margin-bottom: 12px;
}

.metrics {
  grid-template-columns: repeat(3, 1fr);
}

.detail-grid {
  grid-template-columns: repeat(2, 1fr);
}

.metrics article,
.detail-grid article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border: 1px solid #e2e9ee;
  border-radius: 7px;
  background: #f8fafb;
}

.metrics span,
.detail-grid span,
.sun-times span {
  color: #6c7e8a;
  font-size: 11px;
}

.metrics strong,
.detail-grid strong,
.sun-times strong {
  color: #284966;
  font-size: 12px;
  font-weight: 750;
}

.sun-times {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.sun-times div {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 7px;
  background: #fff5df;
}

.observed-at {
  margin-bottom: 15px;
  color: #81909a;
  font-size: 11px;
  text-align: right;
}

.error-card {
  margin-bottom: 15px;
  padding: 18px;
  border-radius: 8px;
}

.back-button {
  padding: 9px 13px;
  border: 0;
  border-radius: 5px;
  background: #25475f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 560px) {
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: 20px;
  }

  .metrics,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .sun-times {
    flex-direction: column;
  }
}
</style>
