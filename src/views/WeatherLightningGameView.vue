<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const BEST_SCORE_KEY = 'skala-lightning-dodge-best'
const PLAYER_HALF_WIDTH = 4.2
const PLAYER_SPEED = 0.055

const arenaRef = ref(null)
const gameState = ref('ready')
const playerX = ref(50)
const hazards = ref([])
const elapsedMs = ref(0)
const bestScore = ref(0)
const dodgedCount = ref(0)
const pressedKeys = reactive({ left: false, right: false })

let animationFrameId
let lastTimestamp = 0
let spawnElapsed = 0
let nextSpawnDelay = 900
let hazardId = 0

const score = computed(() => Math.floor(elapsedMs.value / 100) / 10)
const difficultyLevel = computed(() => Math.min(5, Math.floor(elapsedMs.value / 10000) + 1))
const difficultyLabel = computed(() => ['약한 비', '소나기', '폭우', '뇌우', '슈퍼셀'][difficultyLevel.value - 1])
const isPlaying = computed(() => gameState.value === 'playing')

function resetPressedKeys() {
  pressedKeys.left = false
  pressedKeys.right = false
}

function getSpawnInterval() {
  return Math.max(390, 980 - elapsedMs.value * 0.025)
}

function getWarningDuration() {
  return Math.max(430, 820 - elapsedMs.value * 0.012)
}

function createHazard(x = 8 + Math.random() * 84) {
  hazards.value.push({
    id: ++hazardId,
    x,
    phase: 'warning',
    age: 0,
    warningDuration: getWarningDuration(),
    strikeDuration: 250,
  })
}

function spawnLightning() {
  const firstX = 8 + Math.random() * 84
  createHazard(firstX)

  // 생존 시간이 길어지면 서로 떨어진 위치에 번개가 동시에 추가된다.
  if (difficultyLevel.value >= 3 && Math.random() < 0.38) {
    const secondX = firstX < 50 ? firstX + 28 + Math.random() * 25 : firstX - 28 - Math.random() * 25
    createHazard(Math.min(93, Math.max(7, secondX)))
  }
}

function isPlayerHit(hazard) {
  const strikeHalfWidth = 4.8
  return Math.abs(playerX.value - hazard.x) < PLAYER_HALF_WIDTH + strikeHalfWidth
}

function finishGame() {
  gameState.value = 'gameover'
  resetPressedKeys()
  window.cancelAnimationFrame(animationFrameId)

  if (score.value > bestScore.value) {
    bestScore.value = score.value
    localStorage.setItem(BEST_SCORE_KEY, String(bestScore.value))
  }
}

function updateHazards(deltaTime) {
  const remainingHazards = []

  for (const hazard of hazards.value) {
    hazard.age += deltaTime

    if (hazard.phase === 'warning' && hazard.age >= hazard.warningDuration) {
      hazard.phase = 'strike'
      hazard.age = 0
    }

    if (hazard.phase === 'strike' && isPlayerHit(hazard)) {
      remainingHazards.push(hazard)
      hazards.value = remainingHazards
      finishGame()
      return
    }

    if (hazard.phase === 'strike' && hazard.age >= hazard.strikeDuration) {
      dodgedCount.value += 1
      continue
    }

    remainingHazards.push(hazard)
  }

  hazards.value = remainingHazards
}

function gameLoop(timestamp) {
  if (!isPlaying.value) return

  if (lastTimestamp === 0) lastTimestamp = timestamp
  const deltaTime = Math.min(timestamp - lastTimestamp, 34)
  lastTimestamp = timestamp
  elapsedMs.value += deltaTime

  const direction = Number(pressedKeys.right) - Number(pressedKeys.left)
  playerX.value = Math.min(
    100 - PLAYER_HALF_WIDTH,
    Math.max(PLAYER_HALF_WIDTH, playerX.value + direction * PLAYER_SPEED * deltaTime),
  )

  spawnElapsed += deltaTime
  if (spawnElapsed >= nextSpawnDelay) {
    spawnElapsed = 0
    spawnLightning()
    nextSpawnDelay = getSpawnInterval() * (0.82 + Math.random() * 0.32)
  }

  updateHazards(deltaTime)
  if (isPlaying.value) animationFrameId = window.requestAnimationFrame(gameLoop)
}

function startGame() {
  window.cancelAnimationFrame(animationFrameId)
  gameState.value = 'playing'
  playerX.value = 50
  hazards.value = []
  elapsedMs.value = 0
  dodgedCount.value = 0
  lastTimestamp = 0
  spawnElapsed = 0
  nextSpawnDelay = 720
  resetPressedKeys()
  animationFrameId = window.requestAnimationFrame(gameLoop)
}

function pauseGame() {
  if (!isPlaying.value) return
  gameState.value = 'paused'
  resetPressedKeys()
  window.cancelAnimationFrame(animationFrameId)
}

function resumeGame() {
  if (gameState.value !== 'paused') return
  gameState.value = 'playing'
  lastTimestamp = 0
  animationFrameId = window.requestAnimationFrame(gameLoop)
}

function togglePause() {
  if (isPlaying.value) pauseGame()
  else if (gameState.value === 'paused') resumeGame()
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase()
  if (['arrowleft', 'arrowright', 'a', 'd', ' ', 'enter', 'p'].includes(key)) {
    event.preventDefault()
  }

  if (key === 'arrowleft' || key === 'a') pressedKeys.left = true
  if (key === 'arrowright' || key === 'd') pressedKeys.right = true
  if ((key === ' ' || key === 'enter') && ['ready', 'gameover'].includes(gameState.value)) {
    startGame()
  }
  if (key === 'p') togglePause()
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase()
  if (key === 'arrowleft' || key === 'a') pressedKeys.left = false
  if (key === 'arrowright' || key === 'd') pressedKeys.right = false
}

function movePlayerToPointer(event) {
  if (!isPlaying.value || !arenaRef.value) return

  const bounds = arenaRef.value.getBoundingClientRect()
  const nextX = ((event.clientX - bounds.left) / bounds.width) * 100
  playerX.value = Math.min(100 - PLAYER_HALF_WIDTH, Math.max(PLAYER_HALF_WIDTH, nextX))
}

function handlePointerDown(event) {
  if (!isPlaying.value) return
  event.currentTarget.setPointerCapture?.(event.pointerId)
  movePlayerToPointer(event)
}

function handlePointerMove(event) {
  if (event.pointerType === 'mouse' && event.buttons === 0) return
  movePlayerToPointer(event)
}

function setDirection(direction, isPressed) {
  pressedKeys[direction] = isPressed
}

function handleVisibilityChange() {
  if (document.hidden) pauseGame()
}

onMounted(() => {
  const savedBest = Number(localStorage.getItem(BEST_SCORE_KEY))
  bestScore.value = Number.isFinite(savedBest) ? savedBest : 0
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  window.addEventListener('blur', pauseGame)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrameId)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('blur', pauseGame)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <main class="lightning-game-page">
    <header class="game-header">
      <div>
        <span class="eyebrow">WEATHER SURVIVAL GAME</span>
        <h1>먹구름 번개 피하기</h1>
        <p>바닥의 경고 지점을 보고 번개가 떨어지기 전에 안전한 곳으로 이동하세요.</p>
      </div>
      <div class="header-bolt" aria-hidden="true">ϟ</div>
    </header>

    <section class="game-dashboard" aria-label="게임 기록">
      <article>
        <span>현재 기록</span>
        <strong>{{ score.toFixed(1) }}<small>초</small></strong>
      </article>
      <article>
        <span>최고 기록</span>
        <strong>{{ bestScore.toFixed(1) }}<small>초</small></strong>
      </article>
      <article>
        <span>피한 번개</span>
        <strong>{{ dodgedCount }}<small>개</small></strong>
      </article>
      <article>
        <span>현재 단계</span>
        <strong>Lv.{{ difficultyLevel }}<small>{{ difficultyLabel }}</small></strong>
      </article>
    </section>

    <section class="game-console">
      <div class="console-topbar">
        <div class="storm-status">
          <i :class="{ active: isPlaying }"></i>
          {{ isPlaying ? '낙뢰 관측 중' : gameState === 'paused' ? '일시정지' : '대기 중' }}
        </div>
        <button v-if="isPlaying" type="button" @click="pauseGame">일시정지</button>
        <button v-else-if="gameState === 'paused'" type="button" @click="resumeGame">
          계속하기
        </button>
      </div>

      <div
        ref="arenaRef"
        class="game-arena"
        :class="{ 'is-playing': isPlaying, 'is-hit': gameState === 'gameover' }"
        tabindex="0"
        aria-label="번개 피하기 게임 영역"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
      >
        <div class="storm-sky" aria-hidden="true">
          <div class="cloud cloud-a"></div>
          <div class="cloud cloud-b"></div>
          <div class="cloud cloud-c"></div>
          <div class="rain-curtain">
            <i v-for="drop in 34" :key="drop" :style="{ '--i': drop }"></i>
          </div>
        </div>

        <div
          v-for="hazard in hazards"
          :key="hazard.id"
          class="lightning-zone"
          :class="hazard.phase"
          :style="{ left: `${hazard.x}%` }"
          aria-hidden="true"
        >
          <div class="warning-column"></div>
          <svg class="lightning-strike" viewBox="0 0 80 500" preserveAspectRatio="none">
            <polyline points="49,0 24,122 52,122 18,265 49,265 11,500" />
            <polyline class="bolt-core" points="49,0 24,122 52,122 18,265 49,265 11,500" />
          </svg>
          <div class="impact-ring"></div>
        </div>

        <div class="ground-glow" aria-hidden="true"></div>
        <div class="player" :style="{ left: `${playerX}%` }" aria-label="플레이어">
          <span class="umbrella">☂</span>
          <span class="runner">●</span>
          <i></i>
        </div>

        <div v-if="gameState !== 'playing'" class="game-message">
          <template v-if="gameState === 'ready'">
            <span class="message-icon">⛈️</span>
            <strong>폭풍이 다가오고 있습니다</strong>
            <p>노란 경고선이 번쩍이면 즉시 옆으로 피하세요.</p>
            <button type="button" @click.stop="startGame">게임 시작</button>
            <small>Enter 또는 Space로도 시작할 수 있어요.</small>
          </template>

          <template v-else-if="gameState === 'paused'">
            <span class="message-icon">⏸</span>
            <strong>잠시 대피 중</strong>
            <p>준비가 되면 폭풍 속으로 다시 들어가세요.</p>
            <button type="button" @click.stop="resumeGame">계속하기</button>
          </template>

          <template v-else>
            <span class="message-icon">⚡</span>
            <strong>번개에 맞았습니다!</strong>
            <p>{{ score.toFixed(1) }}초 동안 번개 {{ dodgedCount }}개를 피했습니다.</p>
            <button type="button" @click.stop="startGame">다시 도전</button>
            <small>최고 기록 {{ bestScore.toFixed(1) }}초</small>
          </template>
        </div>
      </div>

      <div class="mobile-controls" aria-label="모바일 이동 버튼">
        <button
          type="button"
          aria-label="왼쪽으로 이동"
          @pointerdown.prevent="setDirection('left', true)"
          @pointerup="setDirection('left', false)"
          @pointercancel="setDirection('left', false)"
          @pointerleave="setDirection('left', false)"
        >
          ← <span>왼쪽</span>
        </button>
        <button
          type="button"
          aria-label="오른쪽으로 이동"
          @pointerdown.prevent="setDirection('right', true)"
          @pointerup="setDirection('right', false)"
          @pointercancel="setDirection('right', false)"
          @pointerleave="setDirection('right', false)"
        >
          <span>오른쪽</span> →
        </button>
      </div>
    </section>

    <section class="how-to-play">
      <div><kbd>←</kbd><kbd>→</kbd><span>방향키로 이동</span></div>
      <div><kbd>A</kbd><kbd>D</kbd><span>A·D로 이동</span></div>
      <div><kbd>P</kbd><span>일시정지</span></div>
      <p>모바일에서는 게임 화면을 누르거나 아래 버튼을 길게 눌러 이동할 수 있습니다.</p>
    </section>
  </main>
</template>

<style scoped>
.lightning-game-page {
  display: grid;
  gap: 18px;
  color: #e9f2ff;
}

.game-header {
  position: relative;
  display: flex;
  min-height: 190px;
  overflow: hidden;
  align-items: flex-end;
  justify-content: space-between;
  padding: 34px;
  border: 1px solid rgb(154 172 218 / 22%);
  border-radius: 28px;
  background:
    radial-gradient(circle at 80% 25%, rgb(156 139 255 / 28%), transparent 25%),
    linear-gradient(135deg, #10172b, #222c52 55%, #3d3d70);
  box-shadow: 0 24px 55px rgb(20 29 58 / 28%);
}

.game-header::before,
.game-header::after {
  position: absolute;
  border-radius: 999px;
  background: rgb(203 215 238 / 14%);
  box-shadow:
    70px -25px 0 rgb(163 178 207 / 10%),
    150px 8px 0 rgb(181 196 221 / 9%);
  content: '';
}

.game-header::before {
  top: 20px;
  left: -80px;
  width: 220px;
  height: 65px;
}

.game-header::after {
  right: 120px;
  bottom: -30px;
  width: 250px;
  height: 72px;
}

.game-header > div:first-child {
  position: relative;
  z-index: 2;
}

.eyebrow {
  color: #a9bbff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

h1,
p {
  margin: 0;
}

h1 {
  margin-top: 5px;
  font-size: clamp(28px, 5vw, 46px);
  font-weight: 950;
  letter-spacing: -0.055em;
}

.game-header p {
  margin-top: 8px;
  color: #bdcbe5;
  font-size: 12px;
}

.header-bolt {
  position: relative;
  z-index: 2;
  color: #ffe66c;
  font-family: Georgia, serif;
  font-size: 118px;
  font-weight: 900;
  filter: drop-shadow(0 0 14px rgb(255 239 113 / 80%)) drop-shadow(0 0 45px #8073ff);
  line-height: 0.7;
  rotate: 10deg;
}

.game-dashboard {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.game-dashboard article {
  display: grid;
  gap: 3px;
  padding: 15px 17px;
  border: 1px solid #dce3ef;
  border-radius: 15px;
  color: #34425a;
  background: linear-gradient(145deg, #fff, #f5f7fb);
  box-shadow: 0 9px 24px rgb(31 47 81 / 7%);
}

.game-dashboard span {
  color: #8290a3;
  font-size: 9px;
  font-weight: 800;
}

.game-dashboard strong {
  font-size: 20px;
  font-weight: 950;
  letter-spacing: -0.04em;
}

.game-dashboard small {
  margin-left: 4px;
  color: #697991;
  font-size: 8px;
  font-weight: 750;
}

.game-console {
  overflow: hidden;
  border: 1px solid rgb(123 142 186 / 32%);
  border-radius: 24px;
  background: #151d33;
  box-shadow: 0 24px 60px rgb(17 26 50 / 28%);
}

.console-topbar {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
  background: rgb(8 14 29 / 82%);
}

.storm-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #aebbd2;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.storm-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6a7486;
}

.storm-status i.active {
  background: #70f0bd;
  box-shadow: 0 0 12px #43dba0;
  animation: status-pulse 1s ease-in-out infinite;
}

.console-topbar button {
  padding: 6px 10px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 8px;
  color: #dce7fb;
  background: rgb(255 255 255 / 8%);
  font: inherit;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.game-arena {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 540px;
  outline: none;
  background:
    radial-gradient(ellipse at 50% 105%, rgb(91 113 144 / 48%), transparent 38%),
    linear-gradient(#11182c 0%, #263650 62%, #354357 100%);
  cursor: crosshair;
  touch-action: none;
  user-select: none;
}

.game-arena.is-hit {
  animation: arena-hit 0.45s ease both;
}

.storm-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cloud {
  position: absolute;
  width: 290px;
  height: 82px;
  border-radius: 999px;
  background: rgb(39 48 69 / 96%);
  box-shadow:
    65px -35px 0 rgb(47 57 79 / 98%),
    150px 2px 0 rgb(31 40 59 / 95%);
  filter: drop-shadow(0 18px 20px rgb(3 8 18 / 38%));
  animation: cloud-drift 10s ease-in-out infinite alternate;
}

.cloud-a {
  top: 18px;
  left: -130px;
}

.cloud-b {
  top: 92px;
  right: -120px;
  scale: 0.78;
  animation-delay: -4s;
}

.cloud-c {
  top: 168px;
  left: 28%;
  scale: 0.52;
  opacity: 0.6;
  animation-delay: -7s;
}

.rain-curtain {
  position: absolute;
  inset: 0;
  opacity: 0.32;
}

.rain-curtain i {
  position: absolute;
  top: -50px;
  left: calc((var(--i) - 1) * 3.03%);
  width: 1.5px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(transparent, #b9dcff);
  rotate: 11deg;
  animation: background-rain 1.1s linear infinite;
  animation-delay: calc(var(--i) * -0.08s);
}

.lightning-zone {
  position: absolute;
  z-index: 5;
  top: 0;
  bottom: 22px;
  width: 10%;
  translate: -50% 0;
  pointer-events: none;
}

.warning-column {
  position: absolute;
  inset: 0;
  border-right: 1px solid rgb(255 232 102 / 28%);
  border-left: 1px solid rgb(255 232 102 / 28%);
  background: linear-gradient(to bottom, transparent, rgb(255 223 83 / 10%) 52%, rgb(255 217 56 / 28%));
  animation: warning-pulse 0.34s ease-in-out infinite alternate;
}

.warning-column::after {
  position: absolute;
  right: 5%;
  bottom: -8px;
  left: 5%;
  height: 14px;
  border: 2px solid #ffe65c;
  border-radius: 50%;
  background: rgb(255 220 62 / 24%);
  box-shadow:
    0 0 15px #ffd737,
    inset 0 0 13px rgb(255 222 61 / 72%);
  content: '';
}

.lightning-strike,
.impact-ring {
  display: none;
}

.lightning-zone.strike .warning-column {
  display: none;
}

.lightning-zone.strike .lightning-strike {
  position: absolute;
  top: -15px;
  left: 50%;
  display: block;
  width: 82%;
  height: calc(100% + 20px);
  overflow: visible;
  filter: drop-shadow(0 0 8px #fff) drop-shadow(0 0 18px #fff05f) drop-shadow(0 0 35px #887cff);
  translate: -50% 0;
}

.lightning-strike polyline {
  fill: none;
  stroke: rgb(255 235 75 / 62%);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 18;
}

.lightning-strike .bolt-core {
  stroke: #fff;
  stroke-width: 6;
}

.lightning-zone.strike .impact-ring {
  position: absolute;
  right: -35%;
  bottom: -15px;
  left: -35%;
  display: block;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(ellipse, #fff 0 8%, #ffec58 14%, rgb(255 230 74 / 34%) 42%, transparent 68%);
  animation: impact-flash 0.25s ease-out both;
}

.ground-glow {
  position: absolute;
  z-index: 1;
  right: -8%;
  bottom: -75px;
  left: -8%;
  height: 120px;
  border-radius: 50%;
  background: rgb(121 142 161 / 34%);
  box-shadow: 0 -25px 75px rgb(105 129 156 / 20%);
}

.player {
  position: absolute;
  z-index: 8;
  bottom: 20px;
  display: grid;
  width: 8.4%;
  min-width: 46px;
  justify-items: center;
  translate: -50% 0;
  transition: filter 0.12s;
}

.player .umbrella {
  position: relative;
  z-index: 2;
  color: #ffe85e;
  font-size: 48px;
  filter: drop-shadow(0 6px 9px rgb(4 10 22 / 45%)) drop-shadow(0 0 8px rgb(255 223 75 / 25%));
  line-height: 0.75;
  rotate: -8deg;
}

.player .runner {
  width: 16px;
  height: 16px;
  margin-top: 3px;
  border-radius: 50%;
  color: #f0ae74;
  background: #f0ae74;
  box-shadow: 0 14px 0 3px #6078d8;
  font-size: 0;
}

.player i {
  width: 32px;
  height: 18px;
  margin-top: 6px;
  border-right: 5px solid #9eb0ff;
  border-left: 5px solid #9eb0ff;
  transform: skew(-12deg);
}

.game-message {
  position: absolute;
  z-index: 15;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  padding: 24px;
  background: rgb(9 15 31 / 68%);
  text-align: center;
  backdrop-filter: blur(5px);
}

.message-icon {
  font-size: 50px;
  filter: drop-shadow(0 9px 16px rgb(0 0 0 / 32%));
}

.game-message strong {
  margin-top: 9px;
  color: #fff;
  font-size: 24px;
  font-weight: 950;
  letter-spacing: -0.04em;
}

.game-message p {
  margin-top: 5px;
  color: #becbe1;
  font-size: 11px;
}

.game-message button {
  min-width: 150px;
  margin-top: 18px;
  padding: 11px 20px;
  border: 1px solid #ffef91;
  border-radius: 12px;
  color: #20233e;
  background: linear-gradient(135deg, #fff379, #ffc83f);
  box-shadow: 0 10px 25px rgb(255 209 65 / 25%);
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.game-message small {
  margin-top: 8px;
  color: #8191ac;
  font-size: 8px;
}

.mobile-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 11px;
  border-top: 1px solid rgb(255 255 255 / 8%);
  background: #0d1426;
}

.mobile-controls button {
  min-height: 48px;
  border: 1px solid rgb(145 163 206 / 28%);
  border-radius: 12px;
  color: #dce7ff;
  background: linear-gradient(145deg, rgb(75 91 137 / 42%), rgb(43 56 91 / 55%));
  font: inherit;
  font-size: 19px;
  font-weight: 900;
  cursor: pointer;
  touch-action: none;
}

.mobile-controls button:active {
  border-color: #ffdf5c;
  color: #fff4a6;
  background: rgb(121 103 53 / 55%);
}

.mobile-controls span {
  font-size: 9px;
}

.how-to-play {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 15px 18px;
  border: 1px solid #dce3ee;
  border-radius: 16px;
  color: #64748b;
  background: #fff;
  box-shadow: 0 8px 22px rgb(32 47 78 / 6%);
}

.how-to-play div {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
}

.how-to-play kbd {
  display: grid;
  min-width: 25px;
  height: 25px;
  place-items: center;
  border: 1px solid #cbd4e2;
  border-bottom-width: 3px;
  border-radius: 6px;
  color: #435169;
  background: #f8fafc;
  font: inherit;
  font-size: 9px;
  font-weight: 900;
}

.how-to-play span,
.how-to-play p {
  font-size: 9px;
}

.how-to-play p {
  margin-left: auto;
  text-align: right;
}

@keyframes cloud-drift {
  from {
    translate: -25px 0;
  }

  to {
    translate: 35px -8px;
  }
}

@keyframes background-rain {
  from {
    translate: -18px -60px;
  }

  to {
    translate: 55px 640px;
  }
}

@keyframes warning-pulse {
  from {
    opacity: 0.32;
  }

  to {
    opacity: 1;
  }
}

@keyframes impact-flash {
  from {
    opacity: 1;
    scale: 0.4;
  }

  to {
    opacity: 0.15;
    scale: 1.25;
  }
}

@keyframes status-pulse {
  50% {
    opacity: 0.35;
  }
}

@keyframes arena-hit {
  0%,
  100% {
    filter: none;
  }

  35% {
    filter: brightness(2.4) saturate(0.5);
  }
}

@media (max-width: 720px) {
  .game-header {
    min-height: 165px;
    padding: 25px 21px;
  }

  .game-header p {
    max-width: 75%;
    font-size: 10px;
  }

  .header-bolt {
    position: absolute;
    right: 20px;
    font-size: 82px;
    opacity: 0.72;
  }

  .game-dashboard {
    grid-template-columns: repeat(2, 1fr);
  }

  .game-arena {
    height: 480px;
  }

  .how-to-play {
    display: grid;
    grid-template-columns: repeat(3, auto);
    gap: 9px;
  }

  .how-to-play p {
    grid-column: 1 / -1;
    margin: 2px 0 0;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloud,
  .rain-curtain i,
  .storm-status i,
  .warning-column,
  .impact-ring {
    animation: none !important;
  }
}
</style>
