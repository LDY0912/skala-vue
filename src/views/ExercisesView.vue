<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Exercise1 from '../components/Exercise1.vue'
import Exercise2 from '../components/Exercise2.vue'
import Exercise3 from '../components/Exercise3.vue'
import UnitToggler from '../components/Exercise3Childs/UnitToggler.vue'
</script>

<template>
  <main class="exercises-layout">
    <div class="collection-heading">
      <p>Vue 기초부터 Router와 Pinia까지</p>
      <h1>📚 이전 과제 1~5</h1>
    </div>

    <Exercise1 />
    <Exercise2 />
    <Exercise3 />

    <section class="router-exercise" aria-labelledby="router-exercise-title">
      <header class="exercise-header">
        <h1 id="router-exercise-title">🌤️ 과제 4: 라우터적용</h1>

        <div class="navigation-bar navigation-bar--center">
          <nav aria-label="과제 4 주요 메뉴">
            <RouterLink to="/exercises">🌦️ 날씨 대시보드</RouterLink>
            <span aria-hidden="true"></span>
            <RouterLink to="/exercises/about">ℹ️ 서비스 소개</RouterLink>
          </nav>
        </div>
      </header>

      <RouterView name="exercise4" />
    </section>

    <section class="store-exercise" aria-labelledby="store-exercise-title">
      <header class="exercise-header">
        <h1 id="store-exercise-title">🌤️ 과제 5: 스토어적용</h1>

        <div class="navigation-bar">
          <nav aria-label="과제 5 주요 메뉴">
            <RouterLink to="/exercises">🌦️ 날씨 대시보드</RouterLink>
            <span aria-hidden="true"></span>
            <RouterLink to="/exercises/about">ℹ️ 서비스 소개</RouterLink>
          </nav>

          <UnitToggler />
        </div>
      </header>

      <RouterView name="exercise5" />
    </section>
  </main>
</template>

<style scoped>
.exercises-layout {
  display: flex;
  flex-direction: column;
  gap: 42px;
}

.collection-heading {
  padding: 18px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #173f5f, #087fb4);
  color: #fff;
}

.collection-heading p,
.collection-heading h1 {
  margin: 0;
}

.collection-heading p {
  margin-bottom: 2px;
  color: #c8eaf8;
  font-size: 12px;
}

.collection-heading h1 {
  font-size: 24px;
  font-weight: 800;
}

.router-exercise,
.store-exercise {
  min-width: 0;
}

.exercise-header > h1 {
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

.exercise-header nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.exercise-header nav span {
  width: 1px;
  height: 16px;
  background: #dde2e6;
}

.exercise-header nav a {
  padding: 0 3px 5px;
  border-bottom: 2px solid transparent;
  color: #75828c;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
}

.exercise-header nav a:hover,
.exercise-header nav a.router-link-exact-active {
  border-bottom-color: #08a4ee;
  color: #08a4ee;
}

@media (max-width: 520px) {
  .exercise-header > h1 {
    font-size: 20px;
  }

  .navigation-bar {
    align-items: center;
    flex-direction: column;
    gap: 10px;
  }

  .exercise-header nav {
    gap: 9px;
  }

  .exercise-header nav a {
    font-size: 13px;
  }
}
</style>
