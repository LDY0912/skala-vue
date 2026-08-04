<script setup>
import { useRouter } from 'vue-router'

defineProps({
  homePath: {
    type: String,
    default: '/',
  },
})

const router = useRouter()
</script>

<template>
  <section class="about-view">
    <h2>ℹ️ 서비스 소개</h2>

    <div class="about-content">
      <p>본 앱은 Vue 3 및 Vue Router 4 기반 제작된 실습용 기상 관측 대시보드 시스템입니다.</p>
      <ul>
        <li><code>components/Exercise3Childs/</code>의 공통 부품 재사용</li>
        <li>클라이언트 사이드 라우팅을 통한 새로고침 없는 화면 전환</li>
        <li>URL 쿼리 스트링 매핑을 활용한 검색 상태 동기화</li>
      </ul>
    </div>

    <button type="button" @click="router.push(homePath)">대시보드 홈으로 이동</button>
  </section>
</template>

<style scoped>
.about-view {
  overflow: hidden;
  padding: 20px;
  border: 1px solid #e2e6ef;
  border-radius: 15px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 8px 24px rgb(24 37 63 / 6%);
  overflow: hidden;
}

h2 {
  margin: 0;
  padding: 0 2px 12px;
  border-bottom: 1px solid #e3e7ef;
  color: #2c3b52;
  font-size: 17px;
  font-weight: 850;
}

.about-content {
  margin: 14px 0;
  padding: 16px;
  border: 1px solid #e7eaf1;
  border-radius: 11px;
  background: #f8f9fd;
  color: #5d6b80;
  font-size: 12px;
}

p {
  margin: 0 0 8px;
}

ul {
  margin: 0;
  padding-left: 20px;
}

li + li {
  margin-top: 5px;
}

code {
  padding: 1px 4px;
  border-radius: 5px;
  background: #efefff;
  color: #5556c8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

button {
  display: block;
  width: 100%;
  margin: 0;
  padding: 10px 14px;
  border: 1px solid #5152ca;
  border-radius: 9px;
  background: linear-gradient(135deg, #6667e2, #5051cc);
  color: #fff;
  box-shadow: 0 6px 14px rgb(80 81 204 / 16%);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: linear-gradient(135deg, #5a5bd7, #4445b9);
  transform: translateY(-1px);
}
</style>
