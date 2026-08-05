import { createRouter, createWebHistory } from 'vue-router'
import { useAuthLabStore } from '../stores/authLabStore.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'final-weather-home',
      component: () => import('../views/FinalWeatherView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'final-weather-detail',
      component: () => import('../views/FinalWeatherDetailView.vue'),
      props: true,
    },
    {
      path: '/exercises',
      component: () => import('../views/ExercisesView.vue'),
      children: [
        {
          path: '',
          name: 'exercise-home',
          components: {
            exercise4: () => import('../views/WeatherHomeView.vue'),
            exercise5: () => import('../views/WeatherHomeView.vue'),
          },
          props: {
            exercise4: { routeBase: '/exercises' },
            exercise5: { routeBase: '/exercises', useConfigUnit: true },
          },
        },
        {
          path: 'about',
          name: 'exercise-about',
          components: {
            exercise4: () => import('../views/WeatherAboutView.vue'),
            exercise5: () => import('../views/WeatherAboutView.vue'),
          },
          props: {
            exercise4: { homePath: '/exercises' },
            exercise5: { homePath: '/exercises' },
          },
        },
        {
          path: 'weather/:cityId',
          name: 'exercise-weather-detail',
          components: {
            exercise4: () => import('../views/WeatherDetailView.vue'),
            exercise5: () => import('../views/WeatherDetailView.vue'),
          },
          props: {
            exercise4: (route) => ({
              cityId: route.params.cityId,
              homePath: '/exercises',
            }),
            exercise5: (route) => ({
              cityId: route.params.cityId,
              homePath: '/exercises',
              useConfigUnit: true,
            }),
          },
        },
        {
          path: ':pathMatch(.*)*',
          name: 'exercise-not-found',
          components: {
            exercise4: () => import('../views/NotFoundView.vue'),
            exercise5: () => import('../views/NotFoundView.vue'),
          },
          props: {
            exercise4: { homePath: '/exercises' },
            exercise5: { homePath: '/exercises' },
          },
        },
      ],
    },
    {
      path: '/labs',
      name: 'integration-lab',
      component: () => import('../views/IntegrationLabView.vue'),
      meta: { wide: true },
    },
    {
      path: '/labs/protected',
      name: 'lab-protected',
      component: () => import('../views/ProtectedLabView.vue'),
      meta: { requiresLabAuth: true, wide: true },
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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthLabStore()

  if (to.meta.requiresLabAuth && !authStore.isLoggedIn) {
    return {
      name: 'integration-lab',
      query: { tab: 'auth', redirect: to.fullPath },
    }
  }
})

export default router
