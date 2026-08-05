<script setup>
import { computed } from 'vue'

const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  cityName: {
    type: String,
    default: '',
  },
  weatherCode: {
    type: [Number, String],
    default: null,
  },
  status: {
    type: String,
    default: '',
  },
})

// API 날씨 코드와 한글 상태를 함께 검사해 전환 장면을 결정한다.
const scene = computed(() => {
  const code = Number(props.weatherCode)

  if ((code >= 200 && code < 300) || /천둥|뇌우/.test(props.status)) {
    return { type: 'storm', glyph: '⚡' }
  }
  if ((code >= 300 && code < 600) || /비|소나기|이슬비/.test(props.status)) {
    return { type: 'rain', glyph: '🌧️' }
  }
  if ((code >= 600 && code < 700) || /눈/.test(props.status)) {
    return { type: 'snow', glyph: '❄️' }
  }
  if (code === 800 || /맑/.test(props.status)) return { type: 'clear', glyph: '☀️' }
  if (code > 800 || /구름|흐림/.test(props.status)) return { type: 'clouds', glyph: '☁️' }

  return { type: 'default', glyph: '🌤️' }
})
</script>

<template>
  <Transition name="weather-cover">
    <div
      v-if="active"
      class="weather-transition-overlay"
      :class="`scene-${scene.type}`"
      role="status"
      aria-live="polite"
    >
      <div class="scene-aura"></div>
      <div class="scene-sun"><i></i></div>

      <div class="scene-clouds" aria-hidden="true">
        <i></i><i></i><i></i>
      </div>

      <div class="scene-rain" aria-hidden="true">
        <i v-for="drop in 36" :key="`drop-${drop}`" :style="{ '--i': drop }"></i>
      </div>

      <div class="scene-snow" aria-hidden="true">
        <i v-for="flake in 30" :key="`flake-${flake}`" :style="{ '--i': flake }">✦</i>
      </div>

      <div class="scene-lightning" aria-hidden="true"></div>

      <div class="transition-caption">
        <b>{{ scene.glyph }}</b>
        <span>{{ cityName }}</span>
        <small>상세 날씨를 펼치는 중</small>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.weather-transition-overlay {
  position: absolute;
  z-index: 30;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  color: #fff;
  background: linear-gradient(145deg, rgb(66 89 185 / 72%), rgb(37 169 202 / 68%));
  backdrop-filter: blur(2px) saturate(1.18);
  pointer-events: none;
  isolation: isolate;
}

.weather-cover-enter-active {
  animation: cover-arrive 1.4s cubic-bezier(0.2, 0.75, 0.2, 1) both;
}

.scene-aura {
  position: absolute;
  inset: -45%;
  border-radius: 50%;
  background: conic-gradient(
    from 40deg,
    transparent,
    rgb(255 255 255 / 38%),
    transparent 34%,
    rgb(255 255 255 / 20%),
    transparent 70%
  );
  animation: aura-spin 2.4s linear infinite;
}

.transition-caption {
  position: absolute;
  z-index: 8;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  text-shadow: 0 3px 18px rgb(20 31 64 / 45%);
  animation: caption-pop 1.4s ease both;
}

.transition-caption b {
  font-size: 42px;
  filter: drop-shadow(0 8px 12px rgb(27 43 73 / 28%));
}

.transition-caption span {
  margin-top: 3px;
  font-size: 16px;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.transition-caption small {
  margin-top: 2px;
  color: rgb(255 255 255 / 82%);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.weather-transition-overlay > .scene-sun,
.weather-transition-overlay > .scene-clouds,
.weather-transition-overlay > .scene-rain,
.weather-transition-overlay > .scene-snow,
.weather-transition-overlay > .scene-lightning {
  display: none;
}

/* 맑음: 태양이 상세 화면 위로 확장되며 밝은 플래시를 만든다. */
.scene-clear {
  background:
    radial-gradient(circle at 78% 15%, rgb(255 255 210 / 92%), transparent 22%),
    linear-gradient(145deg, rgb(255 191 47 / 72%), rgb(255 223 102 / 65%), rgb(119 215 244 / 58%));
}

.scene-clear .scene-sun {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 32%, #fffbd0, #ffd126 60%, #ff9f0b);
  box-shadow:
    0 0 30px #fff7a8,
    0 0 90px rgb(255 215 57 / 100%),
    0 0 170px rgb(255 239 130 / 92%);
  translate: -50% -50%;
  animation: sun-expand 1.4s ease-out both;
}

.scene-clear .scene-sun i {
  position: absolute;
  inset: -105px;
  border-radius: 50%;
  background: repeating-conic-gradient(
    rgb(255 246 163 / 92%) 0 8deg,
    transparent 8deg 18deg
  );
  mask: radial-gradient(circle, transparent 0 48%, #000 51%);
  animation: aura-spin 3s linear infinite;
}

/* 비와 천둥: 촘촘한 빗줄기가 상세 화면 전체를 빠르게 가로지른다. */
.scene-rain,
.scene-storm {
  background: linear-gradient(145deg, rgb(16 27 44 / 76%), rgb(39 74 104 / 70%), rgb(77 120 148 / 62%));
}

.scene-rain .scene-rain,
.scene-storm .scene-rain {
  position: absolute;
  display: block;
  inset: 0;
  background: transparent;
}

.scene-rain .scene-rain i,
.scene-storm .scene-rain i {
  position: absolute;
  top: -65px;
  left: calc((var(--i) - 1) * 2.9%);
  width: 3px;
  height: 72px;
  border-radius: 999px;
  background: linear-gradient(transparent, rgb(203 236 255 / 100%));
  box-shadow: 0 0 8px rgb(117 199 255 / 52%);
  rotate: 12deg;
  animation: rain-sweep 0.92s linear infinite;
  animation-delay: calc(var(--i) * -0.055s);
}

.scene-storm {
  background: linear-gradient(145deg, rgb(11 16 32 / 80%), rgb(37 40 84 / 74%), rgb(90 78 136 / 66%));
}

.scene-storm .scene-lightning {
  position: absolute;
  z-index: 5;
  top: 3%;
  left: 55%;
  display: block;
  width: 120px;
  height: 250px;
  background: #fff8a6;
  clip-path: polygon(55% 0, 100% 0, 63% 42%, 91% 42%, 16% 100%, 39% 56%, 7% 56%);
  filter: drop-shadow(0 0 18px #fff) drop-shadow(0 0 34px #a99cff);
  animation: lightning-hit 1.4s linear both;
}

/* 눈: 앞뒤 크기가 다른 눈송이로 짧은 눈보라를 표현한다. */
.scene-snow {
  background: linear-gradient(145deg, rgb(126 197 235 / 68%), rgb(217 241 255 / 66%), rgb(255 255 255 / 62%));
}

.scene-snow .scene-snow {
  position: absolute;
  display: block;
  inset: 0;
  background: transparent;
}

.scene-snow .scene-snow i {
  position: absolute;
  top: -28px;
  left: calc((var(--i) - 1) * 3.45%);
  color: #fff;
  font-size: calc(11px + (var(--i) * 0.34px));
  font-style: normal;
  text-shadow:
    0 0 8px #fff,
    0 3px 12px rgb(45 107 151 / 48%);
  animation: snow-sweep 2.5s linear infinite;
  animation-delay: calc(var(--i) * -0.11s);
}

.scene-snow .scene-snow i:nth-child(3n) {
  font-size: 18px;
  animation-duration: 2.2s;
}

/* 구름: 구름 덩어리가 양옆에서 카드 중앙을 덮는다. */
.scene-clouds {
  background: linear-gradient(145deg, rgb(113 130 150 / 70%), rgb(184 196 207 / 65%), rgb(229 235 239 / 58%));
}

.scene-clouds .scene-clouds {
  position: absolute;
  display: block;
  inset: 0;
  background: transparent;
}

.scene-clouds .scene-clouds i {
  position: absolute;
  width: 360px;
  height: 145px;
  border-radius: 999px;
  background: rgb(245 249 252 / 88%);
  box-shadow:
    80px -55px 0 rgb(229 236 242 / 92%),
    190px 8px 0 rgb(215 225 234 / 85%);
  filter: drop-shadow(0 12px 16px rgb(35 51 68 / 20%));
  animation: cloud-cover 1.4s ease-out both;
}

.scene-clouds .scene-clouds i:nth-child(1) {
  top: 5%;
  left: -390px;
}

.scene-clouds .scene-clouds i:nth-child(2) {
  top: 48%;
  right: -410px;
  animation-direction: reverse;
}

.scene-clouds .scene-clouds i:nth-child(3) {
  bottom: -25px;
  left: -360px;
  scale: 0.72;
  animation-delay: 0.12s;
}

@keyframes cover-arrive {
  0% {
    opacity: 0;
    scale: 0.88;
    filter: saturate(0.5);
  }

  18%,
  78% {
    opacity: 1;
    scale: 1;
    filter: saturate(1.2);
  }

  100% {
    opacity: 0;
    scale: 1.04;
    filter: saturate(1);
  }
}

@keyframes caption-pop {
  0%,
  18% {
    opacity: 0;
    scale: 0.65;
  }

  40%,
  100% {
    opacity: 1;
    scale: 1;
  }
}

@keyframes aura-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes sun-expand {
  from {
    opacity: 0.3;
    scale: 0.2;
  }

  45% {
    opacity: 1;
    scale: 1.15;
  }

  to {
    opacity: 1;
    scale: 1;
  }
}

@keyframes rain-sweep {
  from {
    translate: -24px -70px;
  }

  to {
    translate: 185px 1250px;
  }
}

@keyframes snow-sweep {
  from {
    translate: -18px -35px;
    rotate: 0deg;
  }

  to {
    translate: 75px 1200px;
    rotate: 420deg;
  }
}

@keyframes lightning-hit {
  0%,
  28%,
  36%,
  48%,
  100% {
    opacity: 0;
  }

  30%,
  34%,
  40%,
  46% {
    opacity: 1;
  }
}

@keyframes cloud-cover {
  from {
    translate: 0 0;
  }

  to {
    translate: 680px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-cover-enter-active,
  .weather-transition-overlay,
  .weather-transition-overlay * {
    animation: none !important;
  }
}
</style>
