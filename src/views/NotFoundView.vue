<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <section class="not-found">
    <div class="symbol" aria-hidden="true">☀️❓</div>
    <h2>페이지를 찾을 수 없습니다.</h2>
    <p>요청하신 주소가 존재하지 않거나,<br />아직 개발되지 않았습니다.</p>
    <button type="button" @click="router.push('/')">날씨 메인으로 이동</button>
  </section>
</template>

<style scoped>
.not-found {
  min-height: 395px;
  padding: 68px 28px 50px;
  border: 1px solid #e0e4e7;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 5px 12px rgb(25 46 64 / 17%);
  text-align: center;
}

.symbol {
  margin-bottom: 24px;
  font-size: 62px;
  letter-spacing: 8px;
  line-height: 1;
}

h2 {
  margin: 0 0 18px;
  color: #203c51;
  font-size: 25px;
  font-weight: 800;
}

p {
  margin: 0 0 30px;
  color: #788895;
  font-size: 14px;
  line-height: 1.65;
}

button {
  padding: 11px 25px;
  border: 0;
  border-radius: 22px;
  background: #078af2;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: #0675ce;
}

@media (max-width: 480px) {
  .not-found {
    min-height: 340px;
    padding-top: 54px;
  }

  .symbol {
    font-size: 52px;
  }

  h2 {
    font-size: 21px;
  }
}
</style>
