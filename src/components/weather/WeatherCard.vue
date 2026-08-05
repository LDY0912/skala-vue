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

const displayTemp = computed(() => {
  const rawTemp = props.cityItem.temp

  if (props.useConfigUnit && unit.value === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }

  return rawTemp
})

const displayUnitSymbol = computed(() => (props.useConfigUnit ? unitSymbol.value : '°C'))
</script>

<template>
  <div
    class="weather-card"
    :class="{ removable }"
    @click="emit('select-card', `${cityItem.name}이(가) 선택되었습니다.`)"
  >
    <h4>
      <span v-if="cityItem.flag">{{ cityItem.flag }} </span>{{ cityItem.name }}
      <small v-if="cityItem.country">· {{ cityItem.country }}</small>
      ({{ cityItem.status }})
    </h4>
    <p>현재 기온: {{ displayTemp }}{{ displayUnitSymbol }}</p>

    <span v-if="cityItem.temp >= 25" class="badge hot">🔥 더움(25도 이상)</span>
    <span v-else class="badge cool">❄️ 선선함(25도 미만)</span>

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
  min-height: 94px;
  margin: 8px 0 10px;
  padding: 14px 92px 13px 14px;
  border: 1px solid #e1e6ef;
  border-radius: 13px;
  background: linear-gradient(135deg, #fff, #fafbff);
  box-shadow: 0 5px 16px rgb(24 37 63 / 5%);
  cursor: pointer;
  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    transform 0.18s;
}

.weather-card:hover {
  border-color: #c6c8f2;
  box-shadow: 0 10px 22px rgb(69 70 198 / 10%);
  transform: translateY(-2px);
}

.weather-card.removable {
  min-height: 105px;
}

h4,
p {
  margin: 0;
  color: #34435a;
  font-size: 13px;
  line-height: 1.55;
}

h4 small {
  color: #8793a3;
  font-size: 11px;
}

.badge {
  display: inline-block;
  margin-top: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 11px;
  line-height: 1.65;
}

.hot {
  background: linear-gradient(135deg, #ff7575, #ee5667);
}

.cool {
  background: linear-gradient(135deg, #45bfe8, #4e8ee7);
}

.btn-detail {
  position: absolute;
  top: 13px;
  right: 11px;
  min-width: 68px;
  height: 31px;
  padding: 3px 9px;
  border: 1px solid #d7dceb;
  border-radius: 8px;
  background: #fff;
  color: #4f50c8;
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.btn-detail:hover {
  border-color: #bfc1ee;
  background: #f1f1ff;
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
    padding-right: 88px;
  }
}
</style>
