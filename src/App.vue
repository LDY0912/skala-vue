<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="site-brand" to="/" aria-label="SKALA 대시보드 홈">
        <span class="brand-mark">S</span>
        <span class="brand-copy">
          <strong>SKALA</strong>
          <small>Vue Playground</small>
        </span>
      </RouterLink>

      <!-- RouterLink는 새로고침 없이 각 기능 화면으로 이동한다. -->
      <nav aria-label="화면 전환 메뉴">
        <RouterLink to="/">
          <span><strong>세계 날씨</strong><small>OpenWeather</small></span>
        </RouterLink>
        <RouterLink to="/valorant">
          <span><strong>발로란트</strong><small>대회 일정</small></span>
        </RouterLink>
        <RouterLink to="/escape-room">
          <span><strong>방탈출</strong><small>테마 찾기</small></span>
        </RouterLink>
      </nav>
    </header>

    <div class="page-stage" :class="{ wide: route.meta.wide }">
      <RouterView />
    </div>

    <footer class="site-footer">
      <span>SKALA Vue Playground</span>
      <small>Vue 3 · Pinia · Vue Router · REST API</small>
    </footer>
  </div>
</template>

<style>
@import './assets/base.css';

body {
  min-width: 320px;
}

#app {
  width: 100%;
  margin: 0 auto;
  padding: 22px clamp(14px, 3vw, 32px) 42px;
  color: var(--ink-800);
  font-weight: normal;
}

.site-shell {
  min-width: 0;
  max-width: 1180px;
  margin: 0 auto;
}

.page-stage {
  max-width: 760px;
  margin: 0 auto;
  animation: page-enter 0.35s ease both;
}

.page-stage.wide {
  max-width: 1180px;
}

.site-header {
  position: sticky;
  z-index: 20;
  top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
  padding: 10px 12px 10px 14px;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 20px;
  background: rgb(255 255 255 / 78%);
  box-shadow:
    0 10px 32px rgb(31 45 80 / 9%),
    inset 0 0 0 1px rgb(226 232 244 / 55%);
  backdrop-filter: blur(18px) saturate(155%);
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  color: #fff;
  background: linear-gradient(145deg, #7374ef, #4647c7);
  box-shadow: 0 7px 16px rgb(80 81 205 / 28%);
  font-size: 18px;
  font-weight: 900;
}

.brand-copy {
  display: grid;
  line-height: 1.15;
}

.brand-copy strong {
  color: var(--ink-950);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.brand-copy small {
  color: var(--ink-400);
  font-size: 9px;
  font-weight: 700;
}

.site-header nav {
  display: flex;
  align-items: center;
  gap: 5px;
}

.site-header nav a {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 46px;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--ink-600);
  text-decoration: none;
}

.site-header nav a > span:first-child {
  font-size: 16px;
  filter: grayscale(0.25);
}

.site-header nav a > span:last-child {
  display: grid;
  line-height: 1.15;
}

.site-header nav strong {
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.site-header nav small {
  margin-top: 2px;
  color: #9aa4b3;
  font-size: 8px;
  font-weight: 650;
  white-space: nowrap;
}

.site-header nav a:hover {
  border-color: #e7e8fb;
  color: var(--primary);
  background: #f7f7ff;
  transform: translateY(-1px);
}

.site-header nav a.router-link-exact-active {
  border-color: #e1e1fb;
  color: var(--primary-dark);
  background: var(--primary-soft);
  box-shadow: inset 0 0 0 1px rgb(91 92 226 / 4%);
}

.site-header nav a.router-link-exact-active small {
  color: #7778cc;
}

.site-footer {
  display: flex;
  justify-content: space-between;
  max-width: 1180px;
  margin: 52px auto 0;
  padding: 18px 4px 0;
  border-top: 1px solid rgb(210 218 232 / 70%);
  color: var(--ink-400);
  font-size: 10px;
}

.site-footer span {
  color: var(--ink-600);
  font-weight: 800;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(7px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 760px) {
  #app {
    padding: 12px 12px 34px;
  }

  .site-header {
    position: relative;
    top: 0;
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 24px;
    border-radius: 17px;
  }

  .site-brand {
    padding: 2px;
  }

  .site-header nav {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
  }

  .site-header nav a {
    justify-content: center;
    min-width: 0;
    padding: 7px 4px;
    text-align: center;
  }

  .site-header nav small {
    display: none;
  }

  .site-header nav strong {
    overflow: hidden;
    font-size: 10px;
    text-overflow: ellipsis;
  }

  .site-footer {
    align-items: center;
    flex-direction: column;
    gap: 3px;
    margin-top: 36px;
    text-align: center;
  }
}
</style>
