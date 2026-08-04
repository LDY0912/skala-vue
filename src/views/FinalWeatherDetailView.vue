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
  padding: 24px;
  border: 1px solid rgb(224 229 239 / 90%);
  border-radius: 20px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 14px 38px rgb(24 37 63 / 9%);
  backdrop-filter: blur(10px);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e6ef;
}

.detail-header span {
  color: #5b5ce2;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.06em;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  color: #27364d;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.notice {
  margin-bottom: 12px;
  padding: 8px 11px;
  border: 1px solid #d9e6f5;
  border-radius: 10px;
  background: #f1f6fd;
  color: #446786;
  font-size: 11px;
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
  position: relative;
  overflow: hidden;
  margin-bottom: 14px;
  padding: 24px;
  border: 1px solid #e0e5f3;
  border-radius: 17px;
  background:
    radial-gradient(circle at 90% 10%, rgb(67 191 224 / 17%), transparent 35%),
    linear-gradient(135deg, #eef0ff, #effaff);
}

.country,
.location,
.condition {
  color: #577181;
  font-size: 12px;
}

.weather-hero h2 {
  margin: 2px 0;
  color: #28364f;
  font-size: 26px;
  font-weight: 900;
}

.weather-hero > div > strong {
  display: block;
  margin-top: 10px;
  color: #5657d5;
  font-size: 38px;
  font-weight: 900;
  line-height: 1;
}

.weather-hero img {
  width: 96px;
  height: 96px;
}

.metrics,
.detail-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
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
  padding: 13px 14px;
  border: 1px solid #e4e8f0;
  border-radius: 11px;
  background: #f9fafd;
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
  color: #34435a;
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
  border: 1px solid #f1e3bd;
  border-radius: 11px;
  background: #fff9e9;
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
  padding: 10px 14px;
  border: 1px solid #3c4b61;
  border-radius: 9px;
  background: #34435a;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
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
