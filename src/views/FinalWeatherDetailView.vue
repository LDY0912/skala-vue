<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UnitToggler from '../components/weather/UnitToggler.vue'
import { findGlobalWeatherById } from '../data/weatherLocations.js'
import { fetchCurrentWeather, getWeatherErrorMessage } from '../services/weatherApi.js'
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

async function loadWeather() {
  const selectedCity = findGlobalWeatherById(props.cityId)
  if (!selectedCity) return

  isLoading.value = true
  apiError.value = ''

  // API 호출의 로딩·성공·오류·종료 상태를 try/catch/finally로 구분한다.
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
  <main
    class="final-detail"
    :class="[`weather-${weatherScene.type}`, { 'is-night': weatherScene.isNight }]"
  >
    <div class="weather-atmosphere" aria-hidden="true">
      <div class="sun-or-moon"><span></span></div>
      <div class="effect-cloud cloud-one"></div>
      <div class="effect-cloud cloud-two"></div>
      <div class="effect-cloud cloud-three"></div>
      <div class="rain-field">
        <i v-for="drop in 24" :key="`rain-${drop}`" :style="{ '--i': drop }"></i>
      </div>
      <div class="snow-field">
        <i v-for="flake in 20" :key="`snow-${flake}`" :style="{ '--i': flake }">✦</i>
      </div>
      <div class="mist-field">
        <i v-for="line in 5" :key="`mist-${line}`" :style="{ '--i': line }"></i>
      </div>
      <div class="lightning-bolt"></div>
    </div>

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

      <p class="observed-at">현지 관측 시각: {{ formatLocalTime(city.observedAt, true) }}</p>
    </template>

    <section v-else class="error-card">요청한 도시 코드를 찾을 수 없습니다.</section>

    <button class="back-button" type="button" @click="router.push('/')">
      ← 세계 날씨 대시보드로 돌아가기
    </button>
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
    radial-gradient(circle at 82% 8%, rgb(255 240 129 / 70%), transparent 29%),
    linear-gradient(145deg, #fff4bd 0%, #ccecff 46%, #f8fbff 100%);
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
  background: linear-gradient(145deg, #26364c 0%, #53677e 54%, #8293a5 100%);
}

.weather-thunder {
  background:
    radial-gradient(circle at 78% 12%, rgb(141 131 255 / 20%), transparent 28%),
    linear-gradient(145deg, #101727 0%, #252a4f 50%, #423f70 100%);
}

.weather-snow {
  background:
    radial-gradient(circle at 20% 5%, rgb(255 255 255 / 75%), transparent 28%),
    linear-gradient(145deg, #d8e9f6 0%, #edf7ff 48%, #fff 100%);
}

.weather-mist {
  background: linear-gradient(145deg, #cfd8dc 0%, #e7ecee 50%, #f7f8f8 100%);
}

.sun-or-moon,
.effect-cloud,
.rain-field,
.snow-field,
.mist-field,
.lightning-bolt {
  display: none;
}

.weather-clear .sun-or-moon {
  position: absolute;
  top: 76px;
  right: 42px;
  display: block;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: #ffd84f;
  box-shadow:
    0 0 30px rgb(255 207 56 / 75%),
    0 0 85px rgb(255 210 76 / 62%);
  animation: sun-breathe 3.8s ease-in-out infinite;
}

.weather-clear .sun-or-moon span {
  position: absolute;
  inset: -34px;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgb(255 215 79 / 62%) 0deg 7deg,
    transparent 7deg 18deg
  );
  mask: radial-gradient(circle, transparent 0 49%, black 51% 100%);
  animation: ray-spin 22s linear infinite;
}

.weather-clear.is-night .sun-or-moon {
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
  background: rgb(191 202 215 / 50%);
  filter: drop-shadow(0 12px 18px rgb(15 23 42 / 20%));
}

.weather-rain .rain-field,
.weather-thunder .rain-field {
  position: absolute;
  display: block;
  inset: 0;
}

.rain-field i {
  position: absolute;
  top: -60px;
  left: calc((var(--i) - 1) * 4.25%);
  width: 2px;
  height: 30px;
  border-radius: 999px;
  background: linear-gradient(transparent, rgb(184 222 255 / 72%));
  opacity: calc(0.36 + (var(--i) * 0.018));
  transform: rotate(12deg);
  animation: rain-fall 1.05s linear infinite;
  animation-delay: calc(var(--i) * -0.11s);
}

.weather-snow .snow-field {
  position: absolute;
  display: block;
  inset: 0;
}

.snow-field i {
  position: absolute;
  top: -30px;
  left: calc((var(--i) - 1) * 5.1%);
  color: rgb(255 255 255 / 88%);
  font-size: calc(8px + (var(--i) * 0.35px));
  font-style: normal;
  text-shadow: 0 2px 7px rgb(75 110 140 / 22%);
  animation: snow-fall 7s linear infinite;
  animation-delay: calc(var(--i) * -0.31s);
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
    opacity: 0.72;
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
  .effect-cloud {
    animation: none !important;
  }

  .rain-field,
  .snow-field,
  .mist-field,
  .lightning-bolt {
    display: none !important;
  }
}
</style>
