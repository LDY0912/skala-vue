<script setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { findWeatherById } from '../data/weather.js'
import { useConfigStore } from '../stores/configStore.js'

const props = defineProps({
  cityId: {
    type: String,
    required: true,
  },
  useConfigUnit: {
    type: Boolean,
    default: false,
  },
  homePath: {
    type: String,
    default: '/',
  },
})

const router = useRouter()
const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)
const city = ref(null)

const displayTemp = computed(() => {
  if (!city.value) return ''

  const rawTemp = city.value.temp
  return props.useConfigUnit && unit.value === 'fahrenheit'
    ? Math.round((rawTemp * 9) / 5 + 32)
    : rawTemp
})

const displayUnitSymbol = computed(() => (props.useConfigUnit ? unitSymbol.value : '°C'))

function loadCity(cityId) {
  city.value = findWeatherById(cityId) ?? null
}

onMounted(() => {
  loadCity(props.cityId)
})

watch(
  () => props.cityId,
  (cityId) => loadCity(cityId),
)
</script>

<template>
  <section class="detail-view">
    <h2>📊 지역별 상세 기상 관측 정보</h2>

    <div v-if="city" class="detail-card">
      <p>📍 지정 지역: {{ city.location }}</p>
      <p>실시간 기온: {{ displayTemp }}{{ displayUnitSymbol }}</p>
      <p>기상 현황: {{ city.status }}</p>
      <p>대기 습도: {{ city.humidity }}%</p>
      <p>현재 풍속: {{ city.windSpeed }}m/s</p>
    </div>

    <div v-else class="missing-city">
      <p>요청한 도시 코드를 찾을 수 없습니다.</p>
    </div>

    <button type="button" @click="router.push(homePath)">← 메인 대시보드 돌아가기</button>
  </section>
</template>

<style scoped>
.detail-view {
  padding: 20px;
  border: 1px solid #e2e6ef;
  border-radius: 15px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 8px 24px rgb(24 37 63 / 6%);
}

h2 {
  margin: 0 0 14px;
  padding: 0 2px 12px;
  border-bottom: 1px solid #e3e7ef;
  color: #2c3b52;
  font-size: 17px;
  font-weight: 850;
}

.detail-card,
.missing-city {
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid #e5e8f0;
  border-radius: 11px;
  background: #f7f8fc;
}

p {
  margin: 0;
  color: #52627a;
  font-size: 12px;
  line-height: 1.6;
}

.missing-city p {
  color: #d34e4e;
}

button {
  padding: 8px 12px;
  border: 1px solid #3e4d64;
  border-radius: 9px;
  background: #34435a;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: #27354a;
  transform: translateY(-1px);
}
</style>
