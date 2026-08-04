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
  padding: 0 16px 18px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgb(24 59 91 / 6%);
}

h2 {
  margin: 0 -14px 14px;
  padding: 0 2px 10px;
  border-bottom: 1px solid #dce3e9;
  color: #315675;
  font-size: 16px;
  font-weight: 600;
}

.detail-card,
.missing-city {
  margin-bottom: 14px;
  padding: 14px;
  border-radius: 6px;
  background: #f1f3f6;
}

p {
  margin: 0;
  color: #315675;
  font-size: 13px;
  line-height: 1.6;
}

.missing-city p {
  color: #d34e4e;
}

button {
  padding: 8px 12px;
  border: 0;
  border-radius: 3px;
  background: #233f54;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: #152c3d;
}
</style>
