<script setup>
import { ref } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
])

const showDetail = (cityName, status) => {
  alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

const search = ref('')
const selectedCity = ref('')
selectedCity.value = '카드를 클릭하거나 검색해 보세요.'
</script>

<template>
  <h1>과제 1: 날씨 (Mockup)</h1>
  <hr />
  <div>
    <h3>도시 검색</h3>
    <input
      type="text"
      :value="search"
      @input="(e) => (search = e.target.value)"
      placeholder="검색할 도시 이름 입력"
    />
    <p>검색 중인 도시: {{ search }}</p>
  </div>
  <div>
    <h3>지역별 날씨 현황</h3>
    <div
      class="city"
      v-for="weather in weatherList"
      :key="weather.id"
      @click="selectedCity = `${weather.name}이 선택되었습니다.`"
    >
      <p>{{ weather.name }} ({{ weather.status }})</p>
      <p>현재 기온: {{ weather.temp }}℃</p>

      <p v-if="weather.temp >= 25">더움 (25도 이상)</p>
      <p v-else>신선함 (25도 미만)</p>

      <button @click.stop="showDetail(weather.name, weather.status)">상세보기</button>
    </div>

    <div>
      {{ selectedCity }}
    </div>
  </div>
</template>

<style scoped>
/* 전체 화면 */
:global(body) {
  min-width: 320px;
  background: #ffffff;
}

h1 {
  margin: 0;
  color: #183b5b;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.4;
}

h1::before {
  content: '🌤️';
  margin-right: 10px;
  font-size: 18px;
}

hr {
  height: 1px;
  margin: 10px 0 20px;
  border: 0;
  background: #e3e8ed;
}

/* 검색 영역과 날씨 목록 영역 */
template > div,
h1 ~ div {
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid #e3e8ed;
  border-radius: 7px;
  background: #f7f9fa;
}

h3 {
  margin: 0 0 1px;
  color: #315675;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}

h1 + hr + div h3::before {
  content: '🔍';
  margin-right: 8px;
}

h1 + hr + div + div h3::before {
  content: '🗺️';
  margin-right: 8px;
}

input {
  display: block;
  width: calc(100% - 44px);
  height: 28px;
  padding: 3px 8px;
  border: 1px solid #8b8b8b;
  border-radius: 0;
  background: #fff;
  color: #34495e;
  font: inherit;
  font-size: 13px;
  outline: none;
}

input:focus {
  border-color: #438ec5;
  box-shadow: 0 0 0 1px #438ec5;
}

p {
  margin: 0;
  color: #315675;
  font-size: 13px;
  line-height: 1.55;
}

h1 + hr + div > p {
  margin-top: 2px;
}

.city {
  position: relative;
  min-height: 82px;
  margin: 6px 0 9px;
  padding: 10px 78px 9px 10px;
  border: 1px solid #d8dfe5;
  border-radius: 5px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgb(20 50 75 / 7%);
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;
}

.city:hover {
  border-color: #9eb8ca;
  transform: translateY(-1px);
}

.city > p:nth-of-type(3) {
  display: inline-block;
  margin-top: 2px;
  padding: 2px 9px;
  border-radius: 4px;
  color: #ffffff;
  font-size: 11px;
  line-height: 1.65;
}

.city > p:nth-of-type(3)::before {
  margin-right: 5px;
}

.city:nth-of-type(1) > p:nth-of-type(3),
.city:nth-of-type(3) > p:nth-of-type(3) {
  background: #ff6464;
}

.city:nth-of-type(1) > p:nth-of-type(3)::before,
.city:nth-of-type(3) > p:nth-of-type(3)::before {
  content: '🔥';
}

.city:nth-of-type(2) > p:nth-of-type(3) {
  background: #42b9ed;
}

.city:nth-of-type(2) > p:nth-of-type(3)::before {
  content: '❄️';
}

button {
  position: absolute;
  top: 12px;
  right: 9px;
  min-width: 59px;
  height: 28px;
  padding: 2px 7px;
  border: 1px solid #999;
  background: #f7f7f7;
  color: #284966;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}

button:hover {
  background: #eeeeee;
}

/* 선택 안내 문구 */
h1 + hr + div + div > div:last-child:not(.city) {
  margin: 12px -15px -61px;
  padding: 8px 12px;
  border-radius: 5px;
  background: #e2f5e6;
  color: #18944c;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 480px) {
  input {
    width: 100%;
  }

  .city {
    padding-right: 72px;
  }
}
</style>
