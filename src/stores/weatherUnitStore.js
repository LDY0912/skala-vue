import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 여러 날씨 화면에서 공유하는 온도 단위를 Pinia Store 한 곳에서 관리한다.
export const useWeatherUnitStore = defineStore('weatherUnit', () => {
  const unit = ref('celsius')

  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '°C' : '°F'
  })

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
  }
})
