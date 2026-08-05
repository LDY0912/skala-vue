<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
// 화면을 작은 UI 컴포넌트로 나눠 검색창과 날씨 카드를 재사용한다.
import BaseDashboardCard from '../components/weather/BaseDashboardCard.vue'
import SearchBar from '../components/weather/SearchBar.vue'
import UnitToggler from '../components/weather/UnitToggler.vue'
import WeatherCard from '../components/weather/WeatherCard.vue'
import { findGlobalWeatherById, globalWeatherLocations } from '../data/weatherLocations.js'
import { fetchCurrentWeather, getWeatherErrorMessage } from '../services/weatherApi.js'

const FAVORITES_STORAGE_KEY = 'skala-weather-favorites'
const DEFAULT_FAVORITE_IDS = ['kr_seoul', 'jp_tokyo', 'us_new_york']

const router = useRouter()
// ref는 검색어와 API 요청 상태처럼 개별적으로 변하는 값을 관리한다.
const searchQuery = ref('')
const favoriteIds = ref(readFavoriteIds())
// reactive는 여러 도시 객체를 ID별로 묶은 반응형 컬렉션을 관리한다.
const weatherById = reactive(
  Object.fromEntries(globalWeatherLocations.map((city) => [city.id, { ...city }])),
)
const selectedCityInfo = ref('도시를 검색해 메인 즐겨찾기에 추가해 보세요.')
const isLoading = ref(false)
const isSearching = ref(false)
const apiError = ref('')
let searchTimer

function readFavoriteIds() {
  const storedValue = localStorage.getItem(FAVORITES_STORAGE_KEY)
  if (storedValue === null) return [...DEFAULT_FAVORITE_IDS]

  try {
    const parsedIds = JSON.parse(storedValue)
    if (!Array.isArray(parsedIds)) return [...DEFAULT_FAVORITE_IDS]

    return parsedIds.filter((id) => findGlobalWeatherById(id))
  } catch {
    return [...DEFAULT_FAVORITE_IDS]
  }
}

function saveFavoriteIds() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds.value))
}

function normalizeSearchText(value) {
  return value.trim().toLocaleLowerCase('ko-KR')
}

// computed는 원본 상태가 바뀔 때 필요한 목록만 자동으로 다시 계산한다.
const favoriteWeatherList = computed(() => favoriteIds.value.map((id) => weatherById[id]).filter(Boolean))

const searchResults = computed(() => {
  const normalizedQuery = normalizeSearchText(searchQuery.value)
  if (!normalizedQuery) return []

  return globalWeatherLocations
    .filter((city) =>
      [city.name, city.nameEn, city.country, city.countryEn, city.countryCode].some((value) =>
        normalizeSearchText(value).includes(normalizedQuery),
      ),
    )
    .slice(0, 10)
})

const displayedSearchResults = computed(() =>
  searchResults.value.map((city) => weatherById[city.id] ?? city),
)

const observedAt = computed(() => {
  const timestamp = favoriteWeatherList.value.find((city) => city.observedAt)?.observedAt
  if (!timestamp) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
})

function isFavorite(cityId) {
  return favoriteIds.value.includes(cityId)
}

async function loadLocations(locations) {
  const uniqueLocations = [...new Map(locations.map((city) => [city.id, city])).values()]
  if (uniqueLocations.length === 0) return []

  const results = await Promise.allSettled(
    uniqueLocations.map(async (city) => fetchCurrentWeather(city)),
  )

  results.forEach((result) => {
    if (result.status !== 'fulfilled') return

    weatherById[result.value.id] = result.value
  })

  return results.filter((result) => result.status === 'rejected').map((result) => result.reason)
}

async function loadFavoriteWeather() {
  // 요청 시작/종료와 실패 메시지를 상태로 분리해 템플릿에서 즉시 피드백한다.
  isLoading.value = true
  apiError.value = ''

  const favoriteLocations = favoriteIds.value.map(findGlobalWeatherById).filter(Boolean)
  const errors = await loadLocations(favoriteLocations)

  if (errors.length > 0) apiError.value = getWeatherErrorMessage(errors[0])
  isLoading.value = false
}

async function loadSearchWeather() {
  if (searchResults.value.length === 0) return

  isSearching.value = true
  const errors = await loadLocations(searchResults.value)
  if (errors.length === searchResults.value.length) {
    apiError.value = getWeatherErrorMessage(errors[0])
  }
  isSearching.value = false
}

async function addFavorite(cityId) {
  if (isFavorite(cityId)) return

  const city = findGlobalWeatherById(cityId)
  if (!city) return

  favoriteIds.value = [...favoriteIds.value, cityId]
  saveFavoriteIds()
  selectedCityInfo.value = `${city.name}을(를) 메인 즐겨찾기에 추가했습니다.`

  const errors = await loadLocations([city])
  if (errors.length > 0) apiError.value = getWeatherErrorMessage(errors[0])
}

function removeFavorite(cityId) {
  const city = findGlobalWeatherById(cityId)
  favoriteIds.value = favoriteIds.value.filter((id) => id !== cityId)
  saveFavoriteIds()
  selectedCityInfo.value = `${city?.name ?? '도시'}을(를) 메인 즐겨찾기에서 삭제했습니다.`
}

function showDetail(cityId) {
  // 버튼 이벤트에서 Vue Router의 프로그래밍 방식 이동을 사용한다.
  router.push(`/weather/${cityId}`)
}

watch(searchQuery, () => {
  window.clearTimeout(searchTimer)

  if (!searchQuery.value.trim()) {
    isSearching.value = false
    return
  }

  searchTimer = window.setTimeout(loadSearchWeather, 350)
})

onMounted(loadFavoriteWeather)
onBeforeUnmount(() => window.clearTimeout(searchTimer))
</script>

<template>
  <main class="final-project">
    <header class="final-heading">
      <div>
        <span class="eyebrow">Vue 3 · Axios · OpenWeather</span>
        <h1>최종과제: 실시간 날씨 API</h1>
        <p>30개 국가의 주요 도시를 검색하고 자주 보는 날씨를 저장할 수 있습니다.</p>
      </div>

      <UnitToggler />
    </header>

    <div class="api-state" :class="{ error: apiError }" aria-live="polite">
      <template v-if="isLoading">⏳ 즐겨찾기 날씨를 불러오는 중입니다.</template>
      <template v-else-if="apiError">
        ⚠️ {{ apiError }}
        <button type="button" @click="loadFavoriteWeather">다시 시도</button>
      </template>
      <template v-else-if="observedAt">
        🟢 즐겨찾기 {{ favoriteWeatherList.length }}개 실시간 연동 · {{ observedAt }} 기준
      </template>
      <template v-else>⭐ 원하는 도시를 검색해 메인에 추가해 보세요.</template>
    </div>

    <BaseDashboardCard>
      <SearchBar
        :current-query="searchQuery"
        placeholder="도시·국가명 또는 국가 코드 검색 (예: 파리, Canada, JP)"
        @update-query="(value) => (searchQuery = value)"
      />

      <section v-if="searchQuery.trim()" class="search-results" aria-live="polite">
        <div class="search-results-heading">
          <strong>검색 결과 {{ displayedSearchResults.length }}개</strong>
          <span v-if="isSearching">최신 날씨 확인 중...</span>
        </div>

        <article v-for="city in displayedSearchResults" :key="city.id" class="search-result">
          <div>
            <strong>{{ city.flag }} {{ city.name }}</strong>
            <span>{{ city.country }} · {{ city.nameEn }}</span>
            <small>{{ city.status }} · {{ city.temp }}°C</small>
          </div>
          <div class="search-result-actions">
            <button type="button" :disabled="isFavorite(city.id)" @click="addFavorite(city.id)">
              {{ isFavorite(city.id) ? '즐겨찾기됨' : '즐겨찾기 추가' }}
            </button>
            <button type="button" class="detail-button" @click="showDetail(city.id)">
              상세보기
            </button>
          </div>
        </article>

        <p v-if="displayedSearchResults.length === 0" class="empty-message">
          검색 결과와 일치하는 도시 또는 국가가 없습니다.
        </p>
      </section>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>즐겨찾는 도시 날씨 ({{ favoriteWeatherList.length }})</h3>

      <WeatherCard
        v-for="city in favoriteWeatherList"
        :key="city.id"
        :city-item="city"
        use-config-unit
        removable
        @select-card="(message) => (selectedCityInfo = message)"
        @click-detail="showDetail"
        @remove-card="removeFavorite"
      />

      <p v-if="favoriteWeatherList.length === 0" class="empty-message neutral">
        저장한 도시가 없습니다. 위 검색 결과에서 도시를 추가해 주세요.
      </p>
    </BaseDashboardCard>

    <p class="status-bar" aria-live="polite">{{ selectedCityInfo }}</p>
  </main>
</template>

<style scoped>
.final-project {
  min-width: 0;
}

.final-heading {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
  padding: 28px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 22px;
  background:
    radial-gradient(circle at 86% 18%, rgb(119 225 255 / 26%), transparent 30%),
    linear-gradient(135deg, #30347c 0%, #436ac2 56%, #16a5c0 100%);
  color: #fff;
  box-shadow: 0 18px 42px rgb(49 65 139 / 24%);
}

.final-heading::after {
  position: absolute;
  right: -45px;
  bottom: -70px;
  width: 190px;
  height: 190px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.eyebrow {
  display: block;
  margin-bottom: 4px;
  color: #bfeeff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

h1,
.final-heading p {
  margin: 0;
}

h1 {
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.35;
}

.final-heading p {
  margin-top: 7px;
  color: #dbefff;
  font-size: 12px;
}

.final-heading :deep(.unit-toggler) {
  position: relative;
  z-index: 1;
  padding: 10px 12px;
  border: 1px solid rgb(255 255 255 / 48%);
  border-radius: 12px;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 8px 20px rgb(20 35 82 / 15%);
}

.api-state {
  margin-bottom: 16px;
  padding: 10px 14px;
  border: 1px solid #ccebdd;
  border-radius: 11px;
  background: #effaf5;
  color: #187650;
  box-shadow: 0 4px 14px rgb(21 154 104 / 5%);
  font-size: 11px;
  font-weight: 750;
}

.api-state.error {
  border-color: #f3cdd2;
  background: #fff2f3;
  color: #bd4655;
}

.api-state button {
  margin-left: 7px;
  padding: 3px 7px;
  border: 1px solid currentColor;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.search-results {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e6e9f1;
}

.search-results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #315675;
  font-size: 12px;
}

.search-results-heading span {
  color: #2585b5;
  font-size: 11px;
}

.search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  padding: 12px 13px;
  border: 1px solid #e2e6ef;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff, #fafbff);
  box-shadow: 0 4px 14px rgb(24 37 63 / 4%);
}

.search-result span,
.search-result small {
  display: block;
}

.search-result strong {
  color: #244c69;
  font-size: 13px;
}

.search-result span,
.search-result small {
  margin-top: 1px;
  color: #6d808d;
  font-size: 11px;
}

.search-result button {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 1px solid #5556d3;
  border-radius: 8px;
  background: linear-gradient(135deg, #6667e2, #5051cc);
  color: #fff;
  font: inherit;
  box-shadow: 0 4px 10px rgb(80 81 204 / 16%);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.search-result button:disabled {
  border-color: #b7c2c9;
  background: #d5dce0;
  color: #687983;
  cursor: default;
}

.search-result-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 5px;
}

.search-result .detail-button {
  border-color: #d4d9e5;
  background: #fff;
  box-shadow: none;
  color: #4d5b70;
}

.search-result .detail-button:hover {
  border-color: #c6c8ed;
  background: #f2f2ff;
}

.empty-message {
  margin: 12px 0;
  color: #d44d4d;
  font-size: 13px;
  text-align: center;
}

.empty-message.neutral {
  color: #6d808d;
}

.status-bar {
  margin: 2px 0 0;
  padding: 10px 13px;
  border: 1px solid #d2ebdd;
  border-radius: 11px;
  background: #eef9f3;
  color: #188256;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
}

@media (max-width: 600px) {
  .final-heading {
    align-items: flex-start;
    flex-direction: column;
    padding: 23px 20px;
  }

  h1 {
    font-size: 21px;
  }

  .search-result {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-result-actions {
    width: 100%;
  }

  .search-result-actions button {
    flex: 1;
  }
}
</style>
