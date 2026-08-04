<script setup>
import { computed, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthLabStore } from '../../stores/authLabStore.js'

const authStore = useAuthLabStore()
const route = useRoute()
const router = useRouter()
const { accessToken, authorizationHeader, errorMessage, isLoading, isLoggedIn, protectedResult, tokenPayload, user } = storeToRefs(authStore)

const credentials = reactive({ email: 'student@skala.com', password: '1234' })
const formattedPayload = computed(() => tokenPayload.value ? JSON.stringify(tokenPayload.value, null, 2) : '')

function useAccount(type) {
  Object.assign(credentials, type === 'admin'
    ? { email: 'admin@skala.com', password: 'admin1234' }
    : { email: 'student@skala.com', password: '1234' })
}

async function login() {
  const succeeded = await authStore.login(credentials.email, credentials.password)
  if (succeeded && typeof route.query.redirect === 'string') await router.push(route.query.redirect)
}

function logout() {
  authStore.logout()
  if (route.meta.requiresLabAuth) router.replace({ path: '/labs', query: { tab: 'auth' } })
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value))
}

onMounted(() => {
  if (isLoggedIn.value) authStore.validateSession()
})
</script>

<template>
  <section class="auth-lab">
    <div v-if="!isLoggedIn" class="auth-grid login-grid">
      <article class="flow-panel">
        <span class="eyebrow">PINIA · JWT · AXIOS</span>
        <h2>JWT 로그인 처리 흐름</h2>
        <p>인증정보를 POST하고, Mock API가 서명한 토큰을 Pinia와 세션 저장소에서 관리합니다.</p>
        <ol>
          <li><b>1</b><div><strong>인증정보 POST</strong><small>이메일과 비밀번호 전송</small></div></li>
          <li><b>2</b><div><strong>서버 인증·JWT 생성</strong><small>HMAC SHA-256으로 서명</small></div></li>
          <li><b>3</b><div><strong>토큰·프로필 저장</strong><small>Pinia + sessionStorage</small></div></li>
          <li><b>4</b><div><strong>보호 API 접근</strong><small>Bearer Token 자동 첨부</small></div></li>
        </ol>
      </article>

      <form class="login-card" @submit.prevent="login">
        <div class="card-heading"><span class="method post">POST</span><div><h2>Mock 로그인</h2><code>/api/auth/login</code></div></div>
        <div class="quick-accounts"><button type="button" @click="useAccount('student')">수강생 계정</button><button type="button" @click="useAccount('admin')">관리자 계정</button></div>
        <label>이메일<input v-model.trim="credentials.email" type="email" required /></label>
        <label>비밀번호<input v-model="credentials.password" type="password" required /></label>
        <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>
        <button class="primary wide" :disabled="isLoading">{{ isLoading ? '인증 요청 중...' : 'JWT 로그인' }}</button>
        <div class="credential-note"><strong>테스트 계정</strong><code>student@skala.com / 1234</code></div>
      </form>
    </div>

    <div v-else>
      <header class="auth-success">
        <div><span>✓ 인증 성공</span><h2>{{ user.name }}님, 반갑습니다.</h2><p>Pinia Store에 로그인 상태가 저장되어 있습니다.</p></div>
        <div class="success-actions"><RouterLink to="/labs/protected">보호 경로 열기</RouterLink><button @click="logout">로그아웃</button></div>
      </header>

      <div class="auth-grid dashboard-grid">
        <article class="info-card">
          <div class="card-heading"><span class="method get">GET</span><div><h3>사용자 프로필</h3><code>/api/auth/me</code></div></div>
          <dl>
            <div><dt>이름</dt><dd>{{ user.name }}</dd></div><div><dt>이메일</dt><dd>{{ user.email }}</dd></div><div><dt>권한</dt><dd><b>{{ user.role }}</b></dd></div><div><dt>소속</dt><dd>{{ user.department }}</dd></div>
          </dl>
        </article>

        <article class="info-card">
          <div class="card-heading"><span class="jwt">JWT</span><div><h3>Access Token</h3><code>15분 유효</code></div></div>
          <label class="code-label">Raw Token</label><pre>{{ accessToken }}</pre>
          <label class="code-label">Decoded Payload</label><pre>{{ formattedPayload }}</pre>
          <p class="security">JWT Payload는 암호화되지 않으므로 비밀번호 같은 비밀정보를 넣으면 안 됩니다.</p>
        </article>

        <article class="info-card protected-card">
          <div class="card-heading"><span class="method get">GET</span><div><h3>보호 API 호출</h3><code>/api/auth/protected-message</code></div></div>
          <p>Axios 요청 인터셉터가 아래 Bearer Token을 자동으로 헤더에 추가합니다.</p>
          <label class="code-label">Authorization</label><pre>{{ authorizationHeader }}</pre>
          <button class="primary" :disabled="isLoading" @click="authStore.requestProtectedMessage">{{ isLoading ? '요청 중...' : '보호 API 요청하기' }}</button>
          <div v-if="protectedResult" class="protected-result"><strong>{{ protectedResult.message }}</strong><span>요청 권한: {{ protectedResult.role }}</span><time>{{ formatDate(protectedResult.requestedAt) }}</time></div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-lab { color: #263e52; }
.auth-grid { display: grid; gap: 14px; }
.login-grid { grid-template-columns: 1.1fr .9fr; }
.flow-panel, .login-card, .info-card { padding: 20px; border: 1px solid #dfe6ec; border-radius: 13px; background: #fff; box-shadow: 0 5px 18px rgb(25 53 75 / 7%); }
.flow-panel { background: linear-gradient(145deg, #173f60, #176e96); color: #fff; }
.eyebrow { color: #a8e3fb; font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.flow-panel h2 { margin: 8px 0 5px; font-size: 22px; font-weight: 850; }
.flow-panel > p { margin: 0; color: #d4eaf4; font-size: 12px; }
.flow-panel ol { display: grid; gap: 8px; margin: 18px 0 0; padding: 0; list-style: none; }
.flow-panel li { display: flex; align-items: center; gap: 10px; padding: 9px; border-radius: 8px; background: rgb(255 255 255 / 9%); }
.flow-panel li b { display: grid; width: 25px; height: 25px; place-items: center; border-radius: 50%; background: #49bde9; }
.flow-panel li strong, .flow-panel li small { display: block; }
.flow-panel li strong { font-size: 12px; }.flow-panel li small { color: #c7e2ed; font-size: 10px; }
.card-heading { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }.card-heading h2, .card-heading h3 { margin: 0; font-weight: 850; }.card-heading h2 { font-size: 18px; }.card-heading h3 { font-size: 15px; }.card-heading code { color: #6c7f8d; font-size: 10px; }
.method, .jwt { padding: 3px 6px; border-radius: 4px; color: #fff; font-size: 10px; font-weight: 850; }.method.post { background: #15a56b; }.method.get { background: #168bc2; }.jwt { background: #7048d6; }
.quick-accounts { display: flex; gap: 5px; margin-bottom: 13px; }.quick-accounts button { flex: 1; padding: 6px; border: 1px solid #cbd6dd; border-radius: 6px; background: #f6f9fb; color: #476273; cursor: pointer; }
.login-card > label { display: grid; gap: 4px; margin-bottom: 11px; color: #526a7a; font-size: 11px; font-weight: 750; }
input { padding: 9px; border: 1px solid #c9d4db; border-radius: 6px; font: inherit; }
.primary { padding: 8px 11px; border: 1px solid #148dc5; border-radius: 6px; background: #159bd7; color: #fff; font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }.primary:disabled { opacity: .6; }.primary.wide { width: 100%; }
.error { padding: 8px; border-radius: 6px; background: #fff0f0; color: #b54141; font-size: 11px; }
.credential-note { display: grid; gap: 3px; margin-top: 12px; padding: 9px; border-radius: 7px; background: #f2f5f7; text-align: center; }.credential-note strong { font-size: 10px; }.credential-note code { font-size: 11px; }
.auth-success { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 14px; padding: 18px 20px; border-radius: 13px; background: linear-gradient(135deg, #126e79, #179c85); color: #fff; }.auth-success span { font-size: 10px; font-weight: 800; }.auth-success h2, .auth-success p { margin: 0; }.auth-success h2 { font-size: 21px; font-weight: 850; }.auth-success p { color: #d4f4ed; font-size: 11px; }.success-actions { display: flex; gap: 6px; }.success-actions a, .success-actions button { padding: 7px 9px; border: 1px solid rgb(255 255 255 / 55%); border-radius: 6px; background: transparent; color: #fff; font: inherit; font-size: 10px; font-weight: 750; text-decoration: none; cursor: pointer; }
.dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.protected-card { grid-column: 1 / -1; }
dl { margin: 0; }dl > div { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #edf1f3; font-size: 11px; }dt { color: #72838e; }dd { margin: 0; font-weight: 700; }dd b { padding: 2px 5px; border-radius: 4px; background: #e9e2fc; color: #6143b0; font-size: 9px; }
.code-label { display: block; margin: 8px 0 3px; color: #71828e; font-size: 9px; font-weight: 800; text-transform: uppercase; }pre { overflow: auto; max-height: 150px; margin: 0; padding: 9px; border-radius: 6px; background: #172a3a; color: #bfe7d5; font-size: 9px; white-space: pre-wrap; word-break: break-all; }
.security { margin: 8px 0 0; color: #a36b20; font-size: 10px; }.protected-card > p { color: #607481; font-size: 11px; }.protected-result { display: grid; gap: 3px; margin-top: 10px; padding: 10px; border-radius: 7px; background: #eaf8ef; color: #28734a; font-size: 10px; }
@media (max-width: 760px) { .login-grid, .dashboard-grid { grid-template-columns: 1fr; }.protected-card { grid-column: auto; }.auth-success { align-items: flex-start; flex-direction: column; } }
</style>
