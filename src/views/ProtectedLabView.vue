<script setup>
import LabAuthPanel from '../components/lab/LabAuthPanel.vue'
</script>

<template>
  <main>
    <header class="protected-heading"><RouterLink to="/labs?tab=auth">← 통합 실습으로</RouterLink><div><span>ROUTER GUARD PASSED</span><h1>🔒 JWT 보호 화면</h1><p>로그인된 사용자만 접근할 수 있는 Vue Router 보호 경로입니다.</p></div></header>
    <LabAuthPanel />
  </main>
</template>

<style scoped>
.protected-heading { display: flex; gap: 15px; margin-bottom: 14px; padding: 19px; border-radius: 13px; background: #203d54; color: #fff; }.protected-heading a { align-self: flex-start; color: #a9def2; font-size: 10px; text-decoration: none; }.protected-heading span { color: #87d8b5; font-size: 9px; font-weight: 800; letter-spacing: .08em; }.protected-heading h1, .protected-heading p { margin: 0; }.protected-heading h1 { font-size: 22px; font-weight: 850; }.protected-heading p { color: #cfdee7; font-size: 11px; }
@media (max-width: 560px) { .protected-heading { flex-direction: column; } }
</style>
