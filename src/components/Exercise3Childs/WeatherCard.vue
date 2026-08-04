<script setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useConfigStore } from '../../stores/configStore.js'

// 1. 상위로부터 단방향 주입받을 객체 데이터 규격 검수 (매크로)
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

// 2. 상위로 송신할 두 가지 경로의 커스텀 이벤트 식별자 등록 (매크로)
const emit = defineEmits(['select-card', 'click-detail', 'remove-card'])

const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)

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
    @click="emit('select-card', `${cityItem.name}이 선택되었습니다.`)"
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
  min-height: 82px;
  margin: 6px 0 9px;
  padding: 10px 78px 9px 10px;
  border: 1px solid #d8dfe5;
  border-radius: 5px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(20 50 75 / 7%);
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;
}

.weather-card:hover {
  border-color: #9eb8ca;
  transform: translateY(-1px);
}

.weather-card.removable {
  min-height: 105px;
}

h4,
p {
  margin: 0;
  color: #315675;
  font-size: 13px;
  line-height: 1.55;
}

h4 small {
  color: #728592;
  font-size: 11px;
}

.badge {
  display: inline-block;
  margin-top: 2px;
  padding: 2px 9px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 11px;
  line-height: 1.65;
}

.hot {
  background: #ff6464;
}

.cool {
  background: #42b9ed;
}

.btn-detail {
  position: absolute;
  top: 12px;
  right: 9px;
  min-width: 59px;
  height: 28px;
  padding: 2px 7px;
  border: 1px solid #999;
  background: #f7f7f7;
  color: #284966;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}

.btn-detail:hover {
  background: #eeeeee;
}

.btn-remove {
  position: absolute;
  top: 50px;
  right: 9px;
  min-width: 59px;
  height: 27px;
  padding: 2px 7px;
  border: 1px solid #e29a9a;
  background: #fff6f6;
  color: #c34949;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}

.btn-remove:hover {
  background: #ffe7e7;
}

@media (max-width: 480px) {
  .weather-card {
    padding-right: 72px;
  }
}
</style>
