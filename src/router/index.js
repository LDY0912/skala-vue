import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'weather-home',
      components: {
        exercise4: () => import('../views/WeatherHomeView.vue'),
        exercise5: () => import('../views/WeatherHomeView.vue'),
      },
      props: {
        exercise4: false,
        exercise5: { useConfigUnit: true },
      },
    },
    {
      path: '/about',
      name: 'weather-about',
      components: {
        exercise4: () => import('../views/WeatherAboutView.vue'),
        exercise5: () => import('../views/WeatherAboutView.vue'),
      },
      props: {
        exercise4: false,
        exercise5: { showStoreInfo: true },
      },
    },
    {
      path: '/weather/:cityId',
      name: 'weather-detail',
      components: {
        exercise4: () => import('../views/WeatherDetailView.vue'),
        exercise5: () => import('../views/WeatherDetailView.vue'),
      },
      props: {
        exercise4: true,
        exercise5: (route) => ({ cityId: route.params.cityId, useConfigUnit: true }),
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      components: {
        exercise4: () => import('../views/NotFoundView.vue'),
        exercise5: () => import('../views/NotFoundView.vue'),
      },
    },
  ],
})

export default router
