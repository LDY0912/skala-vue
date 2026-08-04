<script setup>
import Exercise1 from './components/Exercise1.vue'
import Exercise2 from './components/Exercise2.vue'
import Exercise3 from './components/Exercise3.vue'
</script>

<template>
  <main class="exercises-layout">
    <Exercise1 />
    <Exercise2 />
    <Exercise3 />
  </main>
</template>

<style>
@import './assets/base.css';

#app {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: 16px 22px 56px;
  font-weight: normal;
}

.exercises-layout {
  display: flex;
  flex-direction: column;
  gap: 42px;
}

body {
  min-width: 320px;
  background: #ffffff;
}

@media (max-width: 480px) {
  #app {
    padding-inline: 14px;
  }
}
</style>
