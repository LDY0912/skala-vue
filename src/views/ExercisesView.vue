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
  gap: 32px;
}

.collection-heading {
  position: relative;
  overflow: hidden;
  padding: 26px 28px;
  border-radius: 22px;
  background:
    radial-gradient(circle at 90% 10%, rgb(108 228 255 / 22%), transparent 30%),
    linear-gradient(135deg, #313577, #496fc7 60%, #17a3bd);
  color: #fff;
  box-shadow: 0 16px 38px rgb(46 64 134 / 20%);
}

.collection-heading p,
.collection-heading h1 {
  margin: 0;
}

.collection-heading p {
  margin-bottom: 2px;
  color: #cceeff;
  font-size: 11px;
  font-weight: 700;
}

.collection-heading h1 {
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.router-exercise,
.store-exercise {
  min-width: 0;
}

.exercise-header > h1 {
  margin: 0;
  padding: 0 4px 13px;
  border-bottom: 1px solid #e1e5ed;
  color: #27364d;
  font-size: 21px;
  font-weight: 850;
  line-height: 1.4;
}

.navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0;
  padding: 11px 13px;
  border: 1px solid #e3e7ef;
  border-radius: 13px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 7px 20px rgb(24 37 63 / 6%);
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
  padding: 7px 10px;
  border-radius: 8px;
  color: #6f7c8e;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.4;
  text-decoration: none;
}

.exercise-header nav a:hover,
.exercise-header nav a.router-link-exact-active {
  color: #4f50c8;
  background: #efefff;
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
