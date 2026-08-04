<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LabAuthPanel from '../components/lab/LabAuthPanel.vue'
import LabCrudPanel from '../components/lab/LabCrudPanel.vue'

const route = useRoute()
const router = useRouter()
const activeTab = computed(() => route.query.tab === 'auth' ? 'auth' : 'api')

function selectTab(tab) {
  router.replace({ path: '/labs', query: { tab } })
}
</script>

<template>
  <main class="integration-lab">
    <header class="lab-hero">
      <span>NEW PRACTICE · VUE 3</span>
      <h1>🧪 API·인증 통합 실습</h1>
      <p>Axios REST CRUD와 Pinia JWT 인증 흐름을 한 화면에서 직접 실행해 볼 수 있습니다.</p>
    </header>

    <section class="feature-summary">
      <article><b>01 · Mock REST API</b><strong>상품·게시글 CRUD</strong><p>GET 조회·검색, POST 등록, PATCH 수정, DELETE 삭제와 로딩 상태를 실습합니다.</p></article>
      <article><b>02 · Pinia JWT</b><strong>로그인·토큰·보호 API</strong><p>HMAC 서명 JWT, 세션 유지, Bearer 인터셉터와 인증 상태 관리를 확인합니다.</p></article>
    </section>

    <nav class="main-tabs" aria-label="통합 실습 기능 선택">
      <button :class="{ active: activeTab === 'api' }" @click="selectTab('api')">📦 Mock API CRUD</button>
      <button :class="{ active: activeTab === 'auth' }" @click="selectTab('auth')">🔐 Pinia JWT 로그인</button>
    </nav>

    <LabCrudPanel v-if="activeTab === 'api'" />
    <LabAuthPanel v-else />
  </main>
</template>

<style scoped>
.integration-lab { min-width: 0; }
.lab-hero { margin-bottom: 14px; padding: 24px; border-radius: 15px; background: linear-gradient(135deg, #312d69, #156f96); color: #fff; box-shadow: 0 8px 24px rgb(32 50 92 / 18%); }.lab-hero span { color: #aee6fb; font-size: 10px; font-weight: 800; letter-spacing: .08em; }.lab-hero h1, .lab-hero p { margin: 0; }.lab-hero h1 { font-size: 27px; font-weight: 850; }.lab-hero p { color: #d8eff8; font-size: 12px; }
.feature-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }.feature-summary article { padding: 13px 15px; border: 1px solid #dce5eb; border-radius: 10px; background: #fff; }.feature-summary b, .feature-summary strong { display: block; }.feature-summary b { color: #1688b9; font-size: 9px; }.feature-summary strong { color: #28475c; font-size: 14px; }.feature-summary p { margin: 3px 0 0; color: #6c7f8c; font-size: 10px; }
.main-tabs { display: flex; gap: 6px; margin-bottom: 14px; padding: 5px; border: 1px solid #dce4e9; border-radius: 11px; background: #edf2f5; }.main-tabs button { flex: 1; padding: 10px; border: 0; border-radius: 8px; background: transparent; color: #647986; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }.main-tabs button.active { background: #fff; color: #166f9c; box-shadow: 0 2px 8px rgb(30 55 75 / 11%); }
@media (max-width: 600px) { .feature-summary { grid-template-columns: 1fr; }.lab-hero h1 { font-size: 22px; } }
</style>
