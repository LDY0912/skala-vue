<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from '../components/Exercise3Childs/BaseDashboardCard.vue'
import SearchBar from '../components/Exercise3Childs/SearchBar.vue'
import UnitToggler from '../components/Exercise3Childs/UnitToggler.vue'
import WeatherCard from '../components/Exercise3Childs/WeatherCard.vue'
import { findGlobalWeatherById, globalWeatherLocations } from '../data/weather.js'
import { fetchCurrentWeather, getWeatherErrorMessage } from '../services/weatherApi.js'

const FAVORITES_STORAGE_KEY = 'skala-weather-favorites'
const DEFAULT_FAVORITE_IDS = ['kr_seoul', 'jp_tokyo', 'us_new_york']

const router = useRouter()
const searchQuery = ref('')
const favoriteIds = ref(readFavoriteIds())
const weatherById = ref(
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

const favoriteWeatherList = computed(() =>
  favoriteIds.value.map((id) => weatherById.value[id]).filter(Boolean),
)

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
  searchResults.value.map((city) => weatherById.value[city.id] ?? city),
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

    weatherById.value = {
      ...weatherById.value,
      [result.value.id]: result.value,
    }
  })

  return results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason)
}

async function loadFavoriteWeather() {
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
        <h1>🌤️ 최종과제: 실시간 날씨 API</h1>
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
            <button
              type="button"
              :disabled="isFavorite(city.id)"
              @click="addFavorite(city.id)"
            >
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
      <h3>⭐ 즐겨찾는 도시 날씨 ({{ favoriteWeatherList.length }})</h3>

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
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
  padding: 22px;
  border-radius: 14px;
  background: linear-gradient(135deg, #143e5d, #087fb4);
  color: #fff;
  box-shadow: 0 8px 22px rgb(13 76 111 / 18%);
}

.eyebrow {
  display: block;
  margin-bottom: 4px;
  color: #aee6fb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

h1,
.final-heading p {
  margin: 0;
}

h1 {
  font-size: 25px;
  font-weight: 800;
  line-height: 1.35;
}

.final-heading p {
  margin-top: 5px;
  color: #d8f0fa;
  font-size: 13px;
}

.final-heading :deep(.unit-toggler) {
  padding: 9px 10px;
  border-radius: 7px;
  background: rgb(255 255 255 / 94%);
}

.api-state {
  margin-bottom: 14px;
  padding: 9px 12px;
  border: 1px solid #bee5ce;
  border-radius: 7px;
  background: #eaf8ef;
  color: #197144;
  font-size: 12px;
  font-weight: 650;
}

.api-state.error {
  border-color: #f2c8c8;
  background: #fff0f0;
  color: #ad3c3c;
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
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #dfe6eb;
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
  margin-top: 6px;
  padding: 9px 10px;
  border: 1px solid #dce5eb;
  border-radius: 6px;
  background: #fff;
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
  padding: 6px 9px;
  border: 1px solid #1888bc;
  border-radius: 5px;
  background: #159bd7;
  color: #fff;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
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
  border-color: #637c8d;
  background: #fff;
  color: #36566d;
}

.search-result .detail-button:hover {
  background: #eef3f6;
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
  padding: 9px 12px;
  border-radius: 6px;
  background: #e2f5e6;
  color: #168943;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 600px) {
  .final-heading {
    align-items: flex-start;
    flex-direction: column;
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
