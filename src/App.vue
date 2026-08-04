<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="site-shell" :class="{ wide: route.meta.wide }">
    <header class="site-header">
      <RouterLink class="site-brand" to="/">🌦️ SKALA 날씨 대시보드</RouterLink>

      <nav aria-label="화면 전환 메뉴">
        <RouterLink to="/">최종과제</RouterLink>
        <RouterLink to="/exercises">이전 과제 1~5</RouterLink>
        <RouterLink to="/labs">API·JWT 실습</RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style>
@import './assets/base.css';

body {
  min-width: 320px;
  background: #f3f7fa;
}

button,
input {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

#app {
  width: min(100%, 1080px);
  margin: 0 auto;
  padding: 22px 22px 56px;
  color: #284966;
  font-weight: normal;
}

.site-shell {
  min-width: 0;
  max-width: 676px;
  margin: 0 auto;
}

.site-shell.wide {
  max-width: 1036px;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 36px;
  padding: 14px 16px;
  border: 1px solid #dce7ee;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 5px 18px rgb(24 59 91 / 8%);
}

.site-brand {
  color: #183b5b;
  font-size: 16px;
  font-weight: 800;
  text-decoration: none;
}

.site-header nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.site-header nav a {
  padding: 7px 11px;
  border-radius: 7px;
  color: #667985;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.site-header nav a:hover {
  background: #eff8fd;
  color: #078fce;
}

.site-header nav a.router-link-exact-active {
  background: #08a0e5;
  color: #fff;
}

@media (max-width: 600px) {
  #app {
    padding: 16px 14px 42px;
  }

  .site-header {
    align-items: stretch;
    flex-direction: column;
    margin-bottom: 28px;
  }

  .site-header nav a {
    flex: 1;
    text-align: center;
  }
}
</style>
