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
.lab-hero { position: relative; overflow: hidden; margin-bottom: 16px; padding: 30px; border-radius: 22px; background: radial-gradient(circle at 88% 10%, rgb(72 222 233 / 24%), transparent 29%), linear-gradient(135deg, #302f72, #5263bb 58%, #168ca7); color: #fff; box-shadow: 0 17px 40px rgb(47 53 123 / 22%); }
.lab-hero span { color: #bfeef6; font-size: 10px; font-weight: 850; letter-spacing: .12em; }
.lab-hero h1, .lab-hero p { margin: 0; }
.lab-hero h1 { font-size: 29px; font-weight: 900; letter-spacing: -.04em; }
.lab-hero p { margin-top: 5px; color: #dceef6; font-size: 12px; }
.feature-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.feature-summary article { padding: 17px 18px; border: 1px solid #e1e5ee; border-radius: 14px; background: rgb(255 255 255 / 90%); box-shadow: 0 7px 22px rgb(24 37 63 / 6%); }
.feature-summary b, .feature-summary strong { display: block; }
.feature-summary b { color: #5b5ce2; font-size: 9px; font-weight: 900; letter-spacing: .04em; }
.feature-summary strong { margin-top: 2px; color: #2b3a51; font-size: 15px; font-weight: 850; }
.feature-summary p { margin: 4px 0 0; color: #718096; font-size: 10px; }
.main-tabs { display: flex; gap: 6px; margin-bottom: 16px; padding: 5px; border: 1px solid #dfe3ec; border-radius: 13px; background: #eceff5; }
.main-tabs button { flex: 1; padding: 11px; border: 0; border-radius: 9px; background: transparent; color: #69778b; font: inherit; font-size: 11px; font-weight: 850; cursor: pointer; }
.main-tabs button:hover { color: #4d4ec4; }
.main-tabs button.active { color: #4d4ec4; background: #fff; box-shadow: 0 4px 12px rgb(30 43 71 / 10%); }
@media (max-width: 600px) { .feature-summary { grid-template-columns: 1fr; }.lab-hero { padding: 24px 21px; }.lab-hero h1 { font-size: 23px; } }
</style>
