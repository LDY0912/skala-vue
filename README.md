# SKALA Vue Playground

Vue 3 Composition API로 만든 세계 날씨 대시보드입니다. 실시간 날씨 조회·도시 비교를 중심으로 발로란트 일정, 서울 방탈출 검색, 번개 피하기 게임을 각각 독립된 화면으로 제공합니다.

## 배포 주소

- GitHub 저장소: https://github.com/LDY0912/skala-vue
- GitHub Pages: https://ldy0912.github.io/skala-vue/

## 필수 요구사항 확인표

| 요구사항 | 구현 위치 및 확인 내용 |
| --- | --- |
| Vue 컴포넌트 3개 이상 | `src/components/weather/`의 `SearchBar`, `WeatherCard`, `UnitToggler`, `WorldClockSidebar`, `FiveDayForecast` 등으로 화면을 분리했습니다. |
| `ref`, `reactive`, `computed` | `FinalWeatherView.vue`에서 검색어·요청 상태는 `ref`, 도시별 데이터는 `reactive`, 검색 결과·즐겨찾기 목록은 `computed`로 관리합니다. |
| Props와 Emits | `WeatherCard.vue`가 도시 정보를 Props로 받고 `select-card`, `click-detail`, `remove-card` 이벤트를 부모로 전달합니다. |
| Vue Router | `src/router/index.js`에 홈, 날씨 상세, 비교, 발로란트, 방탈출, 게임, 404 경로가 있으며 동적 경로 `/weather/:cityId`도 사용합니다. |
| Pinia | `weatherUnitStore.js`가 여러 날씨 화면의 온도 단위를 공유하고 `escapeRoomStore.js`가 검색·필터·즐겨찾기를 관리합니다. |
| Axios API 호출 | `weatherApi.js`의 Axios 인스턴스로 OpenWeather 현재 날씨와 예보 API를 호출합니다. |
| 로딩·오류 처리 | 홈·상세·비교 화면에서 로딩 상태, 사용자용 오류 메시지, 다시 시도 버튼을 제공합니다. |
| ESLint·빌드 | `npm run lint`와 `npm run build`로 검증하며 Pages 워크플로도 lint 후 빌드합니다. |
| 주석 | 각 핵심 파일에 상태 선택 이유, Props/Emits 흐름, Router·Pinia·Axios 역할을 설명하는 주석을 작성했습니다. |

## 실행 방법

Node.js 22.18 이상이 필요합니다.

```sh
npm install
npm run dev
```

실시간 날씨를 사용하려면 프로젝트 루트의 `.env.local`에 OpenWeather API 키를 설정합니다.

```dotenv
VITE_OPENWEATHER_API_KEY=your_api_key
```

## 검사 및 빌드

```sh
npm run lint
npm run build
```

`main` 브랜치에 push하면 GitHub Actions가 의존성 설치, 데이터 갱신, lint, Vite 빌드를 차례로 실행한 뒤 GitHub Pages에 배포합니다.
