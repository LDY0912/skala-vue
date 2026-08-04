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
.protected-heading { display: flex; gap: 17px; margin-bottom: 16px; padding: 24px; border-radius: 18px; background: radial-gradient(circle at 90% 10%, rgb(57 214 181 / 18%), transparent 30%), linear-gradient(135deg, #292d63, #344c78); color: #fff; box-shadow: 0 14px 34px rgb(33 44 87 / 18%); }.protected-heading a { align-self: flex-start; padding: 5px 8px; border: 1px solid rgb(255 255 255 / 16%); border-radius: 7px; color: #c5eaf5; font-size: 9px; font-weight: 750; text-decoration: none; }.protected-heading span { color: #8ae4bd; font-size: 9px; font-weight: 850; letter-spacing: .1em; }.protected-heading h1, .protected-heading p { margin: 0; }.protected-heading h1 { font-size: 23px; font-weight: 900; letter-spacing: -.03em; }.protected-heading p { color: #d4e1ec; font-size: 11px; }
@media (max-width: 560px) { .protected-heading { flex-direction: column; } }
</style>
