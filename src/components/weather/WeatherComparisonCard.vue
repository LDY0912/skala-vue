<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useWeatherUnitStore } from '../../stores/weatherUnitStore.js'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
  side: {
    type: String,
    required: true,
    validator: (value) => ['left', 'right'].includes(value),
  },
  winnerMap: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open-detail'])
const weatherUnitStore = useWeatherUnitStore()
const { unit, unitSymbol } = storeToRefs(weatherUnitStore)

function convertTemperature(celsius) {
  if (celsius == null) return '-'
  if (unit.value === 'celsius') return celsius
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10
}

function isHigher(key) {
  return props.winnerMap[key] === props.side
}

function isEqual(key) {
  return props.winnerMap[key] === 'equal'
}

const metrics = computed(() => [
  {
    key: 'feelsLike',
    icon: '',
    label: '체감온도',
    value: `${convertTemperature(props.city.feelsLike)}${unitSymbol.value}`,
  },
  { key: 'humidity', icon: '', label: '습도', value: `${props.city.humidity ?? '-'}%` },
  {
    key: 'windSpeed',
    icon: '',
    label: '풍속',
    value: `${props.city.windSpeed ?? '-'} m/s`,
  },
  {
    key: 'pressure',
    icon: '',
    label: '기압',
    value: `${props.city.pressure ?? '-'} hPa`,
  },
  {
    key: 'cloudiness',
    icon: '',
    label: '운량',
    value: `${props.city.cloudiness ?? '-'}%`,
  },
  {
    key: 'visibility',
    icon: '',
    label: '가시거리',
    value:
      props.city.visibility == null
        ? '-'
        : `${Math.round((props.city.visibility / 1000) * 10) / 10} km`,
  },
])
</script>

<template>
  <article class="comparison-card" :class="`side-${side}`">
    <header>
      <span>{{ side === 'left' ? 'LEFT CITY' : 'RIGHT CITY' }}</span>
      <button type="button" @click="emit('open-detail', city.id)">상세보기 ↗</button>
    </header>

    <section class="city-hero" :class="{ higher: isHigher('temp') }">
      <div>
        <p>{{ city.flag }} {{ city.country }}</p>
        <h2>{{ city.name }}</h2>
        <span>{{ city.status }}</span>
      </div>
      <div class="main-temperature">
        <small
          :class="{ equal: isEqual('temp'), placeholder: !isHigher('temp') && !isEqual('temp') }"
        >
          {{ isHigher('temp') ? '↑ 더 높음' : isEqual('temp') ? '동일' : '비교 기준' }}
        </small>
        <strong>{{ convertTemperature(city.temp) }}{{ unitSymbol }}</strong>
      </div>
      <img
        v-if="city.icon"
        :src="`https://openweathermap.org/img/wn/${city.icon}@2x.png`"
        :alt="city.status"
      />
    </section>

    <dl>
      <div
        v-for="metric in metrics"
        :key="metric.key"
        class="metric-row"
        :class="{ higher: isHigher(metric.key), equal: isEqual(metric.key) }"
      >
        <dt>
          <span>{{ metric.icon }}</span
          >{{ metric.label }}
        </dt>
        <dd>
          <small
            :class="{
              placeholder: !isHigher(metric.key) && !isEqual(metric.key),
            }"
          >
            {{ isHigher(metric.key) ? '↑ 더 높음' : isEqual(metric.key) ? '동일' : '비교 기준' }}
          </small>
          <strong>{{ metric.value }}</strong>
        </dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.comparison-card {
  min-width: 0;
  padding: 18px;
  border: 1px solid rgb(224 228 239 / 90%);
  border-radius: 21px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 18px 42px rgb(30 43 76 / 10%);
  backdrop-filter: blur(14px);
}

.comparison-card > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.comparison-card > header > span {
  color: #858fa2;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.comparison-card > header button {
  padding: 5px 8px;
  border: 1px solid #e1e4ed;
  border-radius: 8px;
  color: #5d6780;
  background: #fff;
  font-size: 8px;
  font-weight: 800;
  cursor: pointer;
}

.city-hero {
  position: relative;
  display: grid;
  min-height: 165px;
  overflow: hidden;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 10px;
  margin-bottom: 12px;
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 44%);
  border-radius: 16px;
  color: #fff;
  background:
    radial-gradient(circle at 90% 5%, rgb(255 255 255 / 30%), transparent 34%),
    linear-gradient(145deg, #4569bf, #24a8c1);
  box-shadow: 0 12px 28px rgb(50 85 158 / 20%);
}

.side-right .city-hero {
  background:
    radial-gradient(circle at 90% 5%, rgb(255 255 255 / 28%), transparent 34%),
    linear-gradient(145deg, #654ac3, #d05c9b);
  box-shadow: 0 12px 28px rgb(104 68 164 / 20%);
}

.city-hero.higher {
  border-color: #ffdc69;
  box-shadow:
    0 0 0 3px rgb(255 218 92 / 28%),
    0 16px 35px rgb(67 74 150 / 24%);
}

.city-hero p,
.city-hero h2,
.city-hero span {
  position: relative;
  z-index: 2;
  margin: 0;
}

.city-hero p {
  color: rgb(255 255 255 / 76%);
  font-size: 10px;
  font-weight: 700;
}

.city-hero h2 {
  margin: 2px 0;
  font-size: clamp(22px, 3vw, 30px);
  letter-spacing: -0.04em;
}

.city-hero span {
  font-size: 10px;
}

.city-hero img {
  position: absolute;
  z-index: 1;
  top: 7px;
  right: 8px;
  width: 82px;
  height: 82px;
  opacity: 0.86;
  filter: drop-shadow(0 8px 12px rgb(27 38 72 / 18%));
}

.main-temperature {
  position: relative;
  z-index: 2;
  display: grid;
  justify-items: end;
}

.main-temperature strong {
  font-size: clamp(26px, 4vw, 38px);
  line-height: 1;
}

.main-temperature small,
.metric-row dd small {
  color: #ffe680;
  font-size: 7px;
  font-weight: 900;
}

.main-temperature small.equal {
  color: rgb(255 255 255 / 70%);
}

.main-temperature small.placeholder,
.metric-row dd small.placeholder {
  visibility: hidden;
}

.comparison-card dl {
  display: grid;
  gap: 7px;
  margin: 0;
}

.metric-row {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border: 1px solid #e7e9f0;
  border-radius: 11px;
  background: #fafbfe;
  transition: 0.18s ease;
}

.metric-row.higher {
  border-color: #f0cf5f;
  background: linear-gradient(135deg, #fffbe6, #fff3bd);
  box-shadow: 0 6px 15px rgb(218 174 50 / 13%);
}

.metric-row.equal {
  background: #f5f6fa;
}

.metric-row dt {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #67758a;
  font-size: 10px;
  font-weight: 750;
}

.metric-row dt span {
  font-size: 13px;
}

.metric-row dd {
  display: grid;
  margin: 0;
  justify-items: end;
}

.metric-row dd strong {
  color: #35445a;
  font-size: 11px;
}

.metric-row dd small {
  color: #b47900;
}

.metric-row.equal dd small {
  color: #8a94a5;
}

@media (max-width: 620px) {
  .comparison-card {
    padding: 13px;
  }

  .city-hero {
    min-height: 142px;
    padding: 15px;
  }
}
</style>
