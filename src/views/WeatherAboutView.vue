<script setup>
import { useRouter } from 'vue-router'

defineProps({
  showStoreInfo: {
    type: Boolean,
    default: false,
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
        <li v-if="showStoreInfo">Pinia 스토어를 통한 섭씨·화씨 단위 설정 공유</li>
        <li>URL 쿼리 스트링 매핑을 활용한 검색 상태 동기화</li>
      </ul>
    </div>

    <button type="button" @click="router.push('/')"></button>

    <button type="button" @click="router.push('/')">대시보드 홈으로 이동</button>
  </section>
</template>

<style scoped>
.about-view {
  padding: 0 0 14px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgb(24 59 91 / 6%);
  overflow: hidden;
}

h2 {
  margin: 0;
  padding: 0 2px 10px;
  border-bottom: 1px solid #dce3e9;
  color: #315675;
  font-size: 16px;
  font-weight: 600;
}

.about-content {
  margin: 14px 0;
  padding: 13px 14px;
  background: #f7f9fa;
  color: #566875;
  font-size: 13px;
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
  border-radius: 3px;
  background: #fff4dc;
  color: #df731c;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

button {
  display: block;
  width: calc(100% - 4px);
  margin: 0 2px;
  padding: 9px 14px;
  border: 0;
  border-radius: 3px;
  background: #09a0e5;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: #078bc9;
}
</style>
