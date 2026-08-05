import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 전역 상태(Pinia)와 화면 이동(Vue Router)을 앱 플러그인으로 등록한다.
app.use(createPinia())
app.use(router)

app.mount('#app')
