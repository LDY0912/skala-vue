<template>
  <div class="base-dashboard-card">
    <slot></slot>
  </div>
</template>
<style scoped>
.base-dashboard-card {
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid rgb(224 229 239 / 90%);
  border-radius: 16px;
  background: rgb(255 255 255 / 88%);
  box-shadow: 0 8px 24px rgb(24 37 63 / 6%);
  backdrop-filter: blur(10px);
}

:deep(h3) {
  margin: 0 0 10px;
  color: #27364d;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.5;
}
</style>
