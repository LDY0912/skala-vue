<template>
  <div class="base-dashboard-card">
    <slot></slot>
  </div>
</template>
<style scoped>
.base-dashboard-card {
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid #e3e8ed;
  border-radius: 7px;
  background: #f7f9fa;
}

:deep(h3) {
  margin: 0 0 6px;
  color: #315675;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}
</style>
