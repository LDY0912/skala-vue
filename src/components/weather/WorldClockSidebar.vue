<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits(['select-city'])

const clockCities = [
  {
    id: 'kr_seoul',
    name: '서울',
    country: '대한민국',
    flag: '🇰🇷',
    timeZone: 'Asia/Seoul',
  },
  {
    id: 'gb_london',
    name: '런던',
    country: '영국',
    flag: '🇬🇧',
    timeZone: 'Europe/London',
  },
  {
    id: 'us_new_york',
    name: '뉴욕',
    country: '미국',
    flag: '🇺🇸',
    timeZone: 'America/New_York',
  },
  {
    id: 'ae_dubai',
    name: '두바이',
    country: '아랍에미리트',
    flag: '🇦🇪',
    timeZone: 'Asia/Dubai',
  },
  {
    id: 'au_sydney',
    name: '시드니',
    country: '호주',
    flag: '🇦🇺',
    timeZone: 'Australia/Sydney',
  },
]

const now = ref(new Date())
let clockTimer

function formatTime(timeZone) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(now.value)
}

function formatDate(timeZone) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(now.value)
}

function getLocalHour(timeZone) {
  const hourPart = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  })
    .formatToParts(now.value)
    .find((part) => part.type === 'hour')

  return Number(hourPart?.value ?? 12)
}

function getTimeMood(timeZone) {
  const hour = getLocalHour(timeZone)

  if (hour >= 5 && hour < 11) return { icon: '🌤️', label: '아침' }
  if (hour >= 11 && hour < 17) return { icon: '☀️', label: '낮' }
  if (hour >= 17 && hour < 20) return { icon: '🌇', label: '저녁' }
  return { icon: '🌙', label: '밤' }
}

onMounted(() => {
  clockTimer = window.setInterval(() => {
    now.value = new Date()
  }, 30_000)
})

onBeforeUnmount(() => window.clearInterval(clockTimer))
</script>

<template>
  <aside class="world-clock-sidebar" aria-labelledby="world-clock-title">
    <header class="clock-heading">
      <div class="globe-mark" aria-hidden="true">
        <span></span>
      </div>
      <div>
        <span class="live-label"><i></i> LIVE</span>
        <h2 id="world-clock-title">세계 주요 도시 시각</h2>
        <p>지금 지구 반대편은 몇 시일까요?</p>
      </div>
    </header>

    <div class="clock-list">
      <button
        v-for="city in clockCities"
        :key="city.id"
        type="button"
        class="clock-city"
        :aria-label="`${city.name} 날씨 상세보기`"
        @click="emit('select-city', city.id)"
      >
        <span class="city-identity">
          <b class="city-flag">{{ city.flag }}</b>
          <span>
            <strong>{{ city.name }}</strong>
            <small>{{ city.country }}</small>
          </span>
        </span>

        <span class="city-time">
          <strong>{{ formatTime(city.timeZone) }}</strong>
          <small>
            {{ getTimeMood(city.timeZone).icon }} {{ getTimeMood(city.timeZone).label }} ·
            {{ formatDate(city.timeZone) }}
          </small>
        </span>
      </button>
    </div>

    <p class="clock-guide"><span>↗</span> 도시를 누르면 실시간 날씨를 볼 수 있어요.</p>
  </aside>
</template>

<style scoped>
.world-clock-sidebar {
  position: sticky;
  top: 96px;
  overflow: hidden;
  padding: 20px;
  border: 1px solid rgb(215 223 239 / 88%);
  border-radius: 22px;
  background:
    radial-gradient(circle at 100% 0%, rgb(73 171 220 / 16%), transparent 34%),
    linear-gradient(155deg, rgb(255 255 255 / 94%), rgb(244 247 255 / 92%));
  box-shadow:
    0 16px 42px rgb(34 48 92 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
  backdrop-filter: blur(18px);
}

.world-clock-sidebar::after {
  position: absolute;
  z-index: -1;
  right: -80px;
  bottom: -105px;
  width: 250px;
  height: 250px;
  border: 1px solid rgb(83 104 190 / 8%);
  border-radius: 50%;
  box-shadow:
    0 0 0 25px rgb(83 104 190 / 3%),
    0 0 0 52px rgb(83 104 190 / 2%);
  content: '';
}

.clock-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 17px;
}

.globe-mark {
  position: relative;
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  overflow: hidden;
  place-items: center;
  border-radius: 15px;
  background: linear-gradient(145deg, #6677e6, #3d9ec1);
  box-shadow: 0 8px 18px rgb(75 104 201 / 24%);
}

.globe-mark::before,
.globe-mark::after,
.globe-mark span {
  position: absolute;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 50%;
  content: '';
}

.globe-mark::before {
  width: 27px;
  height: 27px;
}

.globe-mark::after {
  width: 12px;
  height: 27px;
}

.globe-mark span {
  width: 27px;
  height: 10px;
}

.live-label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #3d6bb1;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.live-label i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #27b77c;
  box-shadow: 0 0 0 4px rgb(39 183 124 / 11%);
}

.clock-heading h2,
.clock-heading p {
  margin: 0;
}

.clock-heading h2 {
  color: #263752;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.035em;
}

.clock-heading p {
  margin-top: 1px;
  color: #8995a7;
  font-size: 9px;
}

.clock-list {
  display: grid;
  gap: 8px;
}

.clock-city {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgb(220 226 239 / 82%);
  border-radius: 14px;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 5px 14px rgb(35 52 87 / 4%);
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.clock-city:hover {
  border-color: #c8d2ee;
  background: #fff;
  box-shadow: 0 9px 20px rgb(48 69 125 / 9%);
  transform: translateY(-2px);
}

.city-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.city-flag {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(220 225 235 / 75%);
  border-radius: 10px;
  background: #fff;
  font-size: 16px;
  box-shadow: 0 3px 8px rgb(30 44 72 / 6%);
}

.city-identity > span,
.city-time {
  display: grid;
}

.city-identity strong {
  color: #35435a;
  font-size: 11px;
  font-weight: 900;
}

.city-identity small {
  overflow: hidden;
  max-width: 76px;
  color: #98a2b1;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-time {
  flex: 0 0 auto;
  justify-items: end;
  line-height: 1.25;
}

.city-time strong {
  color: #34499b;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.city-time small {
  color: #8b97a8;
  font-size: 8px;
  white-space: nowrap;
}

.clock-guide {
  position: relative;
  margin: 14px 2px 0;
  color: #758298;
  font-size: 9px;
  font-weight: 700;
  text-align: center;
}

.clock-guide span {
  color: #5b6ed2;
  font-weight: 900;
}

@media (max-width: 960px) {
  .world-clock-sidebar {
    position: relative;
    top: 0;
  }

  .clock-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .world-clock-sidebar {
    padding: 18px;
  }

  .clock-list {
    grid-template-columns: 1fr;
  }
}
</style>
