<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import FiveDayForecast from '../components/weather/FiveDayForecast.vue'
import UnitToggler from '../components/weather/UnitToggler.vue'
import WeatherTransitionOverlay from '../components/weather/WeatherTransitionOverlay.vue'
import { findGlobalWeatherById } from '../data/weatherLocations.js'
import {
  fetchCurrentWeather,
  fetchWeatherForecast,
  getWeatherErrorMessage,
} from '../services/weatherApi.js'
import { useWeatherUnitStore } from '../stores/weatherUnitStore.js'

const props = defineProps({
  cityId: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const weatherUnitStore = useWeatherUnitStore()
const { unit, unitSymbol } = storeToRefs(weatherUnitStore)
const city = ref(findGlobalWeatherById(props.cityId) ?? null)
const isLoading = ref(false)
const apiError = ref('')
const forecastItems = ref([])
const forecastTimezoneOffset = ref(0)
const isForecastLoading = ref(false)
const forecastError = ref('')
const isIntroEffectVisible = ref(false)
let introEffectTimer

const weatherScene = computed(() => {
  const code = city.value?.weatherCode
  const icon = city.value?.icon ?? ''
  const status = city.value?.status ?? ''
  const isNight = icon.endsWith('n')

  if ((code >= 200 && code < 300) || /천둥|뇌우/.test(status)) {
    return { type: 'thunder', isNight, label: '천둥번개' }
  }
  if ((code >= 300 && code < 600) || /비|이슬비|소나기/.test(status)) {
    return { type: 'rain', isNight, label: '비' }
  }
  if ((code >= 600 && code < 700) || /눈/.test(status)) {
    return { type: 'snow', isNight, label: '눈' }
  }
  if ((code >= 700 && code < 800) || /안개|박무|연무|황사/.test(status)) {
    return { type: 'mist', isNight, label: '안개' }
  }
  if (code === 800 || icon.startsWith('01') || /맑음/.test(status)) {
    return { type: 'clear', isNight, label: isNight ? '맑은 밤' : '화창함' }
  }

  return { type: 'clouds', isNight, label: '구름' }
})

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

function showIntroEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  window.clearTimeout(introEffectTimer)
  isIntroEffectVisible.value = true
  introEffectTimer = window.setTimeout(() => {
    isIntroEffectVisible.value = false
  }, 1400)
}

async function loadWeather() {
  const selectedCity = findGlobalWeatherById(props.cityId)
  if (!selectedCity) return

  isLoading.value = true
  isForecastLoading.value = true
  apiError.value = ''
  forecastError.value = ''

  // 현재 날씨와 5일 예보를 병렬 호출하고 각각의 오류 상태를 독립적으로 처리한다.
  const [currentResult, forecastResult] = await Promise.allSettled([
    fetchCurrentWeather(selectedCity),
    fetchWeatherForecast(selectedCity),
  ])

  if (currentResult.status === 'fulfilled') {
    city.value = currentResult.value
    showIntroEffect()
  } else {
    apiError.value = getWeatherErrorMessage(currentResult.reason)
  }

  if (forecastResult.status === 'fulfilled') {
    forecastItems.value = forecastResult.value.items
    forecastTimezoneOffset.value = forecastResult.value.timezoneOffset
  } else {
    forecastError.value = getWeatherErrorMessage(forecastResult.reason)
  }

  isLoading.value = false
  isForecastLoading.value = false
}

onMounted(loadWeather)
onBeforeUnmount(() => window.clearTimeout(introEffectTimer))
</script>

<template>
  <main
    class="final-detail"
    :class="[`weather-${weatherScene.type}`, { 'is-night': weatherScene.isNight }]"
  >
    <div class="weather-atmosphere" aria-hidden="true">
      <div class="sun-or-moon"><span></span></div>
      <div class="sun-sparkles">
        <i v-for="sparkle in 14" :key="`sparkle-${sparkle}`" :style="{ '--i': sparkle }">✦</i>
      </div>
      <div class="effect-cloud cloud-one"></div>
      <div class="effect-cloud cloud-two"></div>
      <div class="effect-cloud cloud-three"></div>
      <div class="rain-field">
        <i v-for="drop in 52" :key="`rain-${drop}`" :style="{ '--i': drop }"></i>
      </div>
      <div class="snow-field">
        <i v-for="flake in 42" :key="`snow-${flake}`" :style="{ '--i': flake }">✦</i>
      </div>
      <div class="mist-field">
        <i v-for="line in 5" :key="`mist-${line}`" :style="{ '--i': line }"></i>
      </div>
      <div class="lightning-bolt"></div>
    </div>

    <WeatherTransitionOverlay
      class="detail-intro-effect"
      :active="isIntroEffectVisible"
      :city-name="city?.name"
      :weather-code="city?.weatherCode"
      :status="city?.status"
    />

    <header class="detail-header">
      <div>
        <span>OpenWeather 실시간 관측</span>
        <h1>최종과제: 상세 날씨</h1>
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
          <span class="scene-label">{{ weatherScene.label }} · LIVE</span>
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
          <span>습도</span>
          <strong>{{ city.humidity }}%</strong>
        </article>
        <article>
          <span>기압</span>
          <strong>{{ city.pressure ?? '-' }} hPa</strong>
        </article>
        <article>
          <span>가시거리</span>
          <strong>{{ visibility }} km</strong>
        </article>
        <article>
          <span>운량</span>
          <strong>{{ city.cloudiness ?? '-' }}%</strong>
        </article>
        <article>
          <span>풍속</span>
          <strong>{{ city.windSpeed }} m/s</strong>
        </article>
        <article>
          <span>풍향</span>
          <strong>{{ windDirection }}</strong>
        </article>
        <article>
          <span>돌풍</span>
          <strong>{{ city.windGust == null ? '-' : `${city.windGust} m/s` }}</strong>
        </article>
        <article>
          <span>좌표</span>
          <strong>{{ city.lat.toFixed(4) }}, {{ city.lon.toFixed(4) }}</strong>
        </article>
      </section>

      <section class="sun-times">
        <div>
          <span>현지 일출</span>
          <strong>{{ formatLocalTime(city.sunrise) }}</strong>
        </div>
        <div>
          <span>현지 일몰</span>
          <strong>{{ formatLocalTime(city.sunset) }}</strong>
        </div>
      </section>

      <p class="observed-at">현지 관측 시각: {{ formatLocalTime(city.observedAt, true) }}</p>

      <p v-if="isForecastLoading" class="notice">5일 예보를 불러오는 중입니다.</p>
      <p v-else-if="forecastError" class="notice error">
        5일 예보를 불러오지 못했습니다. {{ forecastError }}
        <button type="button" @click="loadWeather">다시 시도</button>
      </p>
      <FiveDayForecast
        v-else-if="forecastItems.length"
        :forecasts="forecastItems"
        :timezone-offset="forecastTimezoneOffset"
      />
    </template>

    <section v-else class="error-card">요청한 도시 코드를 찾을 수 없습니다.</section>

    <div class="detail-actions">
      <button class="back-button" type="button" @click="router.push('/')">
        ← 세계 날씨 대시보드로 돌아가기
      </button>
      <button
        class="compare-button"
        type="button"
        @click="router.push({ path: '/compare', query: { left: props.cityId } })"
      >
        이 도시와 다른 지역 비교하기 →
      </button>
    </div>
  </main>
</template>

<style scoped>
.final-detail {
  position: relative;
  overflow: hidden;
  min-height: 680px;
  padding: 24px;
  border: 1px solid rgb(224 229 239 / 90%);
  border-radius: 20px;
  background: linear-gradient(145deg, #dbeafe, #f8fafc);
  box-shadow: 0 14px 38px rgb(24 37 63 / 9%);
  backdrop-filter: blur(10px);
  transition: background 0.5s ease;
}

.final-detail > :not(.weather-atmosphere) {
  position: relative;
  z-index: 2;
}

.final-detail > .detail-intro-effect {
  position: absolute;
  z-index: 20;
  inset: 0;
}

.weather-atmosphere {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.weather-clear {
  background:
    radial-gradient(circle at 82% 9%, rgb(255 240 111 / 95%), transparent 23%),
    radial-gradient(circle at 20% 20%, rgb(255 255 255 / 82%), transparent 28%),
    linear-gradient(145deg, #fff0a2 0%, #8ed9ff 48%, #eefaff 100%);
}

.weather-clear.is-night {
  background:
    radial-gradient(circle at 82% 8%, rgb(196 211 255 / 22%), transparent 25%),
    linear-gradient(145deg, #111b39 0%, #263b69 52%, #465b85 100%);
}

.weather-clouds {
  background: linear-gradient(145deg, #cbd5e1 0%, #e5ebf1 48%, #f8fafc 100%);
}

.weather-rain {
  background:
    radial-gradient(circle at 75% 8%, rgb(89 158 219 / 28%), transparent 27%),
    linear-gradient(145deg, #101d30 0%, #304e6c 52%, #567b96 100%);
}

.weather-thunder {
  background:
    radial-gradient(circle at 78% 12%, rgb(141 131 255 / 20%), transparent 28%),
    linear-gradient(145deg, #101727 0%, #252a4f 50%, #423f70 100%);
}

.weather-snow {
  background:
    radial-gradient(circle at 18% 4%, rgb(255 255 255 / 100%), transparent 25%),
    radial-gradient(circle at 83% 22%, rgb(183 228 255 / 62%), transparent 30%),
    linear-gradient(145deg, #a9d8f3 0%, #e4f5ff 49%, #fff 100%);
}

.weather-mist {
  background: linear-gradient(145deg, #cfd8dc 0%, #e7ecee 50%, #f7f8f8 100%);
}

.sun-or-moon,
.sun-sparkles,
.effect-cloud,
.rain-field,
.snow-field,
.mist-field,
.lightning-bolt {
  display: none;
}

.weather-clear .sun-or-moon {
  position: absolute;
  top: 60px;
  right: 30px;
  display: block;
  width: 132px;
  height: 132px;
  border: 2px solid rgb(255 248 176 / 78%);
  border-radius: 50%;
  background: radial-gradient(circle at 38% 35%, #fff8a8, #ffce31 58%, #ffac16);
  box-shadow:
    0 0 24px rgb(255 241 126 / 100%),
    0 0 70px rgb(255 207 56 / 90%),
    0 0 150px rgb(255 199 48 / 68%);
  animation: sun-breathe 3.2s ease-in-out infinite;
}

.weather-clear .sun-or-moon span {
  position: absolute;
  inset: -56px;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgb(255 215 79 / 78%) 0deg 8deg,
    transparent 8deg 17deg
  );
  mask: radial-gradient(circle, transparent 0 49%, black 51% 100%);
  animation: ray-spin 16s linear infinite;
}

.weather-clear:not(.is-night) .sun-sparkles {
  position: absolute;
  display: block;
  inset: 0;
}

.sun-sparkles i {
  position: absolute;
  top: calc(30px + (var(--i) * 47px));
  left: calc((var(--i) - 1) * 7.4%);
  color: rgb(255 255 222 / 92%);
  font-size: calc(8px + (var(--i) * 0.38px));
  font-style: normal;
  text-shadow:
    0 0 8px #fff,
    0 0 18px rgb(255 221 87 / 90%);
  animation: sparkle-pulse 2.4s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.23s);
}

.weather-clear:not(.is-night) .weather-atmosphere::after {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 67% 20%, rgb(255 255 255 / 58%) 0 7px, transparent 9px),
    radial-gradient(circle at 58% 29%, rgb(255 232 122 / 35%) 0 18px, transparent 22px),
    linear-gradient(118deg, transparent 43%, rgb(255 255 255 / 18%) 50%, transparent 58%);
  content: '';
  animation: sunlight-wash 5s ease-in-out infinite alternate;
}

.weather-clear.is-night .sun-or-moon {
  top: 76px;
  right: 42px;
  width: 88px;
  height: 88px;
  background: #f2f2da;
  box-shadow:
    inset -20px -10px 0 #aab6d5,
    0 0 28px rgb(222 229 255 / 55%),
    0 0 70px rgb(192 205 255 / 34%);
}

.weather-clear.is-night .sun-or-moon span {
  display: none;
}

.weather-clouds .effect-cloud,
.weather-rain .effect-cloud,
.weather-thunder .effect-cloud {
  position: absolute;
  display: block;
  width: 150px;
  height: 42px;
  border-radius: 999px;
  background: rgb(255 255 255 / 72%);
  filter: drop-shadow(0 10px 16px rgb(50 65 82 / 12%));
  animation: cloud-drift 11s ease-in-out infinite alternate;
}

.effect-cloud::before,
.effect-cloud::after {
  position: absolute;
  bottom: 8px;
  border-radius: 50%;
  background: inherit;
  content: '';
}

.effect-cloud::before {
  left: 25px;
  width: 62px;
  height: 62px;
}

.effect-cloud::after {
  right: 23px;
  width: 78px;
  height: 78px;
}

.cloud-one {
  top: 95px;
  right: -20px;
}

.cloud-two {
  top: 215px;
  left: -62px;
  scale: 0.72;
  opacity: 0.68;
  animation-delay: -4s !important;
}

.cloud-three {
  top: 430px;
  right: 12%;
  scale: 0.5;
  opacity: 0.4;
  animation-delay: -7s !important;
}

.weather-rain .effect-cloud,
.weather-thunder .effect-cloud {
  background: rgb(145 167 190 / 76%);
  filter: drop-shadow(0 15px 22px rgb(6 15 29 / 36%));
}

.weather-rain .rain-field,
.weather-thunder .rain-field {
  position: absolute;
  display: block;
  inset: 0;
}

.weather-rain .weather-atmosphere::before,
.weather-thunder .weather-atmosphere::before {
  position: absolute;
  inset: -80px;
  background: repeating-linear-gradient(
    102deg,
    transparent 0 30px,
    rgb(177 222 255 / 12%) 31px 33px,
    transparent 34px 52px
  );
  filter: blur(1px);
  content: '';
  animation: rain-sheet 1.15s linear infinite;
}

.weather-rain .weather-atmosphere::after,
.weather-thunder .weather-atmosphere::after {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 18% 92%, rgb(169 220 255 / 24%), transparent 20%),
    radial-gradient(ellipse at 72% 96%, rgb(169 220 255 / 22%), transparent 23%);
  content: '';
  animation: puddle-glow 2.2s ease-in-out infinite alternate;
}

.rain-field i {
  position: absolute;
  top: -60px;
  left: calc((var(--i) - 1) * 1.96%);
  width: 2.5px;
  height: 42px;
  border-radius: 999px;
  background: linear-gradient(transparent, rgb(198 232 255 / 96%));
  box-shadow: 0 0 7px rgb(126 197 255 / 38%);
  opacity: 0.82;
  transform: rotate(12deg);
  animation: rain-fall 0.78s linear infinite;
  animation-delay: calc(var(--i) * -0.057s);
}

.rain-field i:nth-child(3n) {
  height: 58px;
  opacity: 0.58;
}

.rain-field i:nth-child(4n) {
  animation-duration: 0.64s;
}

.weather-snow .snow-field {
  position: absolute;
  display: block;
  inset: 0;
}

.weather-snow .weather-atmosphere::after {
  position: absolute;
  right: -10%;
  bottom: -55px;
  left: -10%;
  height: 190px;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(to bottom, rgb(255 255 255 / 25%), rgb(255 255 255 / 93%));
  box-shadow: 0 -28px 60px rgb(229 249 255 / 72%);
  content: '';
  animation: frost-glow 3.2s ease-in-out infinite alternate;
}

.snow-field i {
  position: absolute;
  top: -30px;
  left: calc((var(--i) - 1) * 2.44%);
  color: rgb(255 255 255 / 100%);
  font-size: calc(7px + (var(--i) * 0.14px));
  font-style: normal;
  text-shadow:
    0 0 7px #fff,
    0 3px 9px rgb(49 103 143 / 38%);
  animation: snow-fall 5.8s linear infinite;
  animation-delay: calc(var(--i) * -0.19s);
}

.snow-field i:nth-child(3n) {
  font-size: 17px;
  animation-duration: 7.4s;
}

.snow-field i:nth-child(5n) {
  filter: blur(1px);
  opacity: 0.7;
}

.weather-mist .mist-field {
  position: absolute;
  display: block;
  inset: 0;
}

.mist-field i {
  position: absolute;
  top: calc(90px + (var(--i) * 105px));
  left: -20%;
  width: 72%;
  height: 34px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 58%), transparent);
  filter: blur(8px);
  opacity: calc(0.35 + (var(--i) * 0.06));
  animation: mist-move 8s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * -1.1s);
}

.weather-thunder .lightning-bolt {
  position: absolute;
  top: 105px;
  right: 72px;
  display: block;
  width: 48px;
  height: 112px;
  background: #fff6a6;
  clip-path: polygon(55% 0, 100% 0, 64% 40%, 92% 40%, 18% 100%, 40% 55%, 8% 55%);
  filter: drop-shadow(0 0 14px #dcd7ff) drop-shadow(0 0 25px #8b80ff);
  opacity: 0;
  animation: lightning-flash 5.5s linear infinite;
}

.scene-label {
  display: inline-flex;
  margin-bottom: 8px;
  padding: 4px 8px;
  border: 1px solid rgb(81 92 124 / 14%);
  border-radius: 999px;
  color: #4c5c75;
  background: rgb(255 255 255 / 48%);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.weather-rain .detail-header,
.weather-thunder .detail-header,
.weather-clear.is-night .detail-header {
  border-bottom-color: rgb(255 255 255 / 22%);
}

.weather-rain .detail-header h1,
.weather-thunder .detail-header h1,
.weather-clear.is-night .detail-header h1 {
  color: #f8fafc;
}

.weather-rain .detail-header span,
.weather-thunder .detail-header span,
.weather-clear.is-night .detail-header span {
  color: #c8d7ff;
}

.detail-header :deep(.unit-toggler) {
  padding: 8px 10px;
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 11px;
  background: rgb(255 255 255 / 86%);
  box-shadow: 0 7px 20px rgb(29 39 66 / 12%);
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
  border: 1px solid rgb(255 255 255 / 48%);
  border-radius: 17px;
  background:
    radial-gradient(circle at 90% 10%, rgb(255 255 255 / 38%), transparent 35%),
    linear-gradient(135deg, rgb(255 255 255 / 78%), rgb(255 255 255 / 56%));
  box-shadow: 0 10px 28px rgb(33 48 73 / 9%);
  backdrop-filter: blur(12px);
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
  position: relative;
  z-index: 1;
  width: 96px;
  height: 96px;
  filter: drop-shadow(0 8px 12px rgb(45 67 92 / 14%));
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
  background: rgb(255 255 255 / 82%);
  box-shadow: 0 4px 14px rgb(33 48 73 / 5%);
  backdrop-filter: blur(10px);
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
  background: rgb(255 249 233 / 86%);
  backdrop-filter: blur(10px);
}

.observed-at {
  margin-bottom: 15px;
  color: #81909a;
  font-size: 11px;
  text-align: right;
}

.weather-rain .observed-at,
.weather-thunder .observed-at,
.weather-clear.is-night .observed-at {
  color: rgb(241 245 249 / 78%);
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

.detail-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.compare-button {
  padding: 10px 14px;
  border: 1px solid #6667dc;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(135deg, #7071e4, #5152c8);
  box-shadow: 0 7px 17px rgb(74 76 190 / 20%);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.compare-button:hover {
  transform: translateY(-1px);
}

.back-button:hover {
  background: #252f42;
  transform: translateY(-1px);
}

.weather-rain .back-button,
.weather-thunder .back-button,
.weather-clear.is-night .back-button {
  border-color: rgb(255 255 255 / 28%);
  background: rgb(15 23 42 / 52%);
  backdrop-filter: blur(10px);
}

.weather-rain .compare-button,
.weather-thunder .compare-button,
.weather-clear.is-night .compare-button {
  border-color: rgb(255 255 255 / 40%);
}

@keyframes sun-breathe {
  0%,
  100% {
    scale: 1;
  }

  50% {
    scale: 1.07;
  }
}

@keyframes ray-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes sparkle-pulse {
  0%,
  100% {
    opacity: 0.2;
    scale: 0.55;
  }

  50% {
    opacity: 1;
    scale: 1.35;
  }
}

@keyframes sunlight-wash {
  from {
    opacity: 0.45;
    translate: -2% 0;
  }

  to {
    opacity: 0.9;
    translate: 3% 1%;
  }
}

@keyframes cloud-drift {
  from {
    translate: -18px 0;
  }

  to {
    translate: 22px -7px;
  }
}

@keyframes rain-fall {
  from {
    translate: -25px -80px;
  }

  to {
    translate: 80px 820px;
  }
}

@keyframes rain-sheet {
  from {
    translate: -30px -55px;
  }

  to {
    translate: 55px 95px;
  }
}

@keyframes puddle-glow {
  from {
    opacity: 0.35;
  }

  to {
    opacity: 0.9;
  }
}

@keyframes snow-fall {
  0% {
    translate: -10px -40px;
    rotate: 0deg;
  }

  50% {
    translate: 25px 350px;
  }

  100% {
    translate: -18px 760px;
    rotate: 300deg;
  }
}

@keyframes frost-glow {
  from {
    opacity: 0.68;
    translate: 0 9px;
  }

  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes mist-move {
  from {
    translate: -5% 0;
    scale: 0.9 1;
  }

  to {
    translate: 65% 8px;
    scale: 1.2 1;
  }
}

@keyframes lightning-flash {
  0%,
  42%,
  47%,
  100% {
    opacity: 0;
  }

  43%,
  45% {
    opacity: 0.92;
  }

  44%,
  46% {
    opacity: 0.2;
  }
}

@media (max-width: 560px) {
  .final-detail {
    min-height: 620px;
    padding: 18px;
  }

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

  .weather-hero {
    padding: 20px;
  }

  .weather-clear .sun-or-moon {
    top: 138px;
    right: -18px;
    scale: 0.72;
    opacity: 0.9;
  }

  .cloud-one {
    right: -72px;
  }

  .cloud-three {
    display: none !important;
  }

  .weather-thunder .lightning-bolt {
    right: 25px;
    scale: 0.75;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sun-or-moon,
  .sun-or-moon span,
  .sun-sparkles,
  .effect-cloud {
    animation: none !important;
  }

  .rain-field,
  .snow-field,
  .mist-field,
  .lightning-bolt {
    display: none !important;
  }

  .weather-atmosphere::before,
  .weather-atmosphere::after {
    animation: none !important;
  }
}
</style>
