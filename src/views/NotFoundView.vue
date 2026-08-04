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
  <section class="not-found">
    <div class="symbol" aria-hidden="true">☀️❓</div>
    <h2>페이지를 찾을 수 없습니다.</h2>
    <p>요청하신 주소가 존재하지 않거나,<br />아직 개발되지 않았습니다.</p>
    <button type="button" @click="router.push(homePath)">날씨 메인으로 이동</button>
  </section>
</template>

<style scoped>
.not-found {
  min-height: 395px;
  padding: 68px 28px 50px;
  border: 1px solid #e1e5ee;
  border-radius: 22px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 16px 40px rgb(24 37 63 / 10%);
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
  color: #28374e;
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
  border: 1px solid #5051ca;
  border-radius: 11px;
  background: linear-gradient(135deg, #6869e3, #5051ca);
  color: #fff;
  box-shadow: 0 7px 16px rgb(80 81 202 / 20%);
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

button:hover,
button:focus-visible {
  background: linear-gradient(135deg, #5d5ed8, #4445b8);
  transform: translateY(-1px);
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
