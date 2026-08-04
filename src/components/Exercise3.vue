<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
// 1. 컴포넌트 파일명 국룰 표기법(PascalCase) 매칭 수입
import BaseDashboardCard from './Exercise3Childs/BaseDashboardCard.vue'
import SearchBar from './Exercise3Childs/SearchBar.vue'
import WeatherCard from './Exercise3Childs/WeatherCard.vue'

defineOptions({ name: 'WeatherExerciseThree' })

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

// 기존 핵심 비즈니스 로직(computed, watch)의 소유권은 안전하게 부모 콘텍스트가 격리 유지
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((item) => item.name.includes(query))
})

watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`,
  )
})

const showDetail = (_cityId, cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <h1>과제 3: 날씨 (컴포넌트)</h1>
    <hr />

    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>

      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :city-item="item"
        @select-card="(msg) => (selectedCityInfo = msg)"
        @click-detail="showDetail"
      />

      <p
        v-if="filteredWeatherList.length === 0"
        style="text-align: center; color: #e74c3c; padding: 10px 0"
      >
        😭 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </BaseDashboardCard>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-width: 0;
  padding: 22px;
  border: 1px solid #e2e6ef;
  border-radius: 17px;
  background: rgb(255 255 255 / 82%);
  box-shadow: 0 9px 26px rgb(24 37 63 / 6%);
}

h1 {
  margin: 0;
  color: #27364d;
  font-size: 20px;
  font-weight: 850;
  line-height: 1.4;
}

h1::before {
  content: '🌤️';
  margin-right: 10px;
  font-size: 18px;
}

hr {
  height: 1px;
  margin: 10px 0 20px;
  border: 0;
  background: #e5e8ef;
}

.status-bar {
  margin-top: 12px;
  padding: 8px 12px;
  border: 1px solid #d2ebdd;
  border-radius: 10px;
  background: #eef9f3;
  color: #188256;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}
</style>
