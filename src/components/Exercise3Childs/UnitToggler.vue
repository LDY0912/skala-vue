<script setup>
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../../stores/configStore.js'

const configStore = useConfigStore()
const { unit, unitSymbol } = storeToRefs(configStore)
const { toggleUnit } = configStore
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
  gap: 8px;
  color: #315675;
  font-size: 13px;
  white-space: nowrap;
}

button {
  padding: 6px 9px;
  border: 0;
  border-radius: 4px;
  background: #315675;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: #203e57;
}
</style>
