# SKALA Vue Playground

Vue 3 Composition API로 만든 세계 날씨 대시보드입니다. 실시간 날씨 조회·도시 비교를 중심으로 발로란트 일정, 서울 방탈출 검색, 번개 피하기 게임을 각각 독립된 화면으로 제공합니다.

## 배포 주소

- GitHub 저장소: https://github.com/LDY0912/skala-vue
- GitHub Pages: https://ldy0912.github.io/skala-vue/

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
