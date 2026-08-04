<script setup>
import { watch, watchEffect, computed, ref } from 'vue'

defineOptions({ name: 'WeatherExerciseTwo' })

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

const search = ref('')
const selectedCityInfo = ref('')
selectedCityInfo.value = '카드를 클릭하거나 검색해 보세요.'

const filteredWeatherList = computed(() => {
  const query = search.value.trim()

  if (!query) {
    return weatherList.value
  }

  return weatherList.value.filter((e) => e.name.includes(query))
})

watch(selectedCityInfo, (newInfo) => {
  console.log(`👁️‍🗨️ [watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

watchEffect(() => {
  console.log(
    `🤖 [watchEffect 자동 호출] 현재 검색어 '${search.value}'에 매칭되는 API 데이터를 필터링합니다.`,
  )
})
</script>

<template>
  <section class="exercise-panel">
    <h1>과제 2: 날씨 (컴포지션)</h1>
    <hr />
    <div class="weather-section search-section">
      <h3>도시 검색</h3>
      <input
        type="text"
        :value="search"
        @input="(e) => (search = e.target.value)"
        placeholder="도시 이름을 입력해 주세요.(서울, 수원, 부산)"
      />
      <p>검색 중인 도시: {{ search }}</p>
    </div>

    <div class="weather-section weather-list-section">
      <h3>지역별 날씨 현황</h3>
      <div
        class="city"
        v-for="filteredWeather in filteredWeatherList"
        :key="filteredWeather.id"
        @click="selectedCityInfo = `${filteredWeather.name}이 선택되었습니다.`"
      >
        <p>{{ filteredWeather.name }} ({{ filteredWeather.status }})</p>
        <p>현재 기온: {{ filteredWeather.temp }}℃</p>

        <p class="temp-badge" :class="filteredWeather.temp >= 25 ? 'is-hot' : 'is-cool'">
          {{ filteredWeather.temp >= 25 ? '더움 (25도 이상)' : '신선함 (25도 미만)' }}
        </p>
        <button @click.stop="showDetail(filteredWeather.name, filteredWeather.status)">
          상세보기
        </button>
      </div>

      <div class="selection-message">
        {{ selectedCityInfo }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.exercise-panel {
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
  margin: 11px 0 18px;
  border: 0;
  background: #e5e8ef;
}

.weather-section {
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid #e4e8f0;
  border-radius: 13px;
  background: #f8f9fd;
}

h3 {
  margin: 0 0 1px;
  color: #34435a;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.5;
}

.search-section h3::before {
  content: '🔍';
  margin-right: 8px;
}

.weather-list-section h3::before {
  content: '🗺️';
  margin-right: 8px;
}

input {
  display: block;
  width: 100%;
  height: 42px;
  padding: 8px 12px;
  border: 1px solid #d8deea;
  border-radius: 10px;
  background: #fff;
  color: #34495e;
  font: inherit;
  font-size: 13px;
  outline: none;
}

input:focus {
  border-color: #7374e2;
  box-shadow: 0 0 0 3px rgb(91 92 226 / 12%);
}

p {
  margin: 0;
  color: #52627a;
  font-size: 13px;
  line-height: 1.55;
}

.search-section > p {
  margin-top: 6px;
  color: #8b96a5;
  font-size: 11px;
}

.city {
  position: relative;
  min-height: 94px;
  margin: 8px 0 10px;
  padding: 14px 88px 13px 14px;
  border: 1px solid #e0e5ee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 5px 15px rgb(24 37 63 / 5%);
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;
}

.city:hover {
  border-color: #c5c7ef;
  box-shadow: 0 9px 20px rgb(69 70 198 / 9%);
  transform: translateY(-2px);
}

.temp-badge {
  display: inline-block;
  margin-top: 5px;
  padding: 2px 9px;
  border-radius: 999px;
  color: #fff;
  font-size: 11px;
  line-height: 1.65;
}

.temp-badge::before {
  margin-right: 5px;
}

.temp-badge.is-hot {
  background: linear-gradient(135deg, #ff7676, #ee5668);
}

.temp-badge.is-hot::before {
  content: '🔥';
}

.temp-badge.is-cool {
  background: linear-gradient(135deg, #46bfe8, #4d8ee6);
}

.temp-badge.is-cool::before {
  content: '❄️';
}

button {
  position: absolute;
  top: 12px;
  right: 11px;
  min-width: 68px;
  height: 31px;
  padding: 3px 9px;
  border: 1px solid #d7dceb;
  border-radius: 8px;
  background: #f7f7ff;
  color: #4f50c8;
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

button:hover {
  border-color: #bfc1ee;
  background: #ededff;
}

.selection-message {
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

@media (max-width: 480px) {
  input {
    width: 100%;
  }

  .city {
    padding-right: 72px;
  }
}
</style>
