<script setup>
import { storeToRefs } from 'pinia'
import { useEscapeRoomStore } from '../stores/escapeRoomStore.js'

const escapeRoomStore = useEscapeRoomStore()
const baseUrl = import.meta.env.BASE_URL
const {
  regions,
  selectedRegionId,
  selectedBranchId,
  selectedRegion,
  selectedBranch,
  searchQuery,
  favoriteOnly,
  favoriteThemeIds,
  visibleThemes,
  branchCount,
  themeCount,
} = storeToRefs(escapeRoomStore)

function difficultyLabel(level) {
  if (level >= 4.5) return '매우 어려움'
  if (level >= 3.5) return '어려움'
  if (level >= 2.5) return '보통'
  if (level >= 1.5) return '쉬움'
  return '입문'
}

function scareLabel(level) {
  if (level >= 4) return '매우 높음'
  if (level >= 3) return '높음'
  if (level >= 1.5) return '보통'
  if (level > 0) return '낮음'
  return '없음'
}
</script>

<template>
  <main class="escape-page">
    <header class="escape-hero">
      <div class="hero-copy">
        <span class="eyebrow">ESCAPE ROOM CURATION</span>
        <h1>다양한 방탈출 테마를 <br />한눈에 만나보세요.</h1>
        <p>강남·홍대·건대의 지점을 고르고, 실제 테마 포스터와 공식 소개를 확인해 보세요.</p>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <span class="door-glow"></span>
        <span class="door">↗</span>
        <i class="key key-one">✦</i>
        <i class="key key-two">✦</i>
      </div>
    </header>

    <section class="overview" aria-label="방탈출 데이터 요약">
      <article>
        <span>서울 지역</span>
        <strong>{{ regions.length }}</strong>
      </article>
      <article>
        <span>지점</span>
        <strong>{{ branchCount }}</strong>
      </article>
      <article>
        <span>테마</span>
        <strong>{{ themeCount }}</strong>
      </article>
      <article>
        <span>찜한 테마</span>
        <strong>{{ favoriteThemeIds.length }}</strong>
      </article>
    </section>

    <section class="explorer-panel">
      <div class="step-heading">
        <span>01</span>
        <div>
          <h2>지역을 선택하세요</h2>
          <p>강남·홍대·건대에 지점이 10개씩 준비되어 있어요.</p>
        </div>
      </div>

      <div class="region-tabs" role="tablist" aria-label="서울 상권 선택">
        <button
          v-for="region in regions"
          :key="region.id"
          type="button"
          role="tab"
          :aria-selected="selectedRegionId === region.id"
          :class="{ active: selectedRegionId === region.id }"
          @click="escapeRoomStore.selectRegion(region.id)"
        >
          <strong>{{ region.name }}</strong>
          <small>{{ region.caption }}</small>
        </button>
      </div>

      <div class="explorer-grid">
        <aside class="branch-panel">
          <div class="step-heading compact">
            <span>02</span>
            <div>
              <h2>{{ selectedRegion?.name }} 지점</h2>
            </div>
          </div>

          <div class="branch-list">
            <button
              v-for="branch in selectedRegion?.branches"
              :key="branch.id"
              type="button"
              :class="{ active: selectedBranchId === branch.id }"
              @click="escapeRoomStore.selectBranch(branch.id)"
            >
              <span class="branch-icon">{{ branch.area.slice(0, 1) }}</span>
              <span>
                <small>{{ branch.brand }}</small>
                <strong>{{ branch.name }}</strong>
                <em>{{ branch.area }} · 테마 {{ branch.themes.length }}개</em>
              </span>
              <b>›</b>
            </button>
          </div>
        </aside>

        <div class="theme-panel">
          <div class="theme-panel-head">
            <div class="step-heading compact">
              <span>03</span>
              <div>
                <h2>{{ selectedBranch?.name }}</h2>
                <p>{{ selectedBranch?.address }}</p>
              </div>
            </div>

            <a
              v-if="selectedBranch"
              class="brand-link"
              :href="selectedBranch.reservationUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              지점 예약 페이지 ↗
            </a>
          </div>

          <div class="theme-toolbar">
            <label class="search-box">
              <span aria-hidden="true">⌕</span>
              <input v-model="searchQuery" type="search" placeholder="테마명 또는 장르 검색" />
            </label>
            <button
              type="button"
              class="favorite-filter"
              :class="{ active: favoriteOnly }"
              @click="favoriteOnly = !favoriteOnly"
            >
              {{ favoriteOnly ? '찜만 보는 중' : '찜한 테마만' }}
            </button>
          </div>

          <div v-if="visibleThemes.length" class="theme-grid">
            <article v-for="theme in visibleThemes" :key="theme.id" class="theme-card">
              <div class="theme-cover">
                <img
                  :src="`${baseUrl}${theme.imageUrl}`"
                  :alt="`${theme.title} 공식 테마 포스터`"
                  loading="lazy"
                />
                <small>{{ theme.genre }}</small>
                <button
                  type="button"
                  class="favorite-button"
                  :class="{ active: escapeRoomStore.isFavorite(theme.id) }"
                  :aria-label="`${theme.title} ${escapeRoomStore.isFavorite(theme.id) ? '찜 해제' : '찜하기'}`"
                  @click="escapeRoomStore.toggleFavorite(theme.id)"
                >
                  {{ escapeRoomStore.isFavorite(theme.id) ? '♥' : '♡' }}
                </button>
              </div>

              <div class="theme-content">
                <div class="title-row">
                  <div>
                    <small>{{ selectedBranch.brand }}</small>
                    <h3>{{ theme.title }}</h3>
                  </div>
                  <span class="difficulty" :class="{ hard: theme.difficulty >= 4 }">
                    {{ difficultyLabel(theme.difficulty) }}
                  </span>
                </div>

                <div class="theme-intro">
                  <p>{{ theme.description }}</p>
                  <a :href="theme.sourceUrl" target="_blank" rel="noopener noreferrer">
                    공식 소개 원문 ↗
                  </a>
                </div>

                <dl>
                  <div>
                    <dt>시간</dt>
                    <dd>{{ theme.duration }}</dd>
                  </div>
                  <div>
                    <dt>난이도</dt>
                    <dd>{{ theme.difficulty }}/5</dd>
                  </div>
                  <div>
                    <dt>공포도</dt>
                    <dd>{{ scareLabel(theme.scare) }}</dd>
                  </div>
                </dl>

                <a :href="selectedBranch.reservationUrl" target="_blank" rel="noopener noreferrer">
                  공식 홈페이지에서 예약하기 <span>↗</span>
                </a>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <span>⌕</span>
            <strong>조건에 맞는 테마가 없어요.</strong>
            <p>검색어를 지우거나 찜 필터를 해제해 보세요.</p>
          </div>
        </div>
      </div>
    </section>

    <p class="data-notice">
      <span>i</span>
      {{ escapeRoomStore.notice }} · 데이터 기준 {{ escapeRoomStore.updatedAt }}
    </p>
  </main>
</template>

<style scoped>
.escape-page {
  --escape-dark: #171526;
  --escape-purple: #7257e8;
  --escape-coral: #ff765f;
  display: grid;
  gap: 20px;
}

.escape-hero {
  position: relative;
  display: flex;
  min-height: 290px;
  overflow: hidden;
  align-items: center;
  justify-content: space-between;
  padding: clamp(32px, 5vw, 58px);
  border-radius: 30px;
  color: #fff;
  background:
    radial-gradient(circle at 76% 46%, rgb(255 135 105 / 35%), transparent 22%),
    radial-gradient(circle at 92% -10%, rgb(133 100 255 / 45%), transparent 34%),
    linear-gradient(130deg, #171526 8%, #292040 58%, #462947 100%);
  box-shadow: 0 26px 70px rgb(39 28 72 / 22%);
}

.escape-hero::before {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 4%) 1px, transparent 1px);
  background-size: 28px 28px;
  content: '';
  mask-image: linear-gradient(90deg, #000, transparent 80%);
}

.hero-copy {
  position: relative;
  z-index: 2;
  max-width: 590px;
}

.eyebrow {
  color: #c6b9ff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.17em;
}

.hero-copy h1 {
  margin: 12px 0 13px;
  font-size: clamp(31px, 5vw, 52px);
  line-height: 1.13;
  letter-spacing: -0.055em;
}

.hero-copy p {
  max-width: 520px;
  margin: 0;
  color: rgb(239 236 255 / 72%);
  font-size: 14px;
}

.hero-visual {
  position: relative;
  display: grid;
  width: 180px;
  height: 200px;
  flex: 0 0 auto;
  place-items: center;
}

.door-glow {
  position: absolute;
  width: 120px;
  height: 170px;
  border-radius: 60px 60px 8px 8px;
  background: rgb(255 123 91 / 32%);
  box-shadow: 0 0 70px rgb(255 115 95 / 45%);
  transform: perspective(350px) rotateY(-11deg);
}

.door {
  position: relative;
  display: grid;
  width: 104px;
  height: 154px;
  place-items: center;
  border: 2px solid rgb(255 255 255 / 45%);
  border-radius: 52px 52px 6px 6px;
  color: #fff;
  background: linear-gradient(155deg, #ff8a6b, #d45077);
  box-shadow: inset -14px 0 25px rgb(88 27 68 / 26%);
  font-size: 28px;
  font-weight: 300;
  transform: perspective(350px) rotateY(-11deg);
}

.key {
  position: absolute;
  color: #ffd3a7;
  font-style: normal;
  animation: twinkle 2.4s ease-in-out infinite;
}

.key-one {
  top: 22px;
  right: 8px;
}

.key-two {
  bottom: 28px;
  left: 2px;
  animation-delay: 0.8s;
}

.overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.overview article {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 19px;
  border: 1px solid rgb(222 224 235 / 80%);
  border-radius: 17px;
  background: rgb(255 255 255 / 82%);
  box-shadow: var(--shadow-sm);
}

.overview span {
  color: var(--ink-400);
  font-size: 11px;
  font-weight: 750;
}

.overview strong {
  color: var(--escape-dark);
  font-size: 22px;
}

.explorer-panel {
  padding: clamp(20px, 3vw, 32px);
  border: 1px solid rgb(224 227 237 / 85%);
  border-radius: 26px;
  background: rgb(255 255 255 / 82%);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(15px);
}

.step-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-heading > span {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  color: #fff;
  background: var(--escape-dark);
  font-size: 10px;
  font-weight: 900;
}

.step-heading h2 {
  margin: 0;
  color: var(--ink-950);
  font-size: 17px;
  letter-spacing: -0.03em;
}

.step-heading p {
  margin: 1px 0 0;
  color: var(--ink-400);
  font-size: 10px;
}

.step-heading.compact > span {
  width: 31px;
  height: 31px;
  border-radius: 9px;
  background: #eeeafd;
  color: var(--escape-purple);
}

.step-heading.compact h2 {
  font-size: 14px;
}

.region-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin-top: 17px;
}

.region-tabs button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border: 1px solid #e7e7ef;
  border-radius: 14px;
  color: var(--ink-600);
  background: #fafafe;
  cursor: pointer;
}

.region-tabs button:hover {
  border-color: #cbc3f7;
  transform: translateY(-1px);
}

.region-tabs button.active {
  border-color: #7460dc;
  color: #fff;
  background: linear-gradient(135deg, #7761e4, #5b46c9);
  box-shadow: 0 8px 18px rgb(92 70 203 / 22%);
}

.region-tabs strong {
  font-size: 13px;
}

.region-tabs small {
  font-size: 9px;
  opacity: 0.7;
}

.explorer-grid {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 24px;
  margin-top: 28px;
  padding-top: 26px;
  border-top: 1px solid #ececf2;
}

.branch-panel {
  min-width: 0;
}

.branch-list {
  display: grid;
  gap: 7px;
  margin-top: 15px;
}

.branch-list button {
  display: grid;
  grid-template-columns: 35px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 11px;
  border: 1px solid transparent;
  border-radius: 13px;
  color: var(--ink-600);
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.branch-list button:hover {
  background: #f8f7fe;
}

.branch-list button.active {
  border-color: #e1dcfb;
  background: #f1eefe;
}

.branch-icon {
  display: grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(145deg, var(--escape-coral), #db5279);
  font-size: 11px;
  font-weight: 900;
}

.branch-list button > span:nth-child(2) {
  display: grid;
  overflow: hidden;
}

.branch-list small {
  color: #9389bd;
  font-size: 7px;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.branch-list strong {
  overflow: hidden;
  color: var(--ink-800);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.branch-list em {
  color: var(--ink-400);
  font-size: 8px;
  font-style: normal;
}

.branch-list b {
  color: #a49cbf;
  font-size: 17px;
}

.theme-panel {
  min-width: 0;
}

.theme-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-link {
  flex: 0 0 auto;
  padding: 8px 11px;
  border-radius: 9px;
  color: var(--escape-purple);
  background: #f1eefe;
  font-size: 9px;
  font-weight: 800;
  text-decoration: none;
}

.theme-toolbar {
  display: flex;
  gap: 8px;
  margin: 15px 0;
}

.search-box {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #e5e6ee;
  border-radius: 11px;
  background: #fafafe;
}

.search-box span {
  color: #8e96a8;
  font-size: 17px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  padding: 9px 0;
  border: 0;
  outline: 0;
  color: var(--ink-800);
  background: transparent;
  font-size: 10px;
}

.favorite-filter {
  padding: 8px 12px;
  border: 1px solid #e6e3f3;
  border-radius: 11px;
  color: #736c8b;
  background: #fff;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.favorite-filter.active {
  border-color: #f0b6c1;
  color: #cc4462;
  background: #fff0f3;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
}

.theme-card {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid #e6e6ef;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(28 27 50 / 6%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.theme-card:hover {
  box-shadow: 0 15px 34px rgb(40 31 79 / 12%);
  transform: translateY(-3px);
}

.theme-cover {
  position: relative;
  display: flex;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  align-items: flex-end;
  justify-content: space-between;
  padding: 14px;
  background: #211d35;
}

.theme-cover::after {
  position: absolute;
  inset: 40% 0 0;
  background: linear-gradient(transparent, rgb(17 13 30 / 70%));
  content: '';
  pointer-events: none;
}

.theme-cover > img {
  position: absolute;
  width: 100%;
  height: 100%;
  inset: 0;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.theme-card:hover .theme-cover > img {
  transform: scale(1.035);
}

.theme-cover small {
  position: relative;
  z-index: 2;
  color: rgb(255 255 255 / 75%);
  font-size: 8px;
  font-weight: 800;
}

.favorite-button {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 10px;
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 50%;
  color: #fff;
  background: rgb(17 14 30 / 24%);
  cursor: pointer;
}

.favorite-button.active {
  color: #ff8ca0;
  background: rgb(255 255 255 / 92%);
}

.theme-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 14px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.title-row small {
  color: #9a91b9;
  font-size: 7px;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.title-row h3 {
  margin: 1px 0 0;
  color: var(--ink-950);
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.03em;
}

.difficulty {
  flex: 0 0 auto;
  padding: 3px 7px;
  border-radius: 999px;
  color: #6a5bc5;
  background: #efedfc;
  font-size: 7px;
  font-weight: 850;
}

.difficulty.hard {
  color: #c14958;
  background: #fff0f1;
}

.theme-intro {
  min-height: 75px;
  margin: 10px 0;
}

.theme-intro p {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--ink-600);
  font-size: 9px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.theme-intro a {
  display: inline-block;
  margin-top: 5px;
  color: var(--escape-purple);
  font-size: 8px;
  font-weight: 800;
  text-decoration: none;
}

.theme-intro a:hover {
  text-decoration: underline;
}

.theme-content dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 0 12px;
  padding: 9px 0;
  border-block: 1px solid #f0f0f4;
}

.theme-content dl div {
  padding: 0 8px;
  border-right: 1px solid #f0f0f4;
}

.theme-content dl div:first-child {
  padding-left: 0;
}

.theme-content dl div:last-child {
  padding-right: 0;
  border: 0;
}

.theme-content dt {
  color: var(--ink-400);
  font-size: 7px;
}

.theme-content dd {
  margin: 1px 0 0;
  color: var(--ink-800);
  font-size: 9px;
  font-weight: 800;
}

.theme-content > a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px;
  border-radius: 10px;
  color: #fff;
  background: var(--escape-dark);
  font-size: 9px;
  font-weight: 850;
  text-decoration: none;
  margin-top: auto;
}

.theme-content > a:hover {
  background: var(--escape-purple);
  transform: translateY(-1px);
}

.empty-state {
  display: grid;
  min-height: 260px;
  place-items: center;
  align-content: center;
  border: 1px dashed #dad7e8;
  border-radius: 17px;
  color: var(--ink-400);
  background: #fafafe;
  text-align: center;
}

.empty-state span {
  font-size: 28px;
}

.empty-state strong {
  color: var(--ink-800);
  font-size: 13px;
}

.empty-state p {
  margin: 2px 0 0;
  font-size: 9px;
}

.data-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 0;
  color: var(--ink-400);
  font-size: 9px;
  text-align: center;
}

.data-notice span {
  display: grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border: 1px solid #cdd2dc;
  border-radius: 50%;
  font-size: 8px;
  font-weight: 900;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.8) rotate(0);
  }

  50% {
    opacity: 1;
    transform: scale(1.2) rotate(45deg);
  }
}

@media (max-width: 840px) {
  .hero-visual {
    width: 130px;
  }

  .explorer-grid {
    grid-template-columns: 1fr;
  }

  .branch-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .escape-hero {
    min-height: 250px;
    padding: 28px 24px;
  }

  .hero-copy h1 {
    font-size: 32px;
  }

  .hero-copy p {
    font-size: 12px;
  }

  .hero-visual {
    display: none;
  }

  .overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .region-tabs,
  .branch-list,
  .theme-grid {
    grid-template-columns: 1fr;
  }

  .theme-panel-head,
  .theme-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .brand-link,
  .favorite-filter {
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .key {
    animation: none;
  }
}
</style>
