export async function fetchValorantSchedule() {
  const response = await fetch(
    `${import.meta.env.BASE_URL}data/valorant-schedule.json?time=${Date.now()}`,
    { cache: 'no-store' },
  )

  if (!response.ok) {
    throw new Error('발로란트 대회 일정 데이터를 불러오지 못했습니다.')
  }

  return response.json()
}
