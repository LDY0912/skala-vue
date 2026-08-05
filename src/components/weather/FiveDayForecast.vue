<script setup>
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useWeatherUnitStore } from '../../stores/weatherUnitStore.js'

const props = defineProps({
  forecasts: {
    type: Array,
    required: true,
  },
  timezoneOffset: {
    type: Number,
    default: 0,
  },
})

const weatherUnitStore = useWeatherUnitStore()
const { unit, unitSymbol } = storeToRefs(weatherUnitStore)
const selectedDateKey = ref('')

function localDate(timestamp) {
  return new Date(timestamp + props.timezoneOffset * 1000)
}

function dateKey(timestamp) {
  return localDate(timestamp).toISOString().slice(0, 10)
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(localDate(timestamp))
}

function formatHour(timestamp) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(localDate(timestamp))
}

function convertTemperature(celsius) {
  if (unit.value === 'celsius') return Math.round(celsius)
  return Math.round((celsius * 9) / 5 + 32)
}

// 3시간 간격 데이터를 현지 날짜 기준으로 묶고 처음 5일만 노출한다.
const forecastDays = computed(() => {
  const grouped = new Map()

  props.forecasts.forEach((forecast) => {
    const key = dateKey(forecast.timestamp)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(forecast)
  })

  return [...grouped.entries()].slice(0, 5).map(([key, items]) => ({
    key,
    label: formatDate(items[0].timestamp),
    items,
    minimum: Math.min(...items.map((item) => item.tempMin)),
    maximum: Math.max(...items.map((item) => item.tempMax)),
  }))
})

const selectedDay = computed(
  () => forecastDays.value.find((day) => day.key === selectedDateKey.value) ?? forecastDays.value[0],
)

watch(
  forecastDays,
  (days) => {
    if (!days.some((day) => day.key === selectedDateKey.value)) {
      selectedDateKey.value = days[0]?.key ?? ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="forecast-panel" aria-labelledby="forecast-title">
    <header>
      <div>
        <span>5-DAY FORECAST</span>
        <h2 id="forecast-title">5일 시간대별 예보</h2>
        <p>도시 현지 시각을 기준으로 앞으로의 날씨 흐름을 확인하세요.</p>
      </div>
      <strong>3시간 간격</strong>
    </header>

    <div class="day-tabs" role="tablist" aria-label="예보 날짜 선택">
      <button
        v-for="day in forecastDays"
        :key="day.key"
        type="button"
        role="tab"
        :aria-selected="selectedDay?.key === day.key"
        :class="{ active: selectedDay?.key === day.key }"
        @click="selectedDateKey = day.key"
      >
        <span>{{ day.label }}</span>
        <small>
          <b>{{ convertTemperature(day.maximum) }}°</b>
          {{ convertTemperature(day.minimum) }}°
        </small>
      </button>
    </div>

    <div v-if="selectedDay" class="hourly-track">
      <article v-for="item in selectedDay.items" :key="item.timestamp" class="hour-card">
        <time :datetime="new Date(item.timestamp).toISOString()">{{ formatHour(item.timestamp) }}</time>
        <img
          v-if="item.icon"
          :src="`https://openweathermap.org/img/wn/${item.icon}@2x.png`"
          :alt="item.status"
        />
        <strong>{{ convertTemperature(item.temp) }}{{ unitSymbol }}</strong>
        <span>{{ item.status }}</span>
        <div class="rain-probability" :title="`강수 확률 ${item.precipitationProbability}%`">
          <i :style="{ width: `${item.precipitationProbability}%` }"></i>
        </div>
        <small>💧 {{ item.precipitationProbability }}%</small>
      </article>
    </div>
  </section>
</template>

<style scoped>
.forecast-panel {
  margin: 16px 0;
  padding: 18px;
  border: 1px solid rgb(255 255 255 / 56%);
  border-radius: 17px;
  background: rgb(255 255 255 / 84%);
  box-shadow: 0 12px 30px rgb(33 48 73 / 9%);
  backdrop-filter: blur(15px);
}

.forecast-panel > header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.forecast-panel header span {
  color: #6667df;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.forecast-panel h2,
.forecast-panel p {
  margin: 0;
}

.forecast-panel h2 {
  margin-top: 2px;
  color: #27364d;
  font-size: 17px;
  letter-spacing: -0.03em;
}

.forecast-panel p {
  margin-top: 3px;
  color: #788797;
  font-size: 9px;
}

.forecast-panel > header > strong {
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 999px;
  color: #516174;
  background: #eef1f7;
  font-size: 8px;
}

.day-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
  margin-bottom: 13px;
}

.day-tabs button {
  display: grid;
  gap: 4px;
  padding: 9px 5px;
  border: 1px solid #e3e7ef;
  border-radius: 10px;
  color: #647487;
  background: #f8f9fc;
  font: inherit;
  cursor: pointer;
}

.day-tabs button:hover {
  border-color: #c7c9ef;
  transform: translateY(-1px);
}

.day-tabs button.active {
  border-color: #6465d8;
  color: #fff;
  background: linear-gradient(145deg, #7475e7, #5152c8);
  box-shadow: 0 8px 18px rgb(81 82 200 / 22%);
}

.day-tabs span {
  color: inherit;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0;
}

.day-tabs small {
  font-size: 9px;
}

.day-tabs b {
  margin-right: 3px;
  color: #f05e67;
}

.day-tabs button.active b {
  color: #fff0ad;
}

.hourly-track {
  display: grid;
  grid-auto-columns: minmax(92px, 1fr);
  grid-auto-flow: column;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 1px 8px;
  scrollbar-color: #b8bee1 transparent;
  scrollbar-width: thin;
}

.hour-card {
  display: grid;
  min-height: 166px;
  place-items: center;
  padding: 10px 8px;
  border: 1px solid #e5e8f0;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff, #fff);
  text-align: center;
}

.hour-card time {
  color: #65758a;
  font-size: 9px;
  font-weight: 850;
}

.hour-card img {
  width: 45px;
  height: 45px;
  margin: -3px 0;
  filter: drop-shadow(0 5px 7px rgb(40 61 88 / 12%));
}

.hour-card > strong {
  color: #303f57;
  font-size: 16px;
}

.hour-card > span {
  overflow: hidden;
  max-width: 82px;
  color: #718194;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hour-card > small {
  color: #3f86bc;
  font-size: 8px;
  font-weight: 750;
}

.rain-probability {
  overflow: hidden;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: #e6edf5;
}

.rain-probability i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #5eaee4, #6067dc);
}

@media (max-width: 560px) {
  .forecast-panel {
    padding: 14px;
  }

  .day-tabs {
    grid-template-columns: repeat(5, minmax(72px, 1fr));
    overflow-x: auto;
    padding-bottom: 5px;
  }

  .forecast-panel > header {
    flex-direction: column;
  }
}
</style>
