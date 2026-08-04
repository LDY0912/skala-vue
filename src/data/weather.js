export const weatherList = [
  {
    id: 'city_01',
    name: '서울',
    location: '대한민국 서울특별시',
    temp: 28,
    status: '맑음',
    humidity: 55,
    windSpeed: 2.5,
  },
  {
    id: 'city_02',
    name: '수원',
    location: '대한민국 경기도 수원시',
    temp: 24,
    status: '비',
    humidity: 78,
    windSpeed: 3.8,
  },
  {
    id: 'city_03',
    name: '부산',
    location: '대한민국 부산광역시',
    temp: 26,
    status: '구름',
    humidity: 68,
    windSpeed: 4.2,
  },
]

export function findWeatherById(cityId) {
  return weatherList.find((city) => city.id === cityId)
}
