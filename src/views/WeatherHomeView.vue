<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseDashboardCard from '../components/Exercise3Childs/BaseDashboardCard.vue'
import SearchBar from '../components/Exercise3Childs/SearchBar.vue'
import WeatherCard from '../components/Exercise3Childs/WeatherCard.vue'
import { weatherList } from '../data/weather.js'

const props = defineProps({
  useConfigUnit: {
    type: Boolean,
    default: false,
  },
  routeBase: {
    type: String,
    default: '',
  },
})

const route = useRoute()
const router = useRouter()

const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) return weatherList

  return weatherList.filter((city) => city.name.includes(query))
})

watch(searchQuery, (query) => {
  const nextQuery = query.trim()
  const currentQuery = typeof route.query.q === 'string' ? route.query.q : ''

  if (nextQuery === currentQuery) return

  router.replace({
    query: nextQuery ? { ...route.query, q: nextQuery } : { ...route.query, q: undefined },
  })
})

watch(
  () => route.query.q,
  (query) => {
    const nextQuery = typeof query === 'string' ? query : ''
    if (nextQuery !== searchQuery.value.trim()) searchQuery.value = nextQuery
  },
)

function selectCity(message) {
  selectedCityInfo.value = message
}

function showDetail(cityId) {
  router.push(`${props.routeBase}/weather/${cityId}`)
}
</script>

<template>
  <div class="weather-home">
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(value) => (searchQuery = value)" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🗺️ 지역별 날씨 현황</h3>

      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        :use-config-unit="useConfigUnit"
        @select-card="selectCity"
        @click-detail="showDetail"
      />

      <p v-if="filteredWeatherList.length === 0" class="empty-message">
        😭 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>

    <p class="status-bar" aria-live="polite">{{ selectedCityInfo }}</p>
  </div>
</template>

<style scoped>
.weather-home {
  min-width: 0;
}

.empty-message {
  margin: 10px 0 4px;
  color: #e05252;
  font-size: 13px;
  text-align: center;
}

.status-bar {
  margin: 2px 0 0;
  padding: 9px 12px;
  border: 1px solid #d2ebdd;
  border-radius: 10px;
  background: #eef9f3;
  color: #188256;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}
</style>
