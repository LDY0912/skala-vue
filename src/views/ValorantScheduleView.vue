<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchValorantSchedule } from '../services/valorantSchedule.js'

const FAVORITE_TEAMS_KEY = 'skala-valorant-favorite-teams'
const KOREA_TIME_ZONE = 'Asia/Seoul'

const tabs = [
  { id: 'today', label: '오늘 경기' },
  { id: 'upcoming', label: '예정 경기' },
  { id: 'live', label: 'LIVE' },
  { id: 'past', label: '지난 결과' },
]
const regionOptions = ['전체', 'Pacific', 'Americas', 'EMEA', 'China']

const activeTab = ref('today')
const schedule = ref({ fetchedAt: null, upcoming: [], running: [], past: [] })
const searchQuery = ref('')
const selectedRegion = ref('전체')
const favoriteOnly = ref(false)
const favoriteTeamIds = ref(readFavorites())
const isLoading = ref(false)
const errorMessage = ref('')

function readFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITE_TEAMS_KEY))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function saveFavorites() {
  localStorage.setItem(FAVORITE_TEAMS_KEY, JSON.stringify(favoriteTeamIds.value))
}

async function loadSchedule() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    schedule.value = await fetchValorantSchedule()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

function getKoreaDateKey(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KOREA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function uniqueMatches(matches) {
  return [...new Map(matches.map((match) => [match.id, match])).values()]
}

const todayMatches = computed(() => {
  const today = getKoreaDateKey(new Date())
  return uniqueMatches([
    ...schedule.value.running,
    ...schedule.value.upcoming,
    ...schedule.value.past,
  ]).filter((match) => getKoreaDateKey(match.scheduledAt ?? match.beginAt) === today)
})

const matchesByTab = computed(() => ({
  today: todayMatches.value,
  upcoming: schedule.value.upcoming,
  live: schedule.value.running,
  past: schedule.value.past,
}))

function getRegion(match) {
  const description = [
    match.league?.name,
    match.serie?.name,
    match.serie?.fullName,
    match.tournament?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (/china|chinese/.test(description)) return 'China'
  if (/pacific|korea|japan|apac|asia|oceania|vietnam|thailand/.test(description)) {
    return 'Pacific'
  }
  if (/america|brazil|latin|canada/.test(description)) return 'Americas'
  if (/emea|europe|france|spain|turkey|dach|portugal/.test(description)) return 'EMEA'
  if (/masters|champions|international|world/.test(description)) return '국제'
  return '기타'
}

const filteredMatches = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('ko-KR')

  return matchesByTab.value[activeTab.value].filter((match) => {
    const matchesSearch =
      !query ||
      [
        match.name,
        match.league?.name,
        match.serie?.fullName,
        match.tournament?.name,
        ...match.opponents.map((team) => team.name),
      ]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('ko-KR').includes(query))
    const matchesRegion =
      selectedRegion.value === '전체' || getRegion(match) === selectedRegion.value
    const matchesFavorite =
      !favoriteOnly.value || match.opponents.some((team) => isFavorite(team.id))

    return matchesSearch && matchesRegion && matchesFavorite
  })
})

const favoriteTeams = computed(() => {
  const teams = [...schedule.value.upcoming, ...schedule.value.running, ...schedule.value.past]
    .flatMap((match) => match.opponents)
    .filter((team) => isFavorite(team.id))

  return [...new Map(teams.map((team) => [team.id, team])).values()]
})

const fetchedAt = computed(() => {
  if (!schedule.value.fetchedAt) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KOREA_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(schedule.value.fetchedAt))
})

function selectTab(tabId) {
  activeTab.value = tabId
  selectedRegion.value = '전체'
}

function isFavorite(teamId) {
  return favoriteTeamIds.value.includes(teamId)
}

function toggleFavorite(team) {
  if (!team?.id) return

  favoriteTeamIds.value = isFavorite(team.id)
    ? favoriteTeamIds.value.filter((id) => id !== team.id)
    : [...favoriteTeamIds.value, team.id]
  saveFavorites()
}

function matchTeams(match) {
  return [match.opponents[0] ?? null, match.opponents[1] ?? null]
}

function teamScore(match, team) {
  if (!team) return '-'
  return match.results.find((result) => result.teamId === team.id)?.score ?? 0
}

function formatScheduleDate(value) {
  if (!value) return '시간 미정'
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KOREA_TIME_ZONE,
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(value))
}

function formatScheduleTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KOREA_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function statusLabel(match) {
  if (match.status === 'running') return 'LIVE'
  if (match.status === 'finished') return '종료'
  if (match.status === 'canceled') return '취소'
  if (match.status === 'postponed') return '연기'
  return '예정'
}

function primaryStream(match) {
  return (
    match.streams.find((stream) => stream.main && stream.official) ??
    match.streams.find((stream) => stream.official) ??
    match.streams[0]
  )
}

onMounted(loadSchedule)
</script>

<template>
  <main class="valorant-page">
    <header class="valorant-hero">
      <div>
        <span class="eyebrow">PANDASCORE · VALORANT ESPORTS</span>
        <h1>발로란트 대회 일정</h1>
        <p>전 세계 VCT 경기를 한국 시간으로 확인하고 응원하는 팀을 저장해 보세요.</p>
      </div>
      <div class="hero-mark" aria-hidden="true">V</div>
    </header>

    <section class="summary-grid" aria-label="경기 일정 요약">
      <article>
        <span>오늘 경기</span><strong>{{ todayMatches.length }}</strong>
      </article>
      <article>
        <span>예정 경기</span><strong>{{ schedule.upcoming.length }}</strong>
      </article>
      <article class="live-summary">
        <span>진행 중</span><strong>{{ schedule.running.length }}</strong>
      </article>
      <article>
        <span>즐겨찾는 팀</span><strong>{{ favoriteTeams.length }}</strong>
      </article>
    </section>

    <section class="schedule-panel">
      <div class="panel-toolbar">
        <nav class="schedule-tabs" aria-label="경기 상태 선택">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id, live: tab.id === 'live' }"
            @click="selectTab(tab.id)"
          >
            {{ tab.label }}
            <b>{{ matchesByTab[tab.id].length }}</b>
          </button>
        </nav>

        <button type="button" class="refresh-button" :disabled="isLoading" @click="loadSchedule">
          {{ isLoading ? '불러오는 중' : '새로고침' }}
        </button>
      </div>

      <div class="filters">
        <label class="search-field">
          <span>팀·대회 검색</span>
          <input v-model.trim="searchQuery" placeholder="예: Gen.G, Pacific, Champions" />
        </label>
        <label>
          <span>지역</span>
          <select v-model="selectedRegion">
            <option v-for="region in regionOptions" :key="region">{{ region }}</option>
          </select>
        </label>
        <label class="favorite-check">
          <input v-model="favoriteOnly" type="checkbox" />
          즐겨찾는 팀만 보기
        </label>
      </div>

      <div class="data-state" :class="{ error: errorMessage }" aria-live="polite">
        <template v-if="errorMessage">⚠️ {{ errorMessage }}</template>
        <template v-else-if="fetchedAt">PandaScore 데이터 · {{ fetchedAt }} 업데이트</template>
        <template v-else>일정 데이터를 준비하고 있습니다.</template>
      </div>

      <div v-if="isLoading && !schedule.fetchedAt" class="empty-state">
        일정을 불러오는 중입니다...
      </div>
      <div v-else-if="filteredMatches.length === 0" class="empty-state">
        <strong>{{
          activeTab === 'live' ? '현재 진행 중인 경기가 없습니다.' : '조건에 맞는 경기가 없습니다.'
        }}</strong>
        <span>검색어나 지역 필터를 변경해 보세요.</span>
      </div>

      <div v-else class="match-list">
        <article v-for="match in filteredMatches" :key="match.id" class="match-card">
          <div class="match-meta">
            <div>
              <span class="status" :class="match.status">{{ statusLabel(match) }}</span>
              <strong>{{ match.serie?.fullName ?? match.league?.name ?? 'VALORANT' }}</strong>
              <small>{{ match.tournament?.name }} · {{ getRegion(match) }}</small>
            </div>
            <time :datetime="match.scheduledAt">
              <b>{{ formatScheduleDate(match.scheduledAt) }}</b>
              <strong>{{ formatScheduleTime(match.scheduledAt) }} KST</strong>
            </time>
          </div>

          <div class="versus-row">
            <div
              v-for="(team, index) in matchTeams(match)"
              :key="team?.id ?? `tbd-${index}`"
              class="team"
              :class="{ winner: team?.id === match.winnerId }"
            >
              <div class="team-logo">
                <img v-if="team?.imageUrl" :src="team.imageUrl" :alt="`${team.name} 로고`" />
                <span v-else>{{ team?.acronym?.slice(0, 2) ?? '?' }}</span>
              </div>
              <div>
                <strong>{{ team?.name ?? '상대 미정' }}</strong>
                <small>{{ team?.location || 'TBD' }}</small>
              </div>
              <button
                v-if="team"
                type="button"
                class="favorite-button"
                :class="{ active: isFavorite(team.id) }"
                :aria-label="`${team.name} 즐겨찾기 ${isFavorite(team.id) ? '삭제' : '추가'}`"
                @click="toggleFavorite(team)"
              >
                {{ isFavorite(team.id) ? '★' : '☆' }}
              </button>
              <b v-if="match.status === 'finished'" class="score">{{ teamScore(match, team) }}</b>
            </div>

            <div class="versus-center">
              <strong>{{ match.status === 'finished' ? 'FINAL' : 'VS' }}</strong>
              <span>BO{{ match.numberOfGames || '?' }}</span>
            </div>
          </div>

          <footer class="match-footer">
            <span>{{ match.name }}</span>
            <a
              v-if="primaryStream(match)"
              :href="primaryStream(match).url"
              target="_blank"
              rel="noopener noreferrer"
            >
              ▶ 중계 보기
            </a>
            <span v-else class="no-stream">중계 링크 미정</span>
          </footer>
        </article>
      </div>
    </section>

    <p class="source-note">
      일정과 결과 데이터 제공: PandaScore · 세부 일정은 대회 운영 상황에 따라 변경될 수 있습니다.
    </p>
  </main>
</template>

<style scoped>
.valorant-page {
  min-width: 0;
  color: #253b4b;
}
.valorant-hero {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 30px 34px;
  border: 1px solid rgb(255 255 255 / 9%);
  border-radius: 22px;
  background:
    radial-gradient(circle at 88% 16%, rgb(255 70 85 / 24%), transparent 30%),
    linear-gradient(135deg, #0f1923 0%, #172a38 56%, #6e2634 100%);
  color: #fff;
  box-shadow: 0 18px 42px rgb(22 37 49 / 24%);
}
.valorant-hero::after {
  position: absolute;
  right: 100px;
  width: 120px;
  height: 180%;
  border: 1px solid rgb(255 255 255 / 8%);
  content: '';
  transform: rotate(24deg);
}
.eyebrow {
  color: #ff8b93;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.1em;
}
.valorant-hero h1,
.valorant-hero p {
  margin: 0;
}
.valorant-hero h1 {
  font-size: 31px;
  font-weight: 950;
  letter-spacing: -0.04em;
}
.valorant-hero p {
  margin-top: 4px;
  color: #cfdae0;
  font-size: 12px;
}
.hero-mark {
  display: grid;
  z-index: 1;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 2px solid #ff4655;
  color: #ff4655;
  font-size: 32px;
  font-weight: 950;
  transform: skew(-8deg);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.summary-grid article {
  padding: 15px 16px;
  border: 1px solid #e1e5ec;
  border-radius: 14px;
  background: rgb(255 255 255 / 90%);
  box-shadow: 0 7px 20px rgb(24 37 63 / 5%);
}
.summary-grid span,
.summary-grid strong {
  display: block;
}
.summary-grid span {
  color: #71818c;
  font-size: 9px;
  font-weight: 700;
}
.summary-grid strong {
  color: #1d394b;
  font-size: 23px;
  font-weight: 950;
}
.summary-grid .live-summary strong {
  color: #ee4250;
}
.schedule-panel {
  padding: 19px;
  border: 1px solid #dfe4ec;
  border-radius: 18px;
  background: rgb(249 250 252 / 88%);
  box-shadow: 0 10px 30px rgb(24 37 63 / 6%);
}
.panel-toolbar,
.schedule-tabs,
.filters,
.match-meta,
.match-meta > div,
.versus-row,
.team,
.match-footer {
  display: flex;
  align-items: center;
}
.panel-toolbar {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.schedule-tabs {
  gap: 4px;
  padding: 4px;
  border-radius: 9px;
  background: #e9eef1;
}
.schedule-tabs button {
  padding: 7px 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #607582;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}
.schedule-tabs button b {
  margin-left: 3px;
  color: #98a6af;
  font-size: 9px;
}
.schedule-tabs button.active {
  background: #fff;
  color: #e43f4d;
  box-shadow: 0 2px 7px rgb(24 50 68 / 11%);
}
.schedule-tabs button.live {
  color: #d83745;
}
.refresh-button {
  padding: 7px 10px;
  border: 1px solid #b8c5cd;
  border-radius: 6px;
  background: #fff;
  color: #486170;
  font: inherit;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
}
.filters {
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}
.filters label {
  display: grid;
  gap: 3px;
  color: #6e808b;
  font-size: 9px;
  font-weight: 800;
}
.filters .search-field {
  flex: 1;
}
.filters input,
.filters select {
  min-height: 34px;
  padding: 7px 9px;
  border: 1px solid #cbd5db;
  border-radius: 6px;
  background: #fff;
  color: #2c4657;
  font: inherit;
  font-size: 11px;
}
.filters select {
  min-width: 105px;
}
.filters .favorite-check {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 34px;
  padding: 0 9px;
  border: 1px solid #cbd5db;
  border-radius: 6px;
  background: #fff;
  color: #536a78;
  white-space: nowrap;
}
.favorite-check input {
  min-height: auto;
}
.data-state {
  margin-bottom: 10px;
  padding: 7px 9px;
  border-radius: 6px;
  background: #eaf5f8;
  color: #33728c;
  font-size: 10px;
}
.data-state.error {
  background: #fff0f0;
  color: #b54444;
}
.match-list {
  display: grid;
  gap: 11px;
}
.match-card {
  overflow: hidden;
  border: 1px solid #dfe4ea;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgb(28 51 67 / 6%);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
.match-card:hover {
  border-color: #edc9cd;
  box-shadow: 0 11px 26px rgb(85 40 48 / 9%);
  transform: translateY(-1px);
}
.match-meta {
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid #edf0f2;
  background: #fbfcfd;
}
.match-meta > div {
  flex-wrap: wrap;
  gap: 6px;
}
.match-meta strong {
  font-size: 11px;
  font-weight: 800;
}
.match-meta small {
  width: 100%;
  margin-left: 47px;
  color: #7a8a94;
  font-size: 9px;
}
.status {
  min-width: 40px;
  padding: 2px 5px;
  border-radius: 4px;
  background: #e7edf0;
  color: #5d717d;
  font-size: 8px;
  font-weight: 900;
  text-align: center;
}
.status.running {
  background: #ffe4e7;
  color: #df3543;
}
.status.finished {
  background: #e7f4ed;
  color: #347455;
}
.match-meta time {
  display: grid;
  flex: 0 0 auto;
  text-align: right;
}
.match-meta time b {
  color: #6b7e8a;
  font-size: 9px;
}
.match-meta time strong {
  color: #1d3c50;
  font-size: 12px;
}
.versus-row {
  position: relative;
  justify-content: center;
  gap: 52px;
  padding: 16px 12px;
}
.team {
  position: relative;
  flex: 1;
  gap: 9px;
  min-width: 0;
  max-width: 280px;
}
.team:nth-child(2) {
  flex-direction: row-reverse;
  text-align: right;
}
.team-logo {
  display: grid;
  overflow: hidden;
  flex: 0 0 auto;
  width: 45px;
  height: 45px;
  place-items: center;
  border: 1px solid #e0e6e9;
  border-radius: 9px;
  background: #f5f7f8;
}
.team-logo img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}
.team-logo span {
  color: #7d8d96;
  font-size: 12px;
  font-weight: 850;
}
.team strong,
.team small {
  display: block;
}
.team strong {
  overflow: hidden;
  color: #263e4e;
  font-size: 12px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.team small {
  color: #8b989f;
  font-size: 9px;
}
.team.winner strong {
  color: #d63240;
}
.favorite-button {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: #aab4ba;
  font-size: 19px;
  cursor: pointer;
}
.favorite-button.active {
  color: #ffb21c;
}
.score {
  min-width: 24px;
  color: #223b4c;
  font-size: 22px;
  font-weight: 950;
  text-align: center;
}
.versus-center {
  position: absolute;
  left: 50%;
  display: grid;
  text-align: center;
  transform: translateX(-50%);
}
.versus-center strong {
  color: #e23c4a;
  font-size: 11px;
  font-weight: 950;
}
.versus-center span {
  color: #84939c;
  font-size: 9px;
  font-weight: 750;
}
.match-footer {
  justify-content: space-between;
  gap: 10px;
  padding: 7px 12px;
  border-top: 1px solid #edf0f2;
  background: #fbfcfd;
  color: #7a8992;
  font-size: 9px;
}
.match-footer a {
  color: #dc3543;
  font-weight: 850;
  text-decoration: none;
}
.no-stream {
  color: #9ba6ac;
}
.empty-state {
  display: grid;
  gap: 3px;
  padding: 55px 15px;
  color: #768893;
  text-align: center;
}
.empty-state strong {
  font-size: 13px;
}
.empty-state span {
  font-size: 10px;
}
.source-note {
  margin: 10px 0 0;
  color: #89969e;
  font-size: 9px;
  text-align: center;
}
@media (max-width: 720px) {
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }
  .panel-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .schedule-tabs {
    overflow-x: auto;
  }
  .schedule-tabs button {
    flex: 1 0 auto;
  }
  .filters {
    align-items: stretch;
    flex-wrap: wrap;
  }
  .filters .search-field {
    flex-basis: 100%;
  }
  .filters label {
    flex: 1;
  }
  .versus-row {
    gap: 32px;
  }
  .team {
    flex-direction: column;
    text-align: center;
  }
  .team:nth-child(2) {
    flex-direction: column;
    text-align: center;
  }
  .favorite-button {
    position: absolute;
    top: 0;
    right: 0;
  }
  .team:nth-child(2) .favorite-button {
    right: auto;
    left: 0;
  }
}
@media (max-width: 480px) {
  .valorant-hero {
    padding: 20px;
  }
  .valorant-hero h1 {
    font-size: 22px;
  }
  .hero-mark {
    display: none;
  }
  .match-meta {
    align-items: flex-start;
  }
  .match-meta small {
    margin-left: 0;
  }
  .versus-row {
    align-items: flex-start;
    gap: 25px;
  }
  .team-logo {
    width: 39px;
    height: 39px;
  }
  .team-logo img {
    width: 30px;
    height: 30px;
  }
  .team strong {
    max-width: 100px;
    white-space: normal;
  }
  .score {
    font-size: 18px;
  }
  .match-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
