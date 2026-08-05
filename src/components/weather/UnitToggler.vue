<script setup>
import { storeToRefs } from 'pinia'
import { useWeatherUnitStore } from '../../stores/weatherUnitStore.js'

const weatherUnitStore = useWeatherUnitStore()
const { unit, unitSymbol } = storeToRefs(weatherUnitStore)
const { toggleUnit } = weatherUnitStore
</script>

<template>
  <div class="unit-toggler">
    <span>
      날씨단위:
      {{ unit === 'celsius' ? '섭씨' : '화씨' }}({{ unitSymbol }})
    </span>
    <button type="button" @click="toggleUnit">단위변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #53627a;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

button {
  padding: 7px 11px;
  border: 1px solid #4e4fcd;
  border-radius: 9px;
  background: linear-gradient(135deg, #6768e5, #5051cc);
  color: #fff;
  box-shadow: 0 5px 12px rgb(80 81 204 / 18%);
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: linear-gradient(135deg, #5d5ed9, #4344ba);
  transform: translateY(-1px);
}
</style>
