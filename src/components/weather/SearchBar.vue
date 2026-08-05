<script setup>
// 부모가 내려준 Props를 표시하고, 입력 변경은 Emits로 부모에게 전달한다.
defineEmits(['update-query'])

defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '도시 이름을 입력해 주세요.(서울, 수원, 부산)',
  },
})
</script>

<template>
  <div class="search-section">
    <div class="search-heading">
      <span aria-hidden="true">⌕</span>
      <div>
        <h3>도시 검색</h3>
        <small>전 세계 30개 주요 도시의 실시간 날씨를 찾아보세요.</small>
      </div>
    </div>
    <label class="search-input">
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        :value="currentQuery"
        @input="$emit('update-query', $event.target.value)"
        :placeholder="placeholder"
      />
      <kbd>SEARCH</kbd>
    </label>
    <p v-if="currentQuery">‘{{ currentQuery }}’ 검색 결과를 확인하고 있어요.</p>
    <p v-else>도시명, 국가명 또는 국가 코드를 입력하세요.</p>
  </div>
</template>

<style scoped>
.search-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.search-heading > span {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  color: #fff;
  background: linear-gradient(145deg, #7273e5, #4f51c8);
  box-shadow: 0 7px 16px rgb(73 75 190 / 21%);
  font-size: 20px;
  font-weight: 850;
}

.search-section h3 {
  margin: 0;
  color: #27364d;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.25;
}

.search-heading small {
  display: block;
  margin-top: 2px;
  color: #8a96a6;
  font-size: 9px;
}

.search-input {
  display: flex;
  width: 100%;
  height: 50px;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  border: 1px solid #dce1ec;
  border-radius: 13px;
  background:
    radial-gradient(circle at 100% 0%, rgb(114 116 229 / 8%), transparent 38%),
    #f9faff;
  transition: 0.18s ease;
}

.search-input > span {
  color: #6567d8;
  font-size: 19px;
  font-weight: 900;
}

input {
  min-width: 0;
  flex: 1;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #27364d;
  font: inherit;
  font-size: 13px;
}

.search-input:focus-within {
  border-color: #7576e6;
  background: #fff;
  box-shadow:
    0 0 0 3px rgb(91 92 226 / 11%),
    0 9px 22px rgb(72 75 159 / 8%);
}

kbd {
  padding: 3px 6px;
  border: 1px solid #dde1eb;
  border-radius: 6px;
  color: #9099a9;
  background: #fff;
  box-shadow: 0 2px 4px rgb(32 43 68 / 5%);
  font-family: inherit;
  font-size: 7px;
  font-weight: 850;
  letter-spacing: 0.08em;
}

p {
  margin: 6px 2px 0;
  color: #8a96a6;
  font-size: 11px;
  line-height: 1.55;
}
</style>
