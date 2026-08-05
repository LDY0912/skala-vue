<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useWeatherUnitStore } from '../../stores/weatherUnitStore.js'

// Props로 받은 도시 데이터는 자식 컴포넌트에서 직접 변경하지 않는다.
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  useConfigUnit: {
    type: Boolean,
    default: false,
  },
  removable: {
    type: Boolean,
    default: false,
  },
})

// 상세보기·삭제 같은 사용자 행동은 Emits로 부모 컴포넌트에 알린다.
const emit = defineEmits(['select-card', 'click-detail', 'remove-card'])

const weatherUnitStore = useWeatherUnitStore()
const { unit, unitSymbol } = storeToRefs(weatherUnitStore)

function convertTemperature(rawTemp) {
  if (rawTemp == null) return '-'

  if (props.useConfigUnit && unit.value === 'fahrenheit') {
    return Math.round(((rawTemp * 9) / 5 + 32) * 10) / 10
  }

  return rawTemp
}

const displayTemp = computed(() => convertTemperature(props.cityItem.temp))
const displayFeelsLike = computed(() => convertTemperature(props.cityItem.feelsLike))
const displayUnitSymbol = computed(() => (props.useConfigUnit ? unitSymbol.value : '°C'))

const weatherTone = computed(() => {
  const code = props.cityItem.weatherCode
  const status = props.cityItem.status ?? ''

  if ((code >= 200 && code < 300) || /천둥|뇌우/.test(status)) return 'tone-storm'
  if ((code >= 300 && code < 600) || /비|소나기|이슬비/.test(status)) return 'tone-rain'
  if ((code >= 600 && code < 700) || /눈/.test(status)) return 'tone-snow'
  if (code === 800 || /맑/.test(status)) return 'tone-clear'
  if (code > 800 || /구름|흐림/.test(status)) return 'tone-clouds'
  return 'tone-default'
})

const weatherGlyph = computed(() => {
  if (weatherTone.value === 'tone-storm') return '⚡'
  if (weatherTone.value === 'tone-rain') return '🌧️'
  if (weatherTone.value === 'tone-snow') return '❄️'
  if (weatherTone.value === 'tone-clear') return '☀️'
  if (weatherTone.value === 'tone-clouds') return '☁️'
  return '🌤️'
})
</script>

<template>
  <div
    class="weather-card"
    :class="[weatherTone, { removable }]"
    @click="emit('select-card', `${cityItem.name}이(가) 선택되었습니다.`)"
  >
    <div class="weather-main">
      <div class="city-copy">
        <span class="country-line">
          <b v-if="cityItem.flag">{{ cityItem.flag }}</b>
          {{ cityItem.country ?? '현재 지역' }}
        </span>
        <h4>{{ cityItem.name }}</h4>
        <p>{{ cityItem.status }}</p>
        <strong class="current-temperature">{{ displayTemp }}{{ displayUnitSymbol }}</strong>
      </div>

      <img
        v-if="cityItem.icon"
        class="weather-icon"
        :src="`https://openweathermap.org/img/wn/${cityItem.icon}@2x.png`"
        :alt="cityItem.status"
      />
      <span v-else class="weather-glyph" aria-hidden="true">{{ weatherGlyph }}</span>
    </div>

    <dl class="weather-facts" aria-label="현재 날씨 핵심 정보">
      <div>
        <dt>체감</dt>
        <dd>{{ displayFeelsLike }}{{ displayUnitSymbol }}</dd>
      </div>
      <div>
        <dt>습도</dt>
        <dd>{{ cityItem.humidity ?? '-' }}%</dd>
      </div>
      <div>
        <dt>바람</dt>
        <dd>{{ cityItem.windSpeed ?? '-' }} m/s</dd>
      </div>
    </dl>

    <button
      class="btn-detail"
      @click.stop="emit('click-detail', cityItem.id, cityItem.name, cityItem.status)"
    >
      상세보기
    </button>
    <button
      v-if="removable"
      class="btn-remove"
      type="button"
      :aria-label="`${cityItem.name} 즐겨찾기 삭제`"
      @click.stop="emit('remove-card', cityItem.id)"
    >
      삭제
    </button>
  </div>
</template>

<style scoped>
.weather-card {
  position: relative;
  min-height: 176px;
  overflow: hidden;
  margin: 8px 0 10px;
  padding: 17px 94px 15px 18px;
  border: 1px solid rgb(220 226 238 / 88%);
  border-radius: 17px;
  background:
    radial-gradient(circle at 78% 5%, rgb(111 151 255 / 15%), transparent 35%),
    linear-gradient(135deg, #fff, #f7f9ff);
  box-shadow: 0 9px 24px rgb(24 37 63 / 7%);
  cursor: pointer;
  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    transform 0.18s;
}

.weather-card::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 5px;
  background: linear-gradient(#7475e7, #34b5d2);
  content: '';
}

.weather-card::after {
  position: absolute;
  z-index: 0;
  top: -70px;
  right: 32px;
  width: 180px;
  height: 180px;
  border: 1px solid rgb(255 255 255 / 42%);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.weather-card.tone-clear {
  border-color: #f2dfb1;
  background:
    radial-gradient(circle at 78% 0%, rgb(255 213 91 / 34%), transparent 37%),
    linear-gradient(135deg, #fffdf4, #fff6da 72%, #fffdf9);
}

.weather-card.tone-clear::before {
  background: linear-gradient(#ffca4d, #ff8b61);
}

.weather-card.tone-rain {
  border-color: #cbdce9;
  background:
    radial-gradient(circle at 78% 0%, rgb(105 176 226 / 25%), transparent 38%),
    linear-gradient(135deg, #f8fbff, #e7f2fa 72%, #f9fcff);
}

.weather-card.tone-rain::before {
  background: linear-gradient(#4f8fc6, #3b65af);
}

.weather-card.tone-clouds {
  border-color: #d7dee7;
  background:
    radial-gradient(circle at 78% 0%, rgb(155 170 191 / 25%), transparent 38%),
    linear-gradient(135deg, #fbfcfe, #eaf0f5 72%, #fafcfd);
}

.weather-card.tone-clouds::before {
  background: linear-gradient(#8394a9, #596b84);
}

.weather-card.tone-snow {
  border-color: #cce6ef;
  background:
    radial-gradient(circle at 78% 0%, rgb(174 230 247 / 35%), transparent 38%),
    linear-gradient(135deg, #fff, #eaf9fd 72%, #fafdff);
}

.weather-card.tone-snow::before {
  background: linear-gradient(#78d4e8, #7395e1);
}

.weather-card.tone-storm {
  border-color: #c8c4e2;
  background:
    radial-gradient(circle at 78% 0%, rgb(126 113 203 / 26%), transparent 38%),
    linear-gradient(135deg, #f9f8ff, #e9e6f7 72%, #fbfaff);
}

.weather-card.tone-storm::before {
  background: linear-gradient(#7668c8, #3d426f);
}

.weather-card:hover {
  box-shadow: 0 17px 34px rgb(55 66 133 / 14%);
  transform: translateY(-3px);
}

.weather-card.removable {
  min-height: 176px;
}

.weather-main,
.weather-facts,
.btn-detail,
.btn-remove {
  position: relative;
  z-index: 2;
}

.weather-main {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
}

.city-copy {
  min-width: 0;
}

.country-line {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7d899a;
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.country-line b {
  font-size: 14px;
}

h4,
.city-copy p {
  margin: 0;
  color: #2c3b52;
}

h4 {
  overflow: hidden;
  margin-top: 1px;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.035em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-copy p {
  color: #6d7c8f;
  font-size: 9px;
}

.current-temperature {
  display: block;
  margin-top: 5px;
  color: #3f50a9;
  font-size: 27px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
}

.weather-icon,
.weather-glyph {
  width: 68px;
  height: 68px;
  flex: 0 0 auto;
}

.weather-icon {
  object-fit: contain;
  filter: drop-shadow(0 9px 12px rgb(45 62 93 / 16%));
}

.weather-glyph {
  display: grid;
  place-items: center;
  font-size: 40px;
  filter: drop-shadow(0 9px 12px rgb(45 62 93 / 13%));
}

.weather-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0 0;
}

.weather-facts div {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid rgb(255 255 255 / 76%);
  border-radius: 9px;
  background: rgb(255 255 255 / 65%);
  box-shadow: inset 0 0 0 1px rgb(123 139 171 / 7%);
  backdrop-filter: blur(8px);
}

.weather-facts dt,
.weather-facts dd {
  margin: 0;
  font-size: 9px;
}

.weather-facts dt {
  color: #8a95a6;
  font-weight: 700;
}

.weather-facts dd {
  color: #48566c;
  font-weight: 850;
}

.btn-detail {
  position: absolute;
  top: 13px;
  right: 11px;
  min-width: 68px;
  height: 31px;
  padding: 3px 9px;
  border: 1px solid rgb(75 86 126 / 14%);
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(135deg, #6672d9, #5058bd);
  box-shadow: 0 6px 14px rgb(72 80 183 / 18%);
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.btn-detail:hover {
  background: linear-gradient(135deg, #5966ce, #454dad);
  transform: translateY(-1px);
}

.btn-remove {
  position: absolute;
  top: 52px;
  right: 11px;
  min-width: 68px;
  height: 29px;
  padding: 3px 9px;
  border: 1px solid #f0cfd3;
  border-radius: 8px;
  background: #fff7f8;
  color: #d54c5c;
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.btn-remove:hover {
  border-color: #eeb6bd;
  background: #ffedef;
}

@media (max-width: 480px) {
  .weather-card {
    min-height: 190px;
    padding-right: 88px;
  }

  .weather-icon,
  .weather-glyph {
    width: 52px;
    height: 52px;
  }

  .weather-glyph {
    font-size: 32px;
  }
}
</style>
