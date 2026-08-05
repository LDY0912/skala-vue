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
    <h3>도시 검색</h3>
    <input
      type="text"
      :value="currentQuery"
      @input="$emit('update-query', $event.target.value)"
      :placeholder="placeholder"
    />
    <p>검색 중인 도시: {{ currentQuery }}</p>
  </div>
</template>

<style scoped>
.search-section h3 {
  margin: 0 0 7px;
  color: #27364d;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.5;
}
/*
.search-section h3::before {
  content: '🔍';
  margin-right: 8px;
} */

input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 9px 13px;
  border: 1px solid #dce2ec;
  border-radius: 11px;
  background: #f9faff;
  color: #27364d;
  font: inherit;
  font-size: 13px;
  outline: none;
  transition: 0.18s ease;
}

input:focus {
  border-color: #7576e6;
  background: #fff;
  box-shadow: 0 0 0 3px rgb(91 92 226 / 12%);
}

p {
  margin: 6px 2px 0;
  color: #8a96a6;
  font-size: 11px;
  line-height: 1.55;
}
</style>
