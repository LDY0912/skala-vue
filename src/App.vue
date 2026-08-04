<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Exercise1 from './components/Exercise1.vue'
import Exercise2 from './components/Exercise2.vue'
import Exercise3 from './components/Exercise3.vue'
import UnitToggler from './components/Exercise3Childs/UnitToggler.vue'
</script>

<template>
  <main class="exercises-layout">
    <Exercise1 />
    <Exercise2 />
    <Exercise3 />

    <section class="router-exercise" aria-labelledby="router-exercise-title">
      <header class="app-header">
        <h1 id="router-exercise-title">🌤️ 과제 4: 라우터적용</h1>

        <div class="navigation-bar navigation-bar--center">
          <nav aria-label="과제 4 주요 메뉴">
            <RouterLink to="/">🌦️ 날씨 대시보드</RouterLink>
            <span aria-hidden="true"></span>
            <RouterLink to="/about">ℹ️ 서비스 소개</RouterLink>
          </nav>
        </div>
      </header>

      <RouterView name="exercise4" />
    </section>

    <section class="store-exercise" aria-labelledby="store-exercise-title">
      <header class="app-header">
        <h1 id="store-exercise-title">🌤️ 과제 5: 스토어적용</h1>

        <div class="navigation-bar">
          <nav aria-label="과제 5 주요 메뉴">
            <RouterLink to="/">🌦️ 날씨 대시보드</RouterLink>
            <span aria-hidden="true"></span>
            <RouterLink to="/about">ℹ️ 서비스 소개</RouterLink>
          </nav>

          <UnitToggler />
        </div>
      </header>

      <RouterView name="exercise5" />
    </section>
  </main>
</template>

<style>
@import './assets/base.css';

body {
  min-width: 320px;
  background: #f7f9fb;
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
  width: min(100%, 620px);
  margin: 0 auto;
  padding: 24px 22px 56px;
  color: #284966;
  font-weight: normal;
}

.exercises-layout {
  display: flex;
  flex-direction: column;
  gap: 42px;
}

.router-exercise,
.store-exercise {
  min-width: 0;
}

.app-header > h1 {
  margin: 0;
  padding: 0 4px 12px;
  border-bottom: 1px solid #dce3e9;
  color: #183b5b;
  font-size: 22px;
  font-weight: 750;
  line-height: 1.4;
}

.navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 20px 0 18px;
  padding: 14px 12px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgb(24 59 91 / 8%);
}

.navigation-bar--center {
  justify-content: center;
}

.app-header nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.app-header nav span {
  width: 1px;
  height: 16px;
  background: #dde2e6;
}

.app-header nav a {
  padding: 0 3px 5px;
  border-bottom: 2px solid transparent;
  color: #75828c;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
}

.app-header nav a:hover {
  color: #069ee6;
}

.app-header nav a.router-link-exact-active {
  border-bottom-color: #08a4ee;
  color: #08a4ee;
}

@media (max-width: 480px) {
  #app {
    padding: 18px 14px 42px;
  }

  .app-header > h1 {
    font-size: 20px;
  }

  .app-header nav {
    gap: 9px;
  }

  .app-header nav a {
    font-size: 13px;
  }

  .navigation-bar {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
