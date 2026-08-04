<script setup>
// 1. 상위로 입력 텍스트를 전달할 커스텀 이벤트 등록 (매크로)
defineEmits(['update-query'])

// 2. 상위로부터 현재 검색 상태 값을 수신 (한글 동기화 상태 유지용)
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
  margin: 0 0 1px;
  color: #315675;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}

.search-section h3::before {
  content: '🔍';
  margin-right: 8px;
}

input {
  display: block;
  width: calc(100% - 44px);
  height: 28px;
  padding: 3px 8px;
  border: 1px solid #8b8b8b;
  background: #fff;
  color: #34495e;
  font: inherit;
  font-size: 13px;
  outline: none;
}

input:focus {
  border-color: #438ec5;
  box-shadow: 0 0 0 1px #438ec5;
}

p {
  margin: 2px 0 0;
  color: #315675;
  font-size: 13px;
  line-height: 1.55;
}

@media (max-width: 480px) {
  input {
    width: 100%;
  }
}
</style>
