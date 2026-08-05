<template>
  <div class="base-dashboard-card">
    <slot />
  </div>
</template>
<style scoped>
.base-dashboard-card {
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;
  padding: 21px;
  border: 1px solid rgb(222 227 239 / 88%);
  border-radius: 20px;
  background:
    radial-gradient(circle at 100% 0%, rgb(113 117 231 / 9%), transparent 34%),
    rgb(255 255 255 / 90%);
  box-shadow:
    0 13px 34px rgb(24 37 63 / 8%),
    inset 0 1px 0 rgb(255 255 255 / 80%);
  backdrop-filter: blur(14px);
}

.base-dashboard-card::before {
  position: absolute;
  top: 0;
  right: 20px;
  left: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(104 105 225 / 45%), transparent);
  content: '';
}

:deep(h3) {
  margin: 0 0 10px;
  color: #27364d;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.5;
  letter-spacing: -0.025em;
}
</style>
