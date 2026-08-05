import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 각 기능을 독립된 View로 분리하고 URL에 따라 필요한 컴포넌트만 지연 로딩한다.
  routes: [
    {
      path: '/',
      name: 'final-weather-home',
      component: () => import('../views/FinalWeatherView.vue'),
    },
    {
      // 동적 세그먼트로 선택한 도시 ID를 상세 화면에 Props로 전달한다.
      path: '/weather/:cityId',
      name: 'final-weather-detail',
      component: () => import('../views/FinalWeatherDetailView.vue'),
      props: true,
    },
    {
      path: '/compare',
      name: 'weather-compare',
      component: () => import('../views/WeatherCompareView.vue'),
      meta: { wide: true },
    },
    {
      path: '/valorant',
      name: 'valorant-schedule',
      component: () => import('../views/ValorantScheduleView.vue'),
      meta: { wide: true },
    },
    {
      path: '/escape-room',
      name: 'escape-room',
      component: () => import('../views/EscapeRoomView.vue'),
      meta: { wide: true },
    },
    {
      path: '/storm-game',
      name: 'storm-game',
      component: () => import('../views/WeatherLightningGameView.vue'),
      meta: { wide: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
