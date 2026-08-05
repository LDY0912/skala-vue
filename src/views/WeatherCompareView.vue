<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UnitToggler from '../components/weather/UnitToggler.vue'
import WeatherComparisonCard from '../components/weather/WeatherComparisonCard.vue'
import { findGlobalWeatherById, globalWeatherLocations } from '../data/weatherLocations.js'
import { fetchCurrentWeather, getWeatherErrorMessage } from '../services/weatherApi.js'

const route = useRoute()
const router = useRouter()
const requestedLeftCity = findGlobalWeatherById(String(route.query.left ?? ''))
// 두 필드가 한 선택 폼을 이루므로 reactive 객체로 함께 관리한다.
const selection = reactive({
  leftId: requestedLeftCity?.id ?? 'kr_seoul',
  rightId: requestedLeftCity?.id === 'jp_tokyo' ? 'us_new_york' : 'jp_tokyo',
})
const leftWeather = ref(null)
const rightWeather = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const comparisonMetrics = ['temp', 'feelsLike', 'humidity', 'windSpeed', 'pressure', 'cloudiness', 'visibility']

// 각 수치의 좌우 값을 비교해 어느 카드가 강조될지 계산한다.
const winnerMap = computed(() => {
  if (!leftWeather.value || !rightWeather.value) return {}

  return Object.fromEntries(
    comparisonMetrics.map((key) => {
      const leftValue = Number(leftWeather.value[key])
      const rightValue = Number(rightWeather.value[key])

      if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return [key, 'equal']
      if (leftValue === rightValue) return [key, 'equal']
      return [key, leftValue > rightValue ? 'left' : 'right']
    }),
  )
})

const selectedNames = computed(() => ({
  left: findGlobalWeatherById(selection.leftId)?.name ?? '',
  right: findGlobalWeatherById(selection.rightId)?.name ?? '',
}))

async function compareWeather() {
  if (selection.leftId === selection.rightId) {
    errorMessage.value = '서로 다른 두 지역을 선택해 주세요.'
    return
  }

  const leftCity = findGlobalWeatherById(selection.leftId)
  const rightCity = findGlobalWeatherById(selection.rightId)
  if (!leftCity || !rightCity) return

  // API 요청 상태를 ref로 분리해 로딩 문구, 버튼 비활성화, 오류 재시도를 제어한다.
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [leftResult, rightResult] = await Promise.all([
      fetchCurrentWeather(leftCity),
      fetchCurrentWeather(rightCity),
    ])
    leftWeather.value = leftResult
    rightWeather.value = rightResult
  } catch (error) {
    errorMessage.value = getWeatherErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

function swapCities() {
  const previousLeftId = selection.leftId
  const previousLeftWeather = leftWeather.value
  selection.leftId = selection.rightId
  selection.rightId = previousLeftId
  leftWeather.value = rightWeather.value
  rightWeather.value = previousLeftWeather
}

function openDetail(cityId) {
  router.push(`/weather/${cityId}`)
}

onMounted(compareWeather)
</script>

<template>
  <main class="compare-page">
    <header class="compare-hero">
      <div>
        <span class="eyebrow">WEATHER VS WEATHER</span>
        <h1>두 도시 날씨 비교</h1>
        <p>두 지역의 실시간 날씨를 나란히 보고 더 높은 수치를 빠르게 찾아보세요.</p>
      </div>
      <div class="hero-vs" aria-hidden="true"><span>V</span><b>S</b></div>
      <UnitToggler />
    </header>

    <section class="compare-controls" aria-label="비교 도시 선택">
      <label>
        <span>왼쪽 지역</span>
        <select v-model="selection.leftId">
          <option v-for="city in globalWeatherLocations" :key="city.id" :value="city.id">
            {{ city.flag }} {{ city.name }} · {{ city.country }}
          </option>
        </select>
      </label>

      <button type="button" class="swap-button" title="좌우 지역 바꾸기" @click="swapCities">
        ⇄
      </button>

      <label>
        <span>오른쪽 지역</span>
        <select v-model="selection.rightId">
          <option v-for="city in globalWeatherLocations" :key="city.id" :value="city.id">
            {{ city.flag }} {{ city.name }} · {{ city.country }}
          </option>
        </select>
      </label>

      <button type="button" class="compare-submit" :disabled="isLoading" @click="compareWeather">
        {{ isLoading ? '비교 중...' : '날씨 비교하기' }}
      </button>
    </section>

    <p v-if="errorMessage" class="compare-state error" aria-live="polite">
      ⚠️ {{ errorMessage }}
      <button type="button" @click="compareWeather">다시 시도</button>
    </p>
    <p v-else-if="isLoading" class="compare-state" aria-live="polite">
      ⏳ {{ selectedNames.left }}과(와) {{ selectedNames.right }}의 실시간 날씨를 불러오는 중입니다.
    </p>

    <section v-if="leftWeather && rightWeather" class="comparison-board">
      <WeatherComparisonCard
        :city="leftWeather"
        side="left"
        :winner-map="winnerMap"
        @open-detail="openDetail"
      />

      <div class="versus-divider" aria-hidden="true"><span>VS</span></div>

      <WeatherComparisonCard
        :city="rightWeather"
        side="right"
        :winner-map="winnerMap"
        @open-detail="openDetail"
      />
    </section>

    <aside class="comparison-guide">
      <span><i></i> 노란색으로 표시된 항목이 두 도시 중 더 높은 수치입니다.</span>
      <small>높은 값이 항상 더 쾌적하거나 좋은 날씨를 의미하는 것은 아닙니다.</small>
    </aside>
  </main>
</template>

<style scoped>
.compare-page {
  display: grid;
  gap: 17px;
}

.compare-hero {
  position: relative;
  display: flex;
  min-height: 210px;
  overflow: hidden;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 32px;
  border-radius: 26px;
  color: #fff;
  background:
    radial-gradient(circle at 15% 10%, rgb(96 214 255 / 24%), transparent 28%),
    radial-gradient(circle at 88% 16%, rgb(255 113 182 / 28%), transparent 30%),
    linear-gradient(120deg, #263879 0%, #463b9c 50%, #923f7f 100%);
  box-shadow: 0 22px 50px rgb(43 45 117 / 24%);
}

.compare-hero::after {
  position: absolute;
  width: 320px;
  height: 320px;
  right: calc(50% - 160px);
  bottom: -210px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 50%;
  box-shadow: 0 0 70px rgb(255 255 255 / 9%);
  content: '';
}

.compare-hero > div:first-child,
.compare-hero :deep(.unit-toggler) {
  position: relative;
  z-index: 2;
}

.eyebrow {
  color: #bfefff;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.compare-hero h1,
.compare-hero p {
  margin: 0;
}

.compare-hero h1 {
  margin-top: 5px;
  font-size: clamp(28px, 4vw, 42px);
  letter-spacing: -0.045em;
}

.compare-hero p {
  margin-top: 7px;
  color: rgb(235 242 255 / 82%);
  font-size: 11px;
}

.compare-hero :deep(.unit-toggler) {
  padding: 10px 12px;
  border: 1px solid rgb(255 255 255 / 42%);
  border-radius: 12px;
  background: rgb(255 255 255 / 92%);
}

.hero-vs {
  position: absolute;
  top: 30px;
  left: 50%;
  display: flex;
  color: rgb(255 255 255 / 16%);
  font-size: 76px;
  font-weight: 950;
  line-height: 1;
  transform: translateX(-50%) rotate(-7deg);
}

.hero-vs b {
  margin-left: -7px;
  color: rgb(255 228 112 / 24%);
}

.compare-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: end;
  padding: 18px;
  border: 1px solid #e2e5ee;
  border-radius: 18px;
  background: rgb(255 255 255 / 88%);
  box-shadow: 0 12px 30px rgb(31 43 74 / 7%);
  backdrop-filter: blur(14px);
}

.compare-controls label {
  display: grid;
  gap: 6px;
}

.compare-controls label span {
  color: #66758a;
  font-size: 9px;
  font-weight: 850;
}

.compare-controls select {
  width: 100%;
  min-width: 0;
  height: 42px;
  padding: 0 11px;
  border: 1px solid #dfe3ec;
  border-radius: 10px;
  outline: 0;
  color: #35445a;
  background: #fafbfe;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}

.compare-controls select:focus {
  border-color: #7475df;
  box-shadow: 0 0 0 3px rgb(91 92 226 / 10%);
}

.swap-button,
.compare-submit {
  height: 42px;
  border-radius: 10px;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
}

.swap-button {
  border: 1px solid #dfe3ec;
  color: #6465d9;
  background: #f5f4ff;
  font-size: 20px;
}

.swap-button:hover {
  transform: rotate(180deg);
}

.compare-submit {
  padding: 0 16px;
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #6869df, #4e50c2);
  box-shadow: 0 8px 18px rgb(78 80 194 / 21%);
  font-size: 10px;
}

.compare-submit:disabled {
  opacity: 0.6;
  cursor: wait;
}

.compare-state {
  margin: 0;
  padding: 11px 14px;
  border: 1px solid #cee6f1;
  border-radius: 11px;
  color: #32718e;
  background: #eff9fc;
  font-size: 10px;
  font-weight: 750;
}

.compare-state.error {
  border-color: #f0cbd1;
  color: #b64453;
  background: #fff2f3;
}

.compare-state button {
  margin-left: 6px;
  border: 0;
  color: inherit;
  background: transparent;
  font-weight: 850;
  text-decoration: underline;
  cursor: pointer;
}

.comparison-board {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.versus-divider {
  position: absolute;
  z-index: 3;
  top: 113px;
  left: 50%;
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border: 4px solid #f5f6fb;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(145deg, #2e3854, #111827);
  box-shadow: 0 8px 20px rgb(17 24 39 / 24%);
  font-size: 11px;
  font-weight: 950;
  transform: translateX(-50%);
}

.comparison-guide {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid #eadca9;
  border-radius: 12px;
  color: #80681e;
  background: #fffae8;
  font-size: 9px;
}

.comparison-guide span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
}

.comparison-guide i {
  width: 10px;
  height: 10px;
  border: 2px solid #e1b931;
  border-radius: 3px;
  background: #fff1ab;
}

.comparison-guide small {
  color: #9a8b5c;
  font-size: 8px;
}

@media (max-width: 760px) {
  .compare-hero {
    min-height: 230px;
    align-items: flex-start;
    flex-direction: column;
    padding: 25px 22px;
  }

  .compare-controls {
    grid-template-columns: minmax(0, 1fr) 38px minmax(0, 1fr);
  }

  .compare-submit {
    grid-column: 1 / -1;
  }
}

@media (max-width: 620px) {
  .comparison-board {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
  }

  .versus-divider {
    top: 100px;
    width: 36px;
    height: 36px;
    font-size: 9px;
  }

  .comparison-guide {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 460px) {
  .compare-controls {
    grid-template-columns: 1fr;
  }

  .swap-button,
  .compare-submit {
    grid-column: auto;
  }

  .swap-button {
    width: 100%;
  }

  .comparison-board {
    grid-template-columns: 1fr;
  }

  .versus-divider {
    position: relative;
    top: auto;
    left: 50%;
    grid-row: 2;
    margin: -20px 0;
  }
}
</style>
